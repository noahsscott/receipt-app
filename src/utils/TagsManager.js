// src/utils/TagsManager.js
// Tags generation and management utility - Hong Kong Market Version

class TagsManager {
  constructor() {
    this.merchantCategories = {
      // Supermarkets & Grocery
      'wellcome': ['grocery', 'supermarket'],
      'park n shop': ['grocery', 'supermarket'],
      'city super': ['grocery', 'premium'],
      'great': ['grocery', 'supermarket'],
      'taste': ['grocery', 'premium'],
      'international': ['grocery', 'supermarket'],
      'fusion': ['grocery', 'supermarket'],
      'marketplace': ['grocery', 'supermarket'],
      'jasons': ['grocery', 'premium', 'imported'],
      
      // Wet Markets & Fresh Food
      'wet market': ['grocery', 'fresh', 'local'],
      'market': ['grocery', 'fresh'],
      'fishmonger': ['grocery', 'seafood', 'fresh'],
      'butcher': ['grocery', 'meat', 'fresh'],
      
      // Convenience Stores
      '7-eleven': ['convenience', 'quick-shop'],
      'circle k': ['convenience', 'quick-shop'],
      'ok': ['convenience', 'quick-shop'],
      'vango': ['convenience', 'quick-shop'],
      'ztore': ['convenience', 'online'],
      
      // Department Stores & Shopping
      'sogo': ['retail', 'department-store'],
      'lane crawford': ['retail', 'luxury', 'department-store'],
      'harvey nichols': ['retail', 'luxury'],
      'landmark': ['retail', 'luxury'],
      'times square': ['retail', 'shopping-mall'],
      'ifc': ['retail', 'shopping-mall', 'premium'],
      'harbour city': ['retail', 'shopping-mall'],
      'apm': ['retail', 'shopping-mall'],
      'festival walk': ['retail', 'shopping-mall'],
      
      // Electronics & Tech
      'fortress': ['electronics', 'tech'],
      'broadway': ['electronics', 'tech'],
      'wilson': ['electronics', 'tech'],
      'apple store': ['electronics', 'tech', 'premium'],
      'samsung': ['electronics', 'tech'],
      'sim city': ['electronics', 'tech'],
      'golden computer': ['electronics', 'tech', 'wholesale'],
      
      // Dining - Local
      'cha chaan teng': ['restaurant', 'local', 'casual'],
      'dim sum': ['restaurant', 'local', 'traditional'],
      'tea restaurant': ['restaurant', 'local', 'casual'],
      'noodle': ['restaurant', 'local', 'casual'],
      'congee': ['restaurant', 'local', 'casual'],
      'roast': ['restaurant', 'local', 'bbq'],
      'wonton': ['restaurant', 'local', 'noodles'],
      
      // Dining - International Chains
      'mcdonalds': ['restaurant', 'fast-food', 'western'],
      'kfc': ['restaurant', 'fast-food', 'western'],
      'pizza hut': ['restaurant', 'pizza', 'western'],
      'subway': ['restaurant', 'fast-food', 'western'],
      'starbucks': ['cafe', 'coffee', 'western'],
      'pacific coffee': ['cafe', 'coffee', 'local-chain'],
      'cafe de coral': ['restaurant', 'fast-food', 'local-chain'],
      'fairwood': ['restaurant', 'fast-food', 'local-chain'],
      'maxims': ['restaurant', 'local-chain'],
      'yoshinoya': ['restaurant', 'japanese', 'fast-food'],
      'genki sushi': ['restaurant', 'japanese', 'sushi'],
      
      // Dining - Premium
      'michelin': ['restaurant', 'fine-dining', 'premium'],
      'hotel': ['restaurant', 'hotel', 'premium'],
      'club': ['restaurant', 'private', 'premium'],
      
      // Food Delivery Services
      'foodpanda': ['food-delivery', 'online'],
      'deliveroo': ['food-delivery', 'online'],
      'keeta': ['food-delivery', 'online', 'chinese'],
      
      // Transportation
      'octopus': ['transport', 'public-transport'],
      'mtr': ['transport', 'public-transport', 'railway'],
      'taxi': ['transport', 'taxi'],
      'uber': ['transport', 'ride-sharing'],
      'esso': ['fuel', 'petrol'],
      'shell': ['fuel', 'petrol'],
      'caltex': ['fuel', 'petrol'],
      'sinopec': ['fuel', 'petrol'],
      
      // Healthcare & Pharmacy
      'watsons': ['pharmacy', 'health', 'personal-care'],
      'mannings': ['pharmacy', 'health', 'personal-care'],
      'sasa': ['beauty', 'cosmetics'],
      'bonjour': ['beauty', 'cosmetics'],
      'private hospital': ['healthcare', 'private'],
      'clinic': ['healthcare', 'medical'],
      
      // Banking & Finance
      'hsbc': ['banking', 'finance'],
      'hang seng': ['banking', 'finance'],
      'standard chartered': ['banking', 'finance'],
      'bank of china': ['banking', 'finance'],
      'dbs': ['banking', 'finance'],
      'citibank': ['banking', 'finance'],
      
      // Utilities & Services
      'hk electric': ['utilities', 'electricity'],
      'clp': ['utilities', 'electricity'],
      'towngas': ['utilities', 'gas'],
      'water supplies': ['utilities', 'water'],
      'pccw': ['telecom', 'utilities'],
      'hkt': ['telecom', 'utilities'],
      'smartone': ['telecom', 'mobile'],
      '3hk': ['telecom', 'mobile'],
      'csl': ['telecom', 'mobile'],
      
      // Sports & Recreation
      'lcsd': ['recreation', 'sports', 'government'],
      'decathlon': ['sports', 'equipment', 'retail'],
      
      // Fashion & Sportswear
      'nike': ['clothing', 'sportswear', 'premium'],
      'adidas': ['clothing', 'sportswear', 'premium'],
      'baleno': ['clothing', 'fashion', 'local-brand'],
      'uniqlo': ['clothing', 'casual'],
      'zara': ['clothing', 'fashion'],
      'h&m': ['clothing', 'fashion'],
      
      // Home & Living
      'ikea': ['home', 'furniture'],
      'pricerite': ['home', 'furniture', 'budget'],
      'log-on': ['home', 'lifestyle'],
      'muji': ['home', 'lifestyle', 'minimalist'],
      
      // Online Shopping
      'hktvmall': ['online', 'shopping'],
      'zalora': ['online', 'fashion'],
      'taobao': ['online', 'shopping', 'chinese', 'wholesale'],
      
      // Local Services
      'minibus': ['transport', 'public-transport'],
      'ferry': ['transport', 'public-transport'],
      'laundry': ['services', 'cleaning'],
      'photo': ['services', 'photography'],
      'optical': ['services', 'vision-care'],
      
      // Entertainment
      'cinema': ['entertainment', 'movies'],
      'palace': ['entertainment', 'movies'],
      'mcl': ['entertainment', 'movies'],
      'broadway': ['entertainment', 'movies'],
      'karaoke': ['entertainment', 'ktv'],
      'red mr': ['entertainment', 'ktv'],
      'neway': ['entertainment', 'ktv'],
      
      // Education
      'school': ['education', 'tuition'],
      'tutorial': ['education', 'tuition'],
      'language': ['education', 'language'],
      'music': ['education', 'music'],
      
      // Restaurant Booking & Discovery
      'openrice': ['restaurant', 'booking']
    };
    
    this.itemCategories = {
      // Food items
      'bread': ['food', 'bakery'],
      'milk': ['food', 'dairy'],
      'cheese': ['food', 'dairy'],
      'eggs': ['food', 'dairy'],
      'chicken': ['food', 'meat'],
      'beef': ['food', 'meat'],
      'pork': ['food', 'meat'],
      'salmon': ['food', 'seafood'],
      'fish': ['food', 'seafood'],
      'apple': ['food', 'fruit'],
      'banana': ['food', 'fruit'],
      'orange': ['food', 'fruit'],
      'lettuce': ['food', 'vegetable'],
      'tomato': ['food', 'vegetable'],
      'rice': ['food', 'staple'],
      'noodles': ['food', 'staple'],
      'pasta': ['food', 'staple'],
      
      // Hong Kong specific foods
      'dim sum': ['food', 'local', 'traditional'],
      'congee': ['food', 'local', 'comfort'],
      'wonton': ['food', 'local', 'noodles'],
      'char siu': ['food', 'local', 'bbq'],
      'roast duck': ['food', 'local', 'roast'],
      'milk tea': ['beverage', 'local', 'tea'],
      'pineapple bun': ['food', 'local', 'bakery'],
      'egg tart': ['food', 'local', 'dessert'],
      
      // Beverages
      'coffee': ['beverage', 'caffeine'],
      'tea': ['beverage', 'caffeine'],
      'soda': ['beverage', 'soft-drink'],
      'water': ['beverage'],
      'juice': ['beverage', 'fruit'],
      'beer': ['beverage', 'alcohol'],
      'wine': ['beverage', 'alcohol'],
      'bubble tea': ['beverage', 'trendy'],
      
      // Electronics
      'iphone': ['electronics', 'phone'],
      'smartphone': ['electronics', 'phone'],
      'laptop': ['electronics', 'computer'],
      'tablet': ['electronics', 'computer'],
      'headphones': ['electronics', 'audio'],
      'earbuds': ['electronics', 'audio'],
      'cable': ['electronics', 'accessory'],
      'charger': ['electronics', 'accessory'],
      
      // Clothing & Fashion
      'shirt': ['clothing', 'apparel'],
      'pants': ['clothing', 'apparel'],
      'jeans': ['clothing', 'apparel'],
      'dress': ['clothing', 'apparel'],
      'shoes': ['clothing', 'footwear'],
      'sneakers': ['clothing', 'footwear', 'casual'],
      'boots': ['clothing', 'footwear'],
      'jacket': ['clothing', 'outerwear'],
      'coat': ['clothing', 'outerwear'],
      'sweater': ['clothing', 'knitwear'],
      'underwear': ['clothing', 'intimate'],
      'socks': ['clothing', 'hosiery'],
      
      // Sports & Recreation
      'gym': ['sports', 'fitness'],
      'swimming': ['sports', 'aquatic'],
      'tennis': ['sports', 'racquet'],
      'badminton': ['sports', 'racquet'],
      'football': ['sports', 'team'],
      'basketball': ['sports', 'team'],
      'running': ['sports', 'individual'],
      'yoga': ['sports', 'wellness'],
      
      // Health & Beauty
      'shampoo': ['health', 'personal-care'],
      'conditioner': ['health', 'personal-care'],
      'soap': ['health', 'personal-care'],
      'toothpaste': ['health', 'dental'],
      'toothbrush': ['health', 'dental'],
      'medicine': ['health', 'pharmacy'],
      'vitamins': ['health', 'supplements'],
      'skincare': ['beauty', 'skincare'],
      'makeup': ['beauty', 'cosmetics'],
      'perfume': ['beauty', 'fragrance'],
      
      // Home & Living
      'furniture': ['home', 'furniture'],
      'bedding': ['home', 'bedroom'],
      'kitchenware': ['home', 'kitchen'],
      'cleaning': ['home', 'cleaning'],
      'decoration': ['home', 'decor'],
      'storage': ['home', 'organization']
    };
    
    // Price-based tags (adjusted for Hong Kong market)
    this.priceThresholds = {
      'expensive': 500,   // HKD 500+
      'moderate': 100,    // HKD 100-499
      'budget': 50        // HKD 50-99
    };
    
    // Date-based tags
    this.seasons = {
      'winter': [12, 1, 2],
      'spring': [3, 4, 5],
      'summer': [6, 7, 8],
      'fall': [9, 10, 11]
    };
  }

  /**
   * Generate automatic tags for a receipt
   * @param {Object} receipt - Receipt data
   * @returns {Array} Array of generated tags
   */
  generateAutoTags(receipt) {
    const tags = new Set();
    
    try {
      // Merchant-based tags
      const merchantTags = this.getMerchantTags(receipt.merchant);
      merchantTags.forEach(tag => tags.add(tag));
      
      // Item-based tags
      if (receipt.items && Array.isArray(receipt.items)) {
        const itemTags = this.getItemTags(receipt.items);
        itemTags.forEach(tag => tags.add(tag));
      }
      
      // Price-based tags
      const priceTags = this.getPriceTags(receipt.total);
      priceTags.forEach(tag => tags.add(tag));
      
      // Date-based tags
      const dateTags = this.getDateTags(receipt.date || receipt.timestamp);
      dateTags.forEach(tag => tags.add(tag));
      
      // Time-based tags
      const timeTags = this.getTimeTags(receipt.timestamp);
      timeTags.forEach(tag => tags.add(tag));
      
      // Quantity-based tags
      const quantityTags = this.getQuantityTags(receipt.items);
      quantityTags.forEach(tag => tags.add(tag));
      
      // OCR confidence tags
      const confidenceTags = this.getConfidenceTags(receipt.confidence);
      confidenceTags.forEach(tag => tags.add(tag));
      
    } catch (error) {
      console.error('Error generating auto tags:', error);
    }
    
    return Array.from(tags).sort();
  }

  /**
   * Get tags based on merchant name
   * @param {string} merchant - Merchant name
   * @returns {Array} Merchant-based tags
   */
  getMerchantTags(merchant) {
    if (!merchant || typeof merchant !== 'string') return [];
    
    const merchantLower = merchant.toLowerCase();
    const tags = [];
    
    // Check exact matches and partial matches
    for (const [key, categories] of Object.entries(this.merchantCategories)) {
      if (merchantLower.includes(key)) {
        tags.push(...categories);
      }
    }
    
    // Generic merchant tag
    tags.push('merchant');
    
    return [...new Set(tags)];
  }

  /**
   * Get tags based on items purchased
   * @param {Array} items - Receipt items
   * @returns {Array} Item-based tags
   */
  getItemTags(items) {
    if (!Array.isArray(items)) return [];
    
    const tags = new Set();
    
    items.forEach(item => {
      if (item.name && typeof item.name === 'string') {
        const itemName = item.name.toLowerCase();
        
        // Check for category matches
        for (const [keyword, categories] of Object.entries(this.itemCategories)) {
          if (itemName.includes(keyword)) {
            categories.forEach(cat => tags.add(cat));
          }
        }
        
        // Add item category if available (but filter out generic "other")
        if (item.category && typeof item.category === 'string' && item.category.toLowerCase() !== 'other') {
          tags.add(item.category.toLowerCase());
        }
      }
    });
    
    // Add quantity-based purchase size tags (rename for clarity)
    if (items.length > 10) tags.add('many-items');
    if (items.length <= 3) tags.add('few-items');
    
    return Array.from(tags);
  }

  /**
   * Get tags based on total price
   * @param {number} total - Receipt total
   * @returns {Array} Price-based tags
   */
  getPriceTags(total) {
    if (typeof total !== 'number' || total <= 0) return [];
    
    const tags = [];
    
    if (total >= this.priceThresholds.expensive) {
      tags.push('expensive');
    } else if (total >= this.priceThresholds.moderate) {
      tags.push('moderate');
    } else if (total >= this.priceThresholds.budget) {
      tags.push('budget');
    } else {
      tags.push('cheap');
    }
    
    // Add currency magnitude tags (HKD specific)
    if (total >= 2000) tags.push('high-value');
    if (total >= 1000) tags.push('major-purchase');
    if (total < 20) tags.push('micro-purchase');
    
    return tags;
  }

  /**
   * Get tags based on receipt date
   * @param {string} date - Receipt date
   * @returns {Array} Date-based tags
   */
  getDateTags(date) {
    if (!date) return [];
    
    try {
      const receiptDate = new Date(date);
      const month = receiptDate.getMonth() + 1; // 1-12
      const year = receiptDate.getFullYear();
      const tags = [];
      
      // Season tags
      for (const [season, months] of Object.entries(this.seasons)) {
        if (months.includes(month)) {
          tags.push(season);
          break;
        }
      }
      
      // Year tag
      tags.push(`year-${year}`);
      
      // Month tag
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      if (month >= 1 && month <= 12) {
        tags.push(monthNames[month - 1]);
      }
      
      // Holiday period tags (Hong Kong specific)
      const holidayTags = this.getHolidayTags(month, receiptDate.getDate());
      tags.push(...holidayTags);
      
      return tags;
      
    } catch (error) {
      console.error('Error processing date tags:', error);
      return [];
    }
  }

  /**
   * Get holiday-based tags (Hong Kong specific)
   * @param {number} month - Month (1-12)
   * @param {number} day - Day of month
   * @returns {Array} Holiday tags
   */
  getHolidayTags(month, day) {
    const tags = [];
    
    // Chinese New Year period (varies yearly, but typically Jan/Feb)
    if ((month === 1 && day >= 15) || (month === 2 && day <= 25)) {
      tags.push('chinese-new-year-season');
    }
    
    // Christmas season
    if (month === 12 && day >= 15) tags.push('christmas-season');
    
    // New Year period
    if ((month === 12 && day >= 30) || (month === 1 && day <= 2)) {
      tags.push('new-year');
    }
    
    // Valentine's Day period
    if (month === 2 && day >= 10 && day <= 16) tags.push('valentines');
    
    // Mid-Autumn Festival season (September/October)
    if ((month === 9 && day >= 15) || (month === 10 && day <= 15)) {
      tags.push('mid-autumn-season');
    }
    
    // Back to school season
    if (month === 8 || (month === 9 && day <= 15)) tags.push('back-to-school');
    
    // Summer vacation season
    if (month === 7 || month === 8) tags.push('summer-vacation');
    
    return tags;
  }

  /**
   * Get time-based tags
   * @param {string} timestamp - Receipt timestamp
   * @returns {Array} Time-based tags
   */
  getTimeTags(timestamp) {
    if (!timestamp) return [];
    
    try {
      const date = new Date(timestamp);
      const hour = date.getHours();
      const tags = [];
      
      if (hour >= 5 && hour < 12) tags.push('morning');
      else if (hour >= 12 && hour < 17) tags.push('afternoon');
      else if (hour >= 17 && hour < 21) tags.push('evening');
      else tags.push('night');
      
      // Weekend vs weekday
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        tags.push('weekend');
      } else {
        tags.push('weekday');
      }
      
      return tags;
      
    } catch (error) {
      console.error('Error processing time tags:', error);
      return [];
    }
  }

  /**
   * Get quantity-based tags
   * @param {Array} items - Receipt items
   * @returns {Array} Quantity-based tags
   */
  getQuantityTags(items) {
    if (!Array.isArray(items)) return [];
    
    const tags = [];
    const totalQuantity = items.reduce((sum, item) => {
      return sum + (parseInt(item.quantity) || 1);
    }, 0);
    
    if (totalQuantity > 20) tags.push('bulk-quantity');
    if (totalQuantity === 1) tags.push('single-item');
    
    return tags;
  }

  /**
   * Get confidence-based tags
   * @param {number} confidence - OCR confidence score
   * @returns {Array} Confidence-based tags
   */
  getConfidenceTags(confidence) {
    if (typeof confidence !== 'number') return [];
    
    const tags = [];
    
    if (confidence >= 0.9) tags.push('high-confidence');
    else if (confidence >= 0.7) tags.push('medium-confidence');
    else if (confidence >= 0.5) tags.push('low-confidence');
    else tags.push('very-low-confidence');
    
    return tags;
  }

  /**
   * Validate and clean user-defined tags
   * @param {Array} userTags - User-provided tags
   * @returns {Array} Cleaned and validated tags
   */
  validateUserTags(userTags) {
    if (!Array.isArray(userTags)) return [];
    
    return userTags
      .filter(tag => tag && typeof tag === 'string')
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .filter(tag => /^[a-z0-9\-_\s]+$/.test(tag)) // Only alphanumeric, hyphens, underscores, spaces
      .map(tag => tag.replace(/\s+/g, '-')) // Replace spaces with hyphens
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
  }

  /**
   * Merge auto-generated and user-defined tags
   * @param {Array} autoTags - Auto-generated tags
   * @param {Array} userTags - User-defined tags
   * @returns {Object} Combined tags with metadata
   */
  mergeTags(autoTags, userTags) {
    const validUserTags = this.validateUserTags(userTags);
    const allTags = [...new Set([...autoTags, ...validUserTags])].sort();
    
    return {
      all: allTags,
      auto: autoTags,
      user: validUserTags,
      count: allTags.length
    };
  }

  /**
   * Get tag statistics for all receipts
   * @param {Array} receipts - All receipts
   * @returns {Object} Tag statistics
   */
  getTagStatistics(receipts) {
    if (!Array.isArray(receipts)) return {};
    
    const tagCounts = {};
    const tagTypes = { auto: {}, user: {} };
    
    receipts.forEach(receipt => {
      if (receipt.tags && receipt.tags.all) {
        receipt.tags.all.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      
      if (receipt.tags && receipt.tags.auto) {
        receipt.tags.auto.forEach(tag => {
          tagTypes.auto[tag] = (tagTypes.auto[tag] || 0) + 1;
        });
      }
      
      if (receipt.tags && receipt.tags.user) {
        receipt.tags.user.forEach(tag => {
          tagTypes.user[tag] = (tagTypes.user[tag] || 0) + 1;
        });
      }
    });
    
    return {
      tagCounts: tagCounts,
      tagTypes: tagTypes,
      mostUsedTags: Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
      totalUniqueTags: Object.keys(tagCounts).length
    };
  }
}

// Export singleton instance
export const tagsManager = new TagsManager();

// Export class for advanced usage
export { TagsManager };