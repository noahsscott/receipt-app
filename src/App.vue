<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-900">Receipt Manager</h1>
          </div>
          <nav class="hidden md:flex space-x-6">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeTab === tab.id 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div v-if="activeTab === 'dashboard'" class="mb-8">
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Welcome to Receipt Manager</h2>
          <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Effortlessly capture, organize, and analyze your receipts with AI-powered OCR technology. 
            Track expenses, visualize spending patterns, and take control of your finances.
          </p>
          
          <!-- Quick Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div class="card text-center">
              <div class="w-12 h-12 bg-success-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ totalReceipts }}</h3>
              <p class="text-gray-600">Total Receipts</p>
            </div>
            
            <div class="card text-center">
              <div class="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">${{ totalSpent.toFixed(2) }}</h3>
              <p class="text-gray-600">Total Spent</p>
            </div>
            
            <div class="card text-center">
              <div class="w-12 h-12 bg-warning-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ totalCategories }}</h3>
              <p class="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="space-y-8">
        <!-- Upload Tab Content -->
        <div v-if="activeTab === 'upload'" class="animate-fade-in">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Add New Receipt</h2>
            <p class="text-gray-600">Upload a receipt image and we'll extract the key information automatically</p>
          </div>
          
          <!-- Show upload component if no file selected -->
          <ReceiptUpload 
            v-if="!selectedFile"
            @file-selected="handleFileSelected"
            @upload-error="handleUploadError"
            class="max-w-2xl mx-auto"
          />
          
          <!-- Show image preview if file is selected -->
          <div v-if="selectedFile" class="space-y-6">
            <ImagePreview
              :image-file="selectedFile"
              :is-processing="isProcessingOCR"
              @image-cleared="handleImageCleared"
              @image-rotated="handleImageRotated"
            />
            
            <!-- OCR Results Display -->
            <div v-if="ocrResults && ocrResults.success" class="card max-w-4xl mx-auto">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Extracted Receipt Data</h3>
              
              <!-- Basic Info Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <label class="text-sm font-medium text-gray-600">Merchant</label>
                  <p class="text-gray-900 font-medium">{{ ocrResults.parsedData.merchant || 'Not found' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <label class="text-sm font-medium text-gray-600">Total</label>
                  <p class="text-gray-900 font-medium">${{ ocrResults.parsedData.total || '0.00' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <label class="text-sm font-medium text-gray-600">Date</label>
                  <p class="text-gray-900 font-medium">{{ ocrResults.parsedData.date || 'Not found' }}</p>
                </div>
              </div>

              <!-- Line Items Section -->
              <div v-if="ocrResults.parsedData.items && ocrResults.parsedData.items.length > 0" class="mb-6">
                <h4 class="text-md font-semibold text-gray-900 mb-3">
                  Line Items ({{ ocrResults.parsedData.items.length }} items)
                </h4>
                
                <div class="bg-gray-50 rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-100">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(item, index) in ocrResults.parsedData.items" :key="index" class="hover:bg-gray-50">
                          <td class="px-4 py-3 text-sm text-gray-900">{{ item.name }}</td>
                          <td class="px-4 py-3 text-sm text-gray-600">{{ item.quantity || 1 }}</td>
                          <td class="px-4 py-3 text-sm text-gray-600">${{ (item.price || 0).toFixed(2) }}</td>
                          <td class="px-4 py-3 text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {{ item.category || 'other' }}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-sm font-medium text-gray-900">
                            ${{ ((item.price || 0) * (item.quantity || 1)).toFixed(2) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Items Summary -->
                <div class="mt-4 flex justify-between items-center text-sm">
                  <span class="text-gray-600">
                    Items Total: ${{ calculateItemsTotal().toFixed(2) }}
                  </span>
                  <span class="text-gray-600">
                    Confidence: {{ ocrResults.confidence }}%
                  </span>
                </div>
              </div>

              <!-- No Items Found -->
              <div v-else class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <div>
                    <h4 class="text-sm font-medium text-yellow-800">No line items detected</h4>
                    <p class="text-sm text-yellow-700 mt-1">
                      The receipt image may be unclear or the format not recognized. Try a clearer image or different angle.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <button 
                  @click="handleImageCleared"
                  class="btn-secondary"
                >
                  Try Another Receipt
                </button>
                <button 
                  @click="saveReceipt"
                  class="btn-primary"
                >
                  Save Receipt
                </button>
              </div>
            </div>

            <!-- OCR Error Display -->
            <div v-else-if="ocrResults && !ocrResults.success" class="card max-w-2xl mx-auto">
              <div class="text-center py-6">
                <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Processing Failed</h3>
                <p class="text-gray-600 mb-4">{{ ocrResults.error }}</p>
                <button @click="retryOCR" class="btn-primary">Try Again</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab Content -->
        <div v-if="activeTab === 'analytics'" class="animate-fade-in">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Spending Analytics</h2>
            <p class="text-gray-600">Visualize your spending patterns and track expenses</p>
          </div>
          
          <!-- Analytics placeholder - Will be replaced with actual charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Chart will appear here</p>
              </div>
            </div>
            
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Chart will appear here</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Receipts Tab Content -->
        <div v-if="activeTab === 'receipts'" class="animate-fade-in">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">All Receipts</h2>
            <p class="text-gray-600">View and manage your uploaded receipts</p>
          </div>
          
          <!-- Receipts placeholder - Will be replaced with actual list -->
          <div class="card">
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
              <p class="text-gray-600 mb-4">Upload your first receipt to get started</p>
              <button @click="activeTab = 'upload'" class="btn-primary">Add Receipt</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div class="flex justify-around">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200',
            activeTab === tab.id 
              ? 'text-primary-600 bg-primary-50' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <span class="text-xs font-medium">{{ tab.name }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>

// Imports
import { ref, computed } from 'vue'
import ReceiptUpload from './components/ReceiptUpload.vue' 
import ImagePreview from './components/ImagePreview.vue' 
import { processReceiptImage } from './utils/OCRProcessor.js' 

// Tab management
const activeTab = ref('dashboard')
const selectedFile = ref(null) 
const isProcessingOCR = ref(false) 
const ocrResults = ref(null) // Store OCR results

const tabs = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'upload', name: 'Upload' },
  { id: 'receipts', name: 'Receipts' },
  { id: 'analytics', name: 'Analytics' }
]

// Mock data for dashboard stats
const totalReceipts = computed(() => {
  // This will be replaced with actual data from localStorage/store
  return 0
})

const totalSpent = computed(() => {
  // This will be replaced with actual calculation from receipts
  return 0.00
})

const totalCategories = computed(() => {
  // This will be replaced with actual category count
  return 0
})

// Calculate items total for display
const calculateItemsTotal = () => {
  if (!ocrResults.value?.parsedData?.items) return 0
  
  return ocrResults.value.parsedData.items.reduce((total, item) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1)
    return total + itemTotal
  }, 0)
}

// File handling
const handleFileSelected = async (file) => {
  console.log('File selected:', file)
  selectedFile.value = file
  isProcessingOCR.value = true
  ocrResults.value = null // Clear previous results
  
  try {
    // Process the receipt with OCR
    const result = await processReceiptImage(file, {
      onProgress: (progress) => {
        console.log('OCR Progress:', progress)
      }
    })
    
    console.log('OCR Result:', result)
    ocrResults.value = result
    
    if (result.success && result.parsedData.items) {
      console.log('✅ Line items extracted:', result.parsedData.items.length, 'items')
      result.parsedData.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, item)
      })
    } else {
      console.log('❌ No line items found in OCR result')
    }
    
  } catch (error) {
    console.error('Error processing receipt:', error)
    ocrResults.value = {
      success: false,
      error: error.message,
      parsedData: { merchant: null, total: null, date: null, items: [] }
    }
  } finally {
    isProcessingOCR.value = false
  }
}

const handleUploadError = (error) => {
  console.error('Upload error:', error)
}

// Image Preview Events
const handleImageCleared = () => {
  selectedFile.value = null
  isProcessingOCR.value = false
  ocrResults.value = null
}

const handleImageRotated = (degrees) => {
  console.log('Image rotated to:', degrees)
}

// Retry OCR processing
const retryOCR = async () => {
  if (selectedFile.value) {
    await handleFileSelected(selectedFile.value)
  }
}

// Save receipt (placeholder)
const saveReceipt = () => {
  console.log('Saving receipt:', ocrResults.value)
  // TODO: Implement localStorage saving
  alert('Receipt saved! (LocalStorage implementation coming next)')
}

// Error handling
const handleError = (error) => {
  console.error('App Error:', error)
}

// Lifecycle
console.log('Receipt Management App initialized')
console.log('Environment:', import.meta.env.MODE)
console.log('Available features: OCR, Charts, Local Storage')

// Test logs
console.log('API Key loaded:', !!import.meta.env.VITE_GEMINI_API_KEY)
</script>

<style scoped>
/* Component-specific styles if needed */
</style>