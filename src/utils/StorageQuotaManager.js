// src/utils/StorageQuotaManager.js
// Storage quota monitoring and management utility

class StorageQuotaManager {
  constructor() {
    this.storageKey = 'receipt_manager_receipts';
    this.metaKey = 'receipt_manager_meta';
    
    // Storage limits (approximate - browsers vary)
    this.quotaLimits = {
      warning: 4 * 1024 * 1024,    // 4MB - show warning
      critical: 4.5 * 1024 * 1024, // 4.5MB - start cleanup
      maximum: 5 * 1024 * 1024     // 5MB - theoretical limit
    };
  }

  /**
   * Get current localStorage usage in bytes
   * @returns {Object} Storage usage statistics
   */
  getStorageUsage() {
    try {
      let totalSize = 0;
      let receiptSize = 0;
      let itemCount = 0;
      
      // Calculate total localStorage usage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const itemSize = this.getItemSize(key, localStorage[key]);
          totalSize += itemSize;
          
          if (key === this.storageKey) {
            receiptSize = itemSize;
            try {
              const receipts = JSON.parse(localStorage[key]);
              itemCount = Array.isArray(receipts) ? receipts.length : 0;
            } catch (e) {
              console.warn('Error parsing receipts for count:', e);
            }
          }
        }
      }
      
      return {
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        receiptSizeBytes: receiptSize,
        receiptSizeMB: (receiptSize / (1024 * 1024)).toFixed(2),
        receiptCount: itemCount,
        percentUsed: ((totalSize / this.quotaLimits.maximum) * 100).toFixed(1),
        warningLevel: this.getWarningLevel(totalSize)
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return {
        totalSizeBytes: 0,
        totalSizeMB: '0.00',
        receiptSizeBytes: 0,
        receiptSizeMB: '0.00',
        receiptCount: 0,
        percentUsed: '0.0',
        warningLevel: 'safe'
      };
    }
  }

  /**
   * Get size of a localStorage item in bytes
   * @param {string} key - Storage key
   * @param {string} value - Storage value
   * @returns {number} Size in bytes
   */
  getItemSize(key, value) {
    // Calculate UTF-16 size (JavaScript string encoding)
    return (key.length + value.length) * 2;
  }

  /**
   * Determine warning level based on usage
   * @param {number} totalSize - Total storage size in bytes
   * @returns {string} Warning level: 'safe', 'warning', 'critical', 'full'
   */
  getWarningLevel(totalSize) {
    if (totalSize >= this.quotaLimits.maximum) return 'full';
    if (totalSize >= this.quotaLimits.critical) return 'critical';
    if (totalSize >= this.quotaLimits.warning) return 'warning';
    return 'safe';
  }

  /**
   * Check if storage operation is safe to perform
   * @param {number} additionalSize - Additional bytes to be stored
   * @returns {Object} Safety check result
   */
  checkStorageSafety(additionalSize = 0) {
    const usage = this.getStorageUsage();
    const projectedSize = usage.totalSizeBytes + additionalSize;
    const projectedWarningLevel = this.getWarningLevel(projectedSize);
    
    return {
      isSafe: projectedSize < this.quotaLimits.critical,
      currentUsage: usage,
      projectedSizeMB: (projectedSize / (1024 * 1024)).toFixed(2),
      projectedWarningLevel: projectedWarningLevel,
      recommendCleanup: projectedWarningLevel === 'critical' || projectedWarningLevel === 'full',
      additionalSizeMB: (additionalSize / (1024 * 1024)).toFixed(2)
    };
  }

  /**
   * Attempt to save data with quota handling
   * @param {string} key - Storage key
   * @param {string} value - Data to save
   * @returns {Object} Save result
   */
  safeSave(key, value) {
    try {
      // Check if save is safe before attempting
      const safety = this.checkStorageSafety(this.getItemSize(key, value));
      
      if (!safety.isSafe) {
        return {
          success: false,
          error: 'QUOTA_WARNING',
          message: `Storage nearly full (${safety.projectedSizeMB}MB). Cleanup recommended.`,
          usage: safety.currentUsage
        };
      }
      
      // Attempt to save
      localStorage.setItem(key, value);
      
      return {
        success: true,
        message: 'Data saved successfully',
        usage: this.getStorageUsage()
      };
      
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        return this.handleQuotaExceeded(key, value);
      }
      
      return {
        success: false,
        error: 'SAVE_ERROR',
        message: `Failed to save: ${error.message}`,
        usage: this.getStorageUsage()
      };
    }
  }

  /**
   * Handle quota exceeded error with automatic cleanup
   * @param {string} key - Storage key that failed to save
   * @param {string} value - Data that failed to save
   * @returns {Object} Cleanup and retry result
   */
  handleQuotaExceeded(key, value) {
    console.warn('Storage quota exceeded, attempting cleanup...');
    
    try {
      // Perform automatic cleanup
      const cleanupResult = this.performAutomaticCleanup();
      
      if (cleanupResult.success) {
        // Retry save after cleanup
        try {
          localStorage.setItem(key, value);
          return {
            success: true,
            message: `Saved after cleanup. Removed ${cleanupResult.itemsRemoved} old receipts.`,
            usage: this.getStorageUsage(),
            cleanupPerformed: true
          };
        } catch (retryError) {
          return {
            success: false,
            error: 'QUOTA_EXCEEDED_AFTER_CLEANUP',
            message: 'Storage still full after cleanup. Manual cleanup required.',
            usage: this.getStorageUsage(),
            cleanupPerformed: true
          };
        }
      } else {
        return {
          success: false,
          error: 'CLEANUP_FAILED',
          message: 'Failed to free up storage space.',
          usage: this.getStorageUsage()
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded and cleanup failed.',
        usage: this.getStorageUsage()
      };
    }
  }

  /**
   * Perform automatic cleanup of old receipts
   * @param {number} targetCount - Number of receipts to remove (default: 20% of total)
   * @returns {Object} Cleanup result
   */
  performAutomaticCleanup(targetCount = null) {
    try {
      const receiptsData = localStorage.getItem(this.storageKey);
      if (!receiptsData) {
        return { success: false, message: 'No receipts to clean up' };
      }
      
      const receipts = JSON.parse(receiptsData);
      if (!Array.isArray(receipts) || receipts.length === 0) {
        return { success: false, message: 'No receipts to clean up' };
      }
      
      // Calculate how many to remove (default: 20% or minimum 5)
      const defaultRemoveCount = Math.max(Math.floor(receipts.length * 0.2), 5);
      const removeCount = targetCount || defaultRemoveCount;
      
      if (removeCount >= receipts.length) {
        return { success: false, message: 'Cannot remove all receipts' };
      }
      
      // Sort by timestamp (oldest first) and remove oldest receipts
      receipts.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.createdAt || 0);
        return timeA - timeB;
      });
      
      const removedReceipts = receipts.splice(0, removeCount);
      
      // Save cleaned up receipts
      localStorage.setItem(this.storageKey, JSON.stringify(receipts));
      
      // Log cleanup for user awareness
      console.log(`Automatic cleanup: Removed ${removeCount} old receipts to free up space`);
      
      return {
        success: true,
        itemsRemoved: removeCount,
        removedReceipts: removedReceipts.map(r => ({ id: r.id, merchant: r.merchant, date: r.date })),
        remainingCount: receipts.length,
        message: `Removed ${removeCount} oldest receipts`
      };
      
    } catch (error) {
      console.error('Error during automatic cleanup:', error);
      return {
        success: false,
        message: `Cleanup failed: ${error.message}`
      };
    }
  }

  /**
   * Get storage recommendations based on current usage
   * @returns {Array} Array of recommendation objects
   */
  getStorageRecommendations() {
    const usage = this.getStorageUsage();
    const recommendations = [];
    
    if (usage.warningLevel === 'critical' || usage.warningLevel === 'full') {
      recommendations.push({
        type: 'urgent',
        title: 'Storage Critical',
        message: `You're using ${usage.percentUsed}% of available storage. Immediate cleanup recommended.`,
        actions: ['Delete old receipts', 'Export data', 'Clear all data']
      });
    } else if (usage.warningLevel === 'warning') {
      recommendations.push({
        type: 'warning',
        title: 'Storage Warning',
        message: `You're using ${usage.percentUsed}% of available storage. Consider cleanup soon.`,
        actions: ['Archive old receipts', 'Export data']
      });
    }
    
    if (usage.receiptCount > 100) {
      recommendations.push({
        type: 'info',
        title: 'Large Receipt Collection',
        message: `You have ${usage.receiptCount} receipts stored. Consider organizing or archiving.`,
        actions: ['Export by date range', 'Delete by category']
      });
    }
    
    return recommendations;
  }

  /**
   * Estimate storage needed for new receipt with image
   * @param {Object} receiptData - Receipt data
   * @param {number} imageSizeKB - Estimated compressed image size
   * @returns {number} Estimated storage bytes needed
   */
  estimateReceiptSize(receiptData, imageSizeKB = 150) {
    // Estimate JSON size + base64 image size
    const jsonSize = JSON.stringify(receiptData).length * 2; // UTF-16
    const imageSize = imageSizeKB * 1024 * 1.33; // Base64 overhead
    return Math.round(jsonSize + imageSize);
  }
}

// Export singleton instance
export const storageQuotaManager = new StorageQuotaManager();

// Export class for advanced usage
export { StorageQuotaManager };