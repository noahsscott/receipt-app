// src/utils/ReceiptStorage.js
// LocalStorage management for receipt data

import { IDGenerator } from './IDGenerator.js';
import { imageCompressor } from './ImageCompressor.js';

class ReceiptStorage {
  constructor() {
    this.storageKey = 'receipt_manager_receipts';
    this.version = '1.0';
  }

/**
 * Save a new receipt or update existing one
 * @param {Object} receiptData - Receipt data to save
 * @param {File} imageFile - Optional image file to compress and store
 * @returns {Object} Saved receipt with ID
 */
    async save(receiptData, imageFile = null) {
    try {
        const receipts = this.getAll();
        
        // Generate ID if not provided
        if (!receiptData.id) {
            receiptData.id = this.generateId();
        }
        
        // Handle image compression if provided
        let imageData = receiptData.imageData || null;
        if (imageFile && imageCompressor.isValidImageFile(imageFile)) {
            console.log('Compressing image for storage...');
            imageData = await imageCompressor.compressImage(imageFile);
        }
        
        // Create receipt with enhanced structure
        const receiptToSave = {
            ...receiptData,
            imageData: imageData,
            version: this.version,
            createdAt: receiptData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEdited: receiptData.userEdited || false,
            tags: receiptData.tags || []
        };
        
        // Check if updating existing receipt
        const existingIndex = receipts.findIndex(r => r.id === receiptData.id);
        
        if (existingIndex >= 0) {
            // Update existing
            receipts[existingIndex] = receiptToSave;
            console.log('Updated existing receipt:', receiptToSave.id);
        } else {
            // Add new
            receipts.push(receiptToSave);
            console.log('Saved new receipt:', receiptToSave.id);
        }
        
        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(receipts));
        
        return receiptToSave;
        
    } catch (error) {
        console.error('Error saving receipt:', error);
        throw new Error(`Failed to save receipt: ${error.message}`);
    }
    }

  /**
   * Get all receipts from storage
   * @returns {Array} Array of receipt objects
   */
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const receipts = JSON.parse(stored);
      
      // Validate and migrate if needed
      return receipts.filter(receipt => this.validateReceipt(receipt));
      
    } catch (error) {
      console.error('Error loading receipts:', error);
      return [];
    }
  }

  /**
   * Get receipt by ID
   * @param {string} id - Receipt ID
   * @returns {Object|null} Receipt object or null if not found
   */
  getById(id) {
    const receipts = this.getAll();
    return receipts.find(receipt => receipt.id === id) || null;
  }

  /**
   * Update existing receipt
   * @param {string} id - Receipt ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated receipt or null if not found
   */
  update(id, updates) {
    const receipt = this.getById(id);
    if (!receipt) return null;
    
    const updatedReceipt = {
      ...receipt,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.save(updatedReceipt);
  }

  /**
   * Delete receipt by ID
   * @param {string} id - Receipt ID
   * @returns {boolean} True if deleted, false if not found
   */
  delete(id) {
    try {
      const receipts = this.getAll();
      const initialLength = receipts.length;
      
      const filteredReceipts = receipts.filter(receipt => receipt.id !== id);
      
      if (filteredReceipts.length === initialLength) {
        return false; // Receipt not found
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredReceipts));
      console.log('Deleted receipt:', id);
      return true;
      
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  }

  /**
   * Clear all receipts
   * @returns {boolean} Success status
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Cleared all receipts');
      return true;
    } catch (error) {
      console.error('Error clearing receipts:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} Statistics about stored receipts
   */
  getStats() {
    const receipts = this.getAll();
    
    const stats = {
      totalReceipts: receipts.length,
      totalAmount: 0,
      categories: new Set(),
      merchants: new Set(),
      dateRange: { earliest: null, latest: null },
      averageAmount: 0,
      storageSize: 0
    };

    if (receipts.length === 0) return stats;

    // Calculate totals and collect data
    receipts.forEach(receipt => {
      // Total amount
      if (receipt.total && typeof receipt.total === 'number') {
        stats.totalAmount += receipt.total;
      }
      
      // Categories
      if (receipt.items && Array.isArray(receipt.items)) {
        receipt.items.forEach(item => {
          if (item.category) stats.categories.add(item.category);
        });
      }
      
      // Merchants
      if (receipt.merchant) {
        stats.merchants.add(receipt.merchant);
      }
      
      // Date range
      if (receipt.date) {
        const receiptDate = new Date(receipt.date);
        if (!stats.dateRange.earliest || receiptDate < new Date(stats.dateRange.earliest)) {
          stats.dateRange.earliest = receipt.date;
        }
        if (!stats.dateRange.latest || receiptDate > new Date(stats.dateRange.latest)) {
          stats.dateRange.latest = receipt.date;
        }
      }
    });

    // Calculate averages
    stats.averageAmount = stats.totalAmount / receipts.length;
    stats.categories = Array.from(stats.categories);
    stats.merchants = Array.from(stats.merchants);
    
    // Storage size
    try {
      const stored = localStorage.getItem(this.storageKey);
      stats.storageSize = stored ? stored.length : 0;
    } catch (error) {
      stats.storageSize = 0;
    }

    return stats;
  }

  /**
   * Export receipts as JSON
   * @returns {string} JSON string of all receipts
   */
  exportData() {
    const receipts = this.getAll();
    return JSON.stringify({
      version: this.version,
      exportDate: new Date().toISOString(),
      receipts: receipts
    }, null, 2);
  }

  /**
   * Import receipts from JSON
   * @param {string} jsonData - JSON string to import
   * @param {boolean} replace - Whether to replace existing data
   * @returns {Object} Import result
   */
  importData(jsonData, replace = false) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.receipts || !Array.isArray(data.receipts)) {
        throw new Error('Invalid import format');
      }
      
      let existingReceipts = replace ? [] : this.getAll();
      let importedCount = 0;
      let skippedCount = 0;
      
      data.receipts.forEach(receipt => {
        if (this.validateReceipt(receipt)) {
          // Check for duplicates
          if (!existingReceipts.find(r => r.id === receipt.id)) {
            existingReceipts.push(receipt);
            importedCount++;
          } else {
            skippedCount++;
          }
        }
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(existingReceipts));
      
      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: existingReceipts.length
      };
      
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search receipts
   * @param {string} query - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered receipts
   */
  search(query = '', filters = {}) {
    let receipts = this.getAll();
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      receipts = receipts.filter(receipt => {
        return (
          receipt.merchant?.toLowerCase().includes(searchTerm) ||
          receipt.items?.some(item => 
            item.name?.toLowerCase().includes(searchTerm)
          )
        );
      });
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      receipts = receipts.filter(receipt => {
        if (!receipt.date) return false;
        const receiptDate = new Date(receipt.date);
        
        if (filters.startDate && receiptDate < new Date(filters.startDate)) {
          return false;
        }
        if (filters.endDate && receiptDate > new Date(filters.endDate)) {
          return false;
        }
        
        return true;
      });
    }
    
    // Amount range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      receipts = receipts.filter(receipt => {
        const amount = receipt.total || 0;
        
        if (filters.minAmount !== undefined && amount < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount !== undefined && amount > filters.maxAmount) {
          return false;
        }
        
        return true;
      });
    }
    
    // Category filter
    if (filters.category) {
      receipts = receipts.filter(receipt => {
        return receipt.items?.some(item => item.category === filters.category);
      });
    }
    
    return receipts;
  }

  // Helper methods
  generateId() {
    return IDGenerator.generateUUID();
}

  validateReceipt(receipt) {
    return (
      receipt &&
      typeof receipt === 'object' &&
      receipt.id &&
      typeof receipt.id === 'string'
    );
  }

  // Storage quota management
  getStorageInfo() {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const quota = 5 * 1024 * 1024; // Typical 5MB limit
      
      return {
        used: used,
        quota: quota,
        available: quota - used,
        percentUsed: (used / quota) * 100
      };
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const receiptStorage = new ReceiptStorage();

// Export main functions for convenience
export const {
  save: saveReceipt,
  getAll: getAllReceipts,
  getById: getReceiptById,
  delete: deleteReceipt,
  clear: clearAllReceipts,
  getStats: getReceiptStats
} = receiptStorage;

// Export class for advanced usage
export { ReceiptStorage };