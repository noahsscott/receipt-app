// src/utils/OCRProcessor.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class OCRProcessor {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async processReceiptImage(imageFile, options = {}) {
    const startTime = Date.now();
    
    try {
      // Convert image to base64
      const imageData = await this.fileToBase64(imageFile);
      
      // Create the prompt for structured extraction
      const prompt = this.createExtractionPrompt();
      
      // Call Gemini Flash
      const result = await this.callGeminiFlash(imageData, prompt);
      
      // Parse the response
      const parsedData = this.parseGeminiResponse(result);
      
      return {
        success: true,
        confidence: parsedData.confidence || 90,
        extractedText: parsedData.rawText || '',
        parsedData: {
          merchant: parsedData.merchant,
          total: parsedData.total,
          date: parsedData.date,
          items: parsedData.items || []
        },
        processingTime: Date.now() - startTime,
        error: null
      };
      
    } catch (error) {
      console.error('OCR Processing Error:', error);
      return {
        success: false,
        confidence: 0,
        extractedText: '',
        parsedData: { merchant: null, total: null, date: null, items: [] },
        processingTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  createExtractionPrompt() {
    return `Analyze this receipt image and extract the following information. Return ONLY a valid JSON object with this exact structure:

{
  "merchant": "store or business name",
  "total": 99.99,
  "date": "MM/DD/YYYY",
  "items": [
    {"name": "item name", "price": 9.99}
  ],
  "confidence": 95,
  "rawText": "brief summary of what you can read"
}

Rules:
- Return ONLY the JSON object, no other text
- Use null for missing data
- Convert all dates to MM/DD/YYYY format
- Round all prices to 2 decimal places
- For total, find the final amount paid (not subtotal)
- For merchant, use the business name at the top
- Confidence should be 0-100 based on image quality
- Items array can be empty if individual items unclear
- Raw text should be a brief summary of readable text`;
  }

  async callGeminiFlash(imageData, prompt) {
    try {
      // Convert base64 data URL to just base64
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.split(';')[0].split(':')[1];

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  parseGeminiResponse(responseText) {
    try {
      // Clean the response - remove any markdown formatting
      let cleanedResponse = responseText.trim();
      
      // Remove code block markers if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      return {
        merchant: parsed.merchant || null,
        total: this.parseNumber(parsed.total),
        date: this.parseDate(parsed.date),
        items: Array.isArray(parsed.items) ? parsed.items : [],
        confidence: parsed.confidence || 85,
        rawText: parsed.rawText || ''
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Failed to parse receipt data from AI response');
    }
  }

  parseNumber(value) {
    if (value === null || value === undefined) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.round(num * 100) / 100;
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Try to parse various date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,  // MM/DD/YYYY or M/D/YY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/,   // MM-DD-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/      // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let [, first, second, third] = match;
        
        // Convert 2-digit year to 4-digit
        if (third.length === 2) {
          third = parseInt(third) > 50 ? `19${third}` : `20${third}`;
        }
        
        // Return in MM/DD/YYYY format
        if (format === formats[2]) { // YYYY-MM-DD format
          return `${second.padStart(2, '0')}/${third.padStart(2, '0')}/${first}`;
        } else {
          return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${third}`;
        }
      }
    }
    
    return dateStr; // Return as-is if no format matches
  }
}

// Export singleton instance
export const ocrProcessor = new OCRProcessor();

// Export main function for compatibility with existing code
export async function processReceiptImage(imageFile, options = {}) {
  return ocrProcessor.processReceiptImage(imageFile, options);
}

// Export class for advanced usage
export { OCRProcessor };