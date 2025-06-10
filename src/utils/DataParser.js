// src/utils/DataParser.js
// Enhanced receipt data parsing with improved accuracy and error handling

class DataParser {
  constructor() {
    this.version = '1.0';
    this.confidenceThresholds = {
      merchant: 70,
      total: 80,
      date: 75,
      items: 60
    };
  }

  /**
   * Main parsing function - processes OCR text and returns structured data
   * @param {string} ocrText - Raw text from OCR
   * @param {number} baseConfidence - Base confidence from OCR engine
   * @returns {Object} Parsed receipt data with confidence scores
   */
  parseReceiptText(ocrText, baseConfidence = 85) {
    console.log('Parsing receipt text:', ocrText?.substring(0, 100) + '...');
    
    if (!ocrText || typeof ocrText !== 'string') {
      return this.createEmptyResult(0, 'No text provided for parsing');
    }

    const cleanText = this.cleanOCRText(ocrText);
    
    try {
      const parsedData = {
        merchant: this.extractMerchant(cleanText),
        total: this.extractTotal(cleanText),
        date: this.extractDate(cleanText),
        items: this.extractLineItems(cleanText),
        metadata: {
          confidence: baseConfidence,
          rawText: ocrText,
          cleanedText: cleanText,
          parsingVersion: this.version,
          timestamp: new Date().toISOString(),
          patterns: this.getMatchedPatterns(cleanText)
        }
      };

      // Calculate overall parsing confidence
      const parsingConfidence = this.calculateParsingConfidence(parsedData, baseConfidence);
      parsedData.metadata.parsingConfidence = parsingConfidence;

      console.log('Parsing completed:', parsedData);
      return parsedData;

    } catch (error) {
      console.error('Parsing error:', error);
      return this.createEmptyResult(0, `Parsing failed: ${error.message}`);
    }
  }

  /**
   * Clean and normalize OCR text for better parsing
   */
  cleanOCRText(text) {
    if (!text) return '';

    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Fix common OCR errors
      .replace(/[oO](?=\d)/g, '0')  // O to 0 when followed by digit
      .replace(/(?<=\d)[oO]/g, '0') // O to 0 when preceded by digit
      .replace(/[lI](?=\d)/g, '1')  // l/I to 1 when followed by digit
      .replace(/[S](?=\d)/g, '5')   // S to 5 when followed by digit
      .replace(/[Z](?=\d)/g, '2')   // Z to 2 when followed by digit
      // Remove excessive punctuation
      .replace(/[.,]{2,}/g, '.')
      // Normalize currency symbols
      .replace(/[$＄]/g, '$')
      .replace(/[€]/g, '€')
      .replace(/[£]/g, '£')
      .trim();
  }

  /**
   * Extract merchant name from receipt text
   */
  extractMerchant(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Merchant is typically in the first few lines
    const candidateLines = lines.slice(0, 5);
    
    // Patterns that indicate merchant names
    const merchantPatterns = [
      // Skip common receipt headers
      /^(receipt|store|shop|invoice|bill)/i,
      // Look for business-like names
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*$/,
      // Names with common business suffixes
      /\b(inc|llc|corp|ltd|co|store|market|shop|restaurant|cafe|deli)\b/i,
      // Chain store patterns
      /^(target|walmart|costco|kroger|safeway|whole foods|trader joe|cvs|walgreens)/i
    ];

    for (const line of candidateLines) {
      // Skip obviously non-merchant lines
      if (this.isSkippableLine(line)) continue;
      
      // Check if line looks like a merchant name
      if (line.length >= 3 && line.length <= 50) {
        // Remove common prefixes/suffixes
        const cleaned = line
          .replace(/^(store|shop)[\s#]*\d+/i, '')
          .replace(/[\s-]+$/, '')
          .trim();
        
        if (cleaned.length >= 3) {
          return {
            value: cleaned,
            confidence: this.calculateMerchantConfidence(cleaned, line),
            source: 'header_extraction'
          };
        }
      }
    }

    // Fallback: look for any capitalized words that might be merchant
    const fallbackMatch = text.match(/\b[A-Z][A-Z\s]{2,20}\b/);
    if (fallbackMatch) {
      const merchant = fallbackMatch[0].trim();
      return {
        value: merchant,
        confidence: 40,
        source: 'fallback_caps'
      };
    }

    return {
      value: null,
      confidence: 0,
      source: 'not_found'
    };
  }

  /**
   * Extract total amount from receipt text
   */
  extractTotal(text) {
    // Multiple patterns for finding totals
    const totalPatterns = [
      // "Total: $XX.XX" or "TOTAL $XX.XX"
      /(?:total|sum|amount\s+due|balance|pay)\s*:?\s*[$€£]?(\d+\.?\d{0,2})/gi,
      // Amount at end of line with currency
      /[$€£]\s*(\d+\.\d{2})\s*$/gm,
      // Standalone amount (last resort)
      /\b(\d+\.\d{2})\b/g
    ];

    const amounts = [];

    for (const pattern of totalPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) { // Reasonable range
          amounts.push({
            value: amount,
            confidence: this.calculateAmountConfidence(match[0], pattern),
            source: match[0].trim(),
            context: this.getAmountContext(text, match.index)
          });
        }
      }
    }

    if (amounts.length === 0) {
      return {
        value: null,
        confidence: 0,
        source: 'not_found'
      };
    }

    // Sort by confidence and return best match
    amounts.sort((a, b) => b.confidence - a.confidence);
    
    // If we have multiple amounts, prefer the one that looks most like a total
    const bestAmount = amounts.find(amt => 
      amt.source.toLowerCase().includes('total') ||
      amt.source.toLowerCase().includes('amount') ||
      amt.source.toLowerCase().includes('due')
    ) || amounts[0];

    return bestAmount;
  }

  /**
   * Extract date from receipt text
   */
  extractDate(text) {
    const datePatterns = [
      // MM/DD/YYYY or MM/DD/YY
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
      // DD/MM/YYYY or DD/MM/YY (European format)
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
      // MM-DD-YYYY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/g,
      // YYYY-MM-DD (ISO format)
      /(\d{4})-(\d{1,2})-(\d{1,2})/g,
      // Month DD, YYYY
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi,
      // DD Month YYYY
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi
    ];

    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateResult = this.parseMatchedDate(match, pattern);
        
        if (dateResult && dateResult.date) {
          const parsedDate = new Date(dateResult.date);
          
          // Validate date is reasonable (not too old, not in future)
          if (parsedDate >= oneYearAgo && parsedDate <= oneMonthFromNow) {
            return {
              value: dateResult.formatted,
              confidence: dateResult.confidence,
              source: match[0],
              parsed: parsedDate
            };
          }
        }
      }
    }

    return {
      value: null,
      confidence: 0,
      source: 'not_found'
    };
  }

  /**
   * Extract line items from receipt text (basic implementation)
   */
  extractLineItems(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const items = [];

    // Simple pattern: look for lines with both text and price
    const itemPattern = /^(.+?)\s+[$€£]?(\d+\.\d{2})$/;

    for (const line of lines) {
      // Skip header/footer lines
      if (this.isSkippableLine(line)) continue;
      
      const match = line.match(itemPattern);
      if (match) {
        const [, name, price] = match;
        const cleanName = name.replace(/^\d+\s*/, '').trim(); // Remove quantity prefix
        
        if (cleanName.length >= 2 && parseFloat(price) > 0) {
          items.push({
            name: cleanName,
            price: parseFloat(price),
            confidence: 60, // Basic confidence for line items
            source: line
          });
        }
      }
    }

    return {
      value: items,
      confidence: items.length > 0 ? 65 : 0,
      count: items.length,
      source: 'pattern_matching'
    };
  }

  // Helper methods

  calculateParsingConfidence(parsedData, baseConfidence) {
    let score = baseConfidence * 0.3; // Base OCR confidence (30% weight)
    
    // Add confidence from individual fields
    if (parsedData.merchant?.confidence) score += parsedData.merchant.confidence * 0.25;
    if (parsedData.total?.confidence) score += parsedData.total.confidence * 0.3;
    if (parsedData.date?.confidence) score += parsedData.date.confidence * 0.15;
    
    return Math.min(Math.round(score), 100);
  }

  calculateMerchantConfidence(cleaned, original) {
    let confidence = 50;
    
    // Boost confidence for business-like patterns
    if (/\b(inc|llc|corp|ltd|store|market|shop)\b/i.test(cleaned)) confidence += 20;
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*$/.test(cleaned)) confidence += 15;
    if (cleaned.length >= 3 && cleaned.length <= 25) confidence += 10;
    if (!/\d/.test(cleaned)) confidence += 10; // No numbers is good
    
    return Math.min(confidence, 95);
  }

  calculateAmountConfidence(matchText, pattern) {
    let confidence = 40;
    
    // Higher confidence for explicit total indicators
    if (/total|sum|amount\s+due/i.test(matchText)) confidence += 30;
    if (/\$/.test(matchText)) confidence += 10; // Has currency symbol
    if (/\.\d{2}$/.test(matchText)) confidence += 15; // Proper cents format
    
    return Math.min(confidence, 95);
  }

  parseMatchedDate(match, pattern) {
    try {
      // Handle different date formats based on the pattern used
      const fullMatch = match[0];
      let year, month, day;

      if (/\d{4}-\d{1,2}-\d{1,2}/.test(fullMatch)) {
        // YYYY-MM-DD format
        [, year, month, day] = match;
      } else if (/[a-zA-Z]/.test(fullMatch)) {
        // Month name formats - implement month name to number conversion
        const monthNames = {
          jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
          jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
        };
        
        if (match.length === 4) { // Month DD, YYYY
          const monthStr = match[1].toLowerCase().substring(0, 3);
          month = monthNames[monthStr];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }
      } else {
        // Numeric formats MM/DD/YYYY or DD/MM/YYYY
        [, month, day, year] = match;
        month = parseInt(month);
        day = parseInt(day);
        year = parseInt(year);
        
        // Convert 2-digit year to 4-digit
        if (year < 100) {
          year = year > 50 ? 1900 + year : 2000 + year;
        }
        
        // Swap month/day if day seems too large for month
        if (day > 12 && month <= 12) {
          [month, day] = [day, month];
        }
      }

      const date = new Date(year, month - 1, day);
      
      // Validate the date
      if (isNaN(date.getTime())) return null;
      
      return {
        date: date,
        formatted: `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`,
        confidence: 80
      };
    } catch (error) {
      console.warn('Date parsing error:', error);
      return null;
    }
  }

  getAmountContext(text, index) {
    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + 20);
    return text.substring(start, end);
  }

  isSkippableLine(line) {
    const skipPatterns = [
      /^(receipt|invoice|bill|store|shop)[\s#]*\d*$/i,
      /^(date|time|cashier|clerk|register)/i,
      /^[\d\s\-:\/]+$/, // Just numbers and separators
      /^[*=\-_]{3,}$/, // Separator lines
      /^(thank\s+you|thanks|have\s+a|welcome)/i,
      /^\d+\s*$/, // Just a number
      /^[a-z\s]{1,3}$/i // Very short lines
    ];

    return skipPatterns.some(pattern => pattern.test(line));
  }

  getMatchedPatterns(text) {
    return {
      hasCurrency: /[$€£]/.test(text),
      hasTotal: /total|sum|amount/i.test(text),
      hasDate: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text),
      lineCount: text.split('\n').length,
      avgLineLength: text.split('\n').reduce((sum, line) => sum + line.length, 0) / text.split('\n').length
    };
  }

  createEmptyResult(confidence, error) {
    return {
      merchant: { value: null, confidence: 0, source: 'error' },
      total: { value: null, confidence: 0, source: 'error' },
      date: { value: null, confidence: 0, source: 'error' },
      items: { value: [], confidence: 0, count: 0, source: 'error' },
      metadata: {
        confidence: confidence,
        rawText: '',
        cleanedText: '',
        parsingVersion: this.version,
        timestamp: new Date().toISOString(),
        error: error,
        patterns: {}
      }
    };
  }
}

// Export singleton instance
export const dataParser = new DataParser();

// Export main function for compatibility
export function parseReceiptText(ocrText, confidence = 85) {
  return dataParser.parseReceiptText(ocrText, confidence);
}

// Export class for advanced usage
export { DataParser };