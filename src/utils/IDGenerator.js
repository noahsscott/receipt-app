// src/utils/IDGenerator.js
// UUID generation utility for receipt IDs

class IDGenerator {
  /**
   * Generate a UUID v4 (random UUID)
   * @returns {string} UUID string
   */
  static generateUUID() {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a short ID for receipts (8 characters)
   * @returns {string} Short unique ID
   */
  static generateShortID() {
    const uuid = this.generateUUID();
    return uuid.replace(/-/g, '').substring(0, 8);
  }

  /**
   * Validate if a string is a valid UUID
   * @param {string} id - ID to validate
   * @returns {boolean} True if valid UUID format
   */
  static isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Validate if a string is a valid short ID
   * @param {string} id - ID to validate
   * @returns {boolean} True if valid short ID format
   */
  static isValidShortID(id) {
    return /^[0-9a-f]{8}$/i.test(id);
  }

  /**
   * Generate timestamped ID (fallback compatibility)
   * @returns {string} Timestamp-based ID
   */
  static generateTimestampID() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export { IDGenerator };
export default IDGenerator;