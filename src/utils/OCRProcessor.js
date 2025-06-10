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
      
      // Create the enhanced prompt focused on line items
      const prompt = this.createLineItemExtractionPrompt();
      
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

  createLineItemExtractionPrompt() {
    return `Analyze this receipt image and extract ALL the information including EVERY individual item purchased. Return ONLY a valid JSON object with this exact structure:

{
  "merchant": "store or business name",
  "total": 99.99,
  "date": "MM/DD/YYYY",
  "items": [
    {
      "name": "Product Name",
      "price": 12.99,
      "quantity": 1,
      "category": "food"
    },
    {
      "name": "Another Product",
      "price": 5.49,
      "quantity": 2,
      "category": "household"
    }
  ],
  "subtotal": 85.50,
  "tax": 7.50,
  "confidence": 95,
  "rawText": "brief summary of what you can read"
}

CRITICAL REQUIREMENTS for items array:
- Extract EVERY single item/product listed on the receipt
- Each item must have: name, price, quantity (default to 1 if not clear)
- For price, use the individual item price, not total for quantity
- If an item shows "2 x Apples $3.00", the price should be 1.50, quantity should be 2
- Include ALL items, even small ones like bags, fees, discounts
- For category, use: food, drink, household, personal, health, other
- DO NOT skip items - be thorough

Other rules:
- Use null for missing merchant/date/total data
- Convert all dates to MM/DD/YYYY format
- Round all prices to 2 decimal places
- For total, find the final amount paid
- Confidence should be 0-100 based on image clarity
- If you can't read individual items clearly, set items to empty array but explain in rawText`;
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
      console.log('Raw Gemini response:', responseText);
      
      // Clean the response - remove any markdown formatting
      let cleanedResponse = responseText.trim();
      
      // Remove code block markers if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);
      
      console.log('Parsed Gemini response:', parsed);
      
      // Validate and clean items array
      const items = this.validateAndCleanItems(parsed.items || []);
      
      // Validate required fields
      return {
        merchant: parsed.merchant || null,
        total: this.parseNumber(parsed.total),
        date: this.parseDate(parsed.date),
        items: items,
        subtotal: this.parseNumber(parsed.subtotal),
        tax: this.parseNumber(parsed.tax),
        confidence: parsed.confidence || 85,
        rawText: parsed.rawText || responseText.substring(0, 200)
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', responseText);
      console.error('Parse error:', error);
      
      // Try to extract items manually as fallback
      const fallbackItems = this.extractItemsFallback(responseText);
      
      throw new Error('Failed to parse receipt data from AI response');
    }
  }

  validateAndCleanItems(items) {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array:', items);
      return [];
    }

    const cleanedItems = items
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        name: String(item.name || 'Unknown Item').trim(),
        price: this.parseNumber(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        category: String(item.category || 'other').toLowerCase(),
        subtotal: (this.parseNumber(item.price) || 0) * (parseInt(item.quantity) || 1)
      }))
      .filter(item => item.name !== 'Unknown Item' || item.price > 0);

    console.log('Cleaned items:', cleanedItems);
    return cleanedItems;
  }

  extractItemsFallback(responseText) {
    // Fallback method to extract items if JSON parsing fails
    console.log('Attempting fallback item extraction from:', responseText);
    
    const items = [];
    const lines = responseText.split('\n');
    
    // Look for patterns like "item name $price" or "item name price"
    const itemPattern = /(.+?)\s+\$?(\d+\.?\d{0,2})/;
    
    for (const line of lines) {
      const match = line.trim().match(itemPattern);
      if (match && match[1].length > 2) {
        const [, name, price] = match;
        const cleanName = name.replace(/^\d+\s*x?\s*/i, '').trim();
        const cleanPrice = parseFloat(price);
        
        if (cleanPrice > 0 && cleanPrice < 1000) {
          items.push({
            name: cleanName,
            price: cleanPrice,
            quantity: 1,
            category: 'other',
            subtotal: cleanPrice
          });
        }
      }
    }
    
    console.log('Fallback extracted items:', items);
    return items;
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