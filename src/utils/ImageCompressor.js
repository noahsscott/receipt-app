// src/utils/ImageCompressor.js
// Image compression utility for receipt storage

class ImageCompressor {
  constructor() {
    this.targetSizeKB = 200; // Target size in KB
    this.maxWidth = 1200;    // Max width for compression
    this.maxHeight = 1600;   // Max height for compression
    this.quality = 0.8;      // Initial JPEG quality
  }

  /**
   * Compress an image file to target size
   * @param {File} file - Image file to compress
   * @param {Object} options - Compression options
   * @returns {Promise<string>} Base64 encoded compressed image
   */
  async compressImage(file, options = {}) {
    const config = {
      targetSizeKB: options.targetSizeKB || this.targetSizeKB,
      maxWidth: options.maxWidth || this.maxWidth,
      maxHeight: options.maxHeight || this.maxHeight,
      quality: options.quality || this.quality
    };

    try {
      // Load image
      const image = await this.loadImage(file);
      
      // Calculate new dimensions
      const dimensions = this.calculateDimensions(image, config.maxWidth, config.maxHeight);
      
      // Create canvas and compress
      let compressed = await this.compressToCanvas(image, dimensions, config.quality);
      
      // If still too large, reduce quality iteratively
      compressed = await this.optimizeSize(image, dimensions, compressed, config.targetSizeKB);
      
      console.log(`Image compressed: ${Math.round(file.size / 1024)}KB → ${Math.round(this.getBase64SizeKB(compressed))}KB`);
      
      return compressed;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  }

  /**
   * Load image file into Image object
   * @param {File} file - Image file
   * @returns {Promise<HTMLImageElement>} Loaded image
   */
  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      img.src = url;
      
      // Clean up object URL after loading
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   * @param {HTMLImageElement} image - Source image
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {Object} New dimensions {width, height}
   */
  calculateDimensions(image, maxWidth, maxHeight) {
    let { width, height } = image;
    
    // Calculate scaling factor
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
    
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }

  /**
   * Compress image to canvas with specified quality
   * @param {HTMLImageElement} image - Source image
   * @param {Object} dimensions - Target dimensions
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<string>} Base64 encoded image
   */
  compressToCanvas(image, dimensions, quality) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Optional: Apply image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image to canvas
      ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
      
      // Convert to base64 with compression
      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    });
  }

  /**
   * Iteratively optimize image size to meet target
   * @param {HTMLImageElement} image - Source image
   * @param {Object} dimensions - Image dimensions
   * @param {string} initialCompressed - Initial compressed image
   * @param {number} targetSizeKB - Target size in KB
   * @returns {Promise<string>} Optimized base64 image
   */
  async optimizeSize(image, dimensions, initialCompressed, targetSizeKB) {
    let compressed = initialCompressed;
    let quality = this.quality;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (this.getBase64SizeKB(compressed) > targetSizeKB && attempts < maxAttempts) {
      quality *= 0.8; // Reduce quality by 20% each iteration
      
      if (quality < 0.1) {
        // If quality too low, reduce dimensions instead
        dimensions.width = Math.round(dimensions.width * 0.9);
        dimensions.height = Math.round(dimensions.height * 0.9);
        quality = 0.6; // Reset quality
      }
      
      compressed = await this.compressToCanvas(image, dimensions, quality);
      attempts++;
      
      console.log(`Compression attempt ${attempts}: ${Math.round(this.getBase64SizeKB(compressed))}KB (quality: ${quality.toFixed(2)})`);
    }
    
    return compressed;
  }

  /**
   * Calculate size of base64 string in KB
   * @param {string} base64String - Base64 encoded string
   * @returns {number} Size in KB
   */
  getBase64SizeKB(base64String) {
    // Remove data URL prefix if present
    const base64Data = base64String.split(',')[1] || base64String;
    
    // Calculate actual byte size (base64 is ~33% larger than binary)
    const sizeBytes = (base64Data.length * 3) / 4;
    
    // Account for padding
    const padding = (base64Data.match(/=/g) || []).length;
    
    return (sizeBytes - padding) / 1024;
  }

  /**
   * Validate if image file is supported
   * @param {File} file - File to validate
   * @returns {boolean} True if supported image format
   */
  isValidImageFile(file) {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return supportedTypes.includes(file.type);
  }

  /**
   * Get image metadata
   * @param {File} file - Image file
   * @returns {Promise<Object>} Image metadata
   */
  async getImageMetadata(file) {
    try {
      const image = await this.loadImage(file);
      
      return {
        originalWidth: image.width,
        originalHeight: image.height,
        originalSizeKB: Math.round(file.size / 1024),
        aspectRatio: (image.width / image.height).toFixed(2),
        fileType: file.type,
        fileName: file.name
      };
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }
}

// Export singleton instance
export const imageCompressor = new ImageCompressor();

// Export class for advanced usage
export { ImageCompressor };