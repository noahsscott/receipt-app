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
      <!-- Dashboard Tab -->
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
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ processedReceipts.length }}</h3>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ Math.round(ocrAccuracy) }}%</h3>
              <p class="text-gray-600">OCR Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Tab Content -->
      <div v-if="activeTab === 'upload'" class="animate-fade-in">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Add New Receipt</h2>
          <p class="text-gray-600">Upload a receipt image and our AI will extract the key information automatically</p>
        </div>
        
        <div class="space-y-8">
          <!-- Upload Component (when no file selected) -->
          <ReceiptUpload 
            v-if="!selectedFile"
            @file-selected="handleFileSelected"
            @upload-error="handleUploadError"
            class="max-w-2xl mx-auto"
          />
          
          <!-- Image Preview Component (when file is selected) -->
          <ImagePreview
            v-if="selectedFile"
            :image-file="selectedFile"
            :is-processing="isProcessingOCR"
            @image-cleared="handleImageCleared"
            @image-rotated="handleImageRotated"
            class="max-w-4xl mx-auto"
          />
          
          <!-- OCR Results Display -->
          <div v-if="ocrResults && !isProcessingOCR" class="max-w-4xl mx-auto">
            <div class="card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Extracted Data</h3>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-3 h-3 rounded-full',
                      ocrResults.confidence >= 80 ? 'bg-green-500' : 
                      ocrResults.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    ]"></div>
                    <span class="text-sm text-gray-600">{{ ocrResults.confidence }}% confidence</span>
                  </div>
                  <button
                    @click="retryOCR"
                    :disabled="isProcessingOCR"
                    class="btn-secondary text-sm"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Retry OCR
                  </button>
                </div>
              </div>
              
              <!-- Extracted Data Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Merchant</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ ocrResults.parsedData.merchant || 'Not detected' }}</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Total Amount</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">
                      {{ ocrResults.parsedData.total ? `$${ocrResults.parsedData.total.toFixed(2)}` : 'Not detected' }}
                    </p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Date</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ ocrResults.parsedData.date || 'Not detected' }}</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Payment Method</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ ocrResults.parsedData.paymentMethod || 'Not detected' }}</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Processing Time</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ (ocrResults.processingTime / 1000).toFixed(1) }}s</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Status</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-2">
                      <div :class="[
                        'w-2 h-2 rounded-full',
                        ocrResults.success ? 'bg-green-500' : 'bg-red-500'
                      ]"></div>
                      <p class="text-gray-900">{{ ocrResults.success ? 'Success' : 'Failed' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Raw Text Section (Collapsible) -->
              <div class="border-t border-gray-200 pt-6">
                <button
                  @click="showRawText = !showRawText"
                  class="flex items-center justify-between w-full text-left"
                >
                  <h4 class="text-lg font-medium text-gray-900">Raw Extracted Text</h4>
                  <svg 
                    :class="['w-5 h-5 text-gray-500 transition-transform duration-200', showRawText ? 'rotate-180' : '']"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div v-if="showRawText" class="mt-4">
                  <div class="p-4 bg-gray-900 rounded-lg overflow-auto">
                    <pre class="text-sm text-gray-300 whitespace-pre-wrap">{{ ocrResults.extractedText || 'No text extracted' }}</pre>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  @click="saveReceipt"
                  :disabled="!ocrResults.success"
                  class="btn-primary flex-1"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Save Receipt
                </button>
                
                <button
                  @click="clearAll"
                  class="btn-secondary flex-1"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Receipts Tab Content -->
      <div v-if="activeTab === 'receipts'" class="animate-fade-in">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">All Receipts</h2>
          <p class="text-gray-600">View and manage your processed receipts</p>
        </div>
        
        <div v-if="processedReceipts.length === 0" class="card max-w-2xl mx-auto">
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
            <p class="text-gray-600 mb-4">Upload your first receipt to get started</p>
            <button @click="activeTab = 'upload'" class="btn-primary">Add Receipt</button>
          </div>
        </div>
        
        <!-- Receipts List -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="receipt in processedReceipts" 
            :key="receipt.id"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-semibold text-gray-900">{{ receipt.merchant || 'Unknown Merchant' }}</h3>
                <p class="text-sm text-gray-600">{{ formatDate(receipt.date) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">${{ receipt.total?.toFixed(2) || '0.00' }}</p>
                <div class="flex items-center mt-1">
                  <div :class="[
                    'w-2 h-2 rounded-full mr-2',
                    receipt.confidence >= 80 ? 'bg-green-500' : 
                    receipt.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  ]"></div>
                  <span class="text-xs text-gray-500">{{ receipt.confidence }}%</span>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <button
                @click="viewReceipt(receipt)"
                class="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View Details
              </button>
              <button
                @click="deleteReceipt(receipt.id)"
                class="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab Content -->
      <div v-if="activeTab === 'analytics'" class="animate-fade-in">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Spending Analytics</h2>
          <p class="text-gray-600">Visualize your spending patterns and trends</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Processing Statistics</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Receipts</span>
                <span class="font-semibold">{{ processedReceipts.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Average Accuracy</span>
                <span class="font-semibold">{{ Math.round(ocrAccuracy) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Amount</span>
                <span class="font-semibold">${{ totalSpent.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Average Per Receipt</span>
                <span class="font-semibold">${{ averageAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div class="space-y-3">
              <div 
                v-for="receipt in processedReceipts.slice(0, 5)" 
                :key="receipt.id"
                class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ receipt.merchant || 'Unknown' }}</p>
                  <p class="text-sm text-gray-600">{{ formatDate(receipt.date) }}</p>
                </div>
                <p class="font-semibold text-gray-900">${{ receipt.total?.toFixed(2) || '0.00' }}</p>
              </div>
              
              <div v-if="processedReceipts.length === 0" class="text-center py-8">
                <p class="text-gray-500">No receipts to analyze yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
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
          <component :is="getTabIcon(tab.id)" class="w-5 h-5 mb-1" />
          <span class="text-xs font-medium">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <!-- Global Loading Overlay -->
    <div 
      v-if="isProcessingOCR"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 max-w-sm mx-4 text-center">
        <div class="loading-spinner w-12 h-12 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Processing Receipt</h3>
        <p class="text-gray-600">{{ ocrProgress.message || 'Analyzing image with AI...' }}</p>
        <div class="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${ocrProgress.progress || 0}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ ocrProgress.progress || 0 }}% complete</p>
      </div>
    </div>

    <!-- Error Toast -->
    <div 
      v-if="errorMessage"
      class="fixed top-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 animate-slide-up"
    >
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-red-800">Error</h4>
          <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
        </div>
        <button
          @click="clearError"
          class="ml-2 text-red-600 hover:text-red-800"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReceiptUpload from './components/ReceiptUpload.vue'
import ImagePreview from './components/ImagePreview.vue'
import { processReceiptImage } from './utils/OCRProcessor.js'

// Tab management
const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'upload', name: 'Upload' },
  { id: 'receipts', name: 'Receipts' },
  { id: 'analytics', name: 'Analytics' }
]

// File and OCR state
const selectedFile = ref(null)
const isProcessingOCR = ref(false)
const ocrResults = ref(null)
const ocrProgress = ref({ progress: 0, message: '' })
const showRawText = ref(false)

// Receipt storage
const processedReceipts = ref([])

// Error handling
const errorMessage = ref('')

// Computed properties for dashboard stats
const totalSpent = computed(() => {
  return processedReceipts.value.reduce((sum, receipt) => {
    return sum + (receipt.total || 0)
  }, 0)
})

const averageAmount = computed(() => {
  if (processedReceipts.value.length === 0) return 0
  return totalSpent.value / processedReceipts.value.length
})

const ocrAccuracy = computed(() => {
  if (processedReceipts.value.length === 0) return 0
  const totalConfidence = processedReceipts.value.reduce((sum, receipt) => {
    return sum + (receipt.confidence || 0)
  }, 0)
  return totalConfidence / processedReceipts.value.length
})

// File handling
const handleFileSelected = async (file) => {
  console.log('File selected:', file.name, file.type, file.size)
  selectedFile.value = file
  
  // Automatically start OCR processing
  await processWithOCR()
}

const handleUploadError = (error) => {
  console.error('Upload error:', error)
  showError(error)
}

const handleImageCleared = () => {
  selectedFile.value = null
  ocrResults.value = null
  showRawText.value = false
  clearError()
}

const handleImageRotated = (degrees) => {
  console.log('Image rotated to:', degrees)
  // Could trigger re-OCR if needed
}

// OCR Processing
const processWithOCR = async () => {
  if (!selectedFile.value) return
  
  try {
    isProcessingOCR.value = true
    ocrProgress.value = { progress: 10, message: 'Preparing image...' }
    clearError()
    
    console.log('Starting OCR processing with Gemini Flash...')
    
    const result = await processReceiptImage(selectedFile.value, {
      onProgress: (progress) => {
        ocrProgress.value = progress
        console.log('OCR Progress:', progress)
      }
    })
    
    console.log('OCR processing completed:', result)
    ocrResults.value = result
    
    if (!result.success) {
      showError(result.error || 'OCR processing failed')
    }
    
  } catch (error) {
    console.error('OCR processing error:', error)
    showError(`OCR processing failed: ${error.message}`)
  } finally {
    isProcessingOCR.value = false
    ocrProgress.value = { progress: 100, message: 'Complete!' }
  }
}

const retryOCR = async () => {
  if (selectedFile.value) {
    ocrResults.value = null
    await processWithOCR()
  }
}

// Receipt management
const saveReceipt = () => {
  if (!ocrResults.value || !ocrResults.value.success) return
  
  try {
    const receipt = {
      id: generateReceiptId(),
      timestamp: new Date().toISOString(),
      fileName: selectedFile.value.name,
      merchant: ocrResults.value.parsedData.merchant,
      total: ocrResults.value.parsedData.total,
      date: ocrResults.value.parsedData.date || new Date().toISOString().split('T')[0],
      paymentMethod: ocrResults.value.parsedData.paymentMethod,
      confidence: ocrResults.value.confidence,
      processingTime: ocrResults.value.processingTime,
      rawText: ocrResults.value.extractedText
    }
    
    processedReceipts.value.unshift(receipt)
    saveToLocalStorage()
    
    console.log('Receipt saved:', receipt)
    
    // Switch to receipts tab to show the saved receipt
    activeTab.value = 'receipts'
    
    // Clear current state
    clearAll()
    
  } catch (error) {
    console.error('Error saving receipt:', error)
    showError('Failed to save receipt. Please try again.')
  }
}

const clearAll = () => {
  selectedFile.value = null
  ocrResults.value = null
  showRawText.value = false
  clearError()
}

const viewReceipt = (receipt) => {
  console.log('Viewing receipt:', receipt)
  // This will be enhanced in Day 2 with a detailed view
  alert(`Receipt Details:\n\nMerchant: ${receipt.merchant || 'Unknown'}\nTotal: ${receipt.total?.toFixed(2) || '0.00'}\nDate: ${receipt.date || 'Unknown'}\nConfidence: ${receipt.confidence}%`)
}

const deleteReceipt = (receiptId) => {
  if (confirm('Are you sure you want to delete this receipt?')) {
    const index = processedReceipts.value.findIndex(r => r.id === receiptId)
    if (index !== -1) {
      processedReceipts.value.splice(index, 1)
      saveToLocalStorage()
      console.log('Receipt deleted:', receiptId)
    }
  }
}

// Utility functions
const generateReceiptId = () => {
  return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const getTabIcon = (tabId) => {
  const icons = {
    dashboard: 'svg',
    upload: 'svg', 
    receipts: 'svg',
    analytics: 'svg'
  }
  return icons[tabId] || 'svg'
}

// Error handling
const showError = (message) => {
  errorMessage.value = message
  
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    clearError()
  }, 5000)
}

const clearError = () => {
  errorMessage.value = ''
}

// Local storage management
const saveToLocalStorage = () => {
  try {
    const dataToSave = {
      receipts: processedReceipts.value,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('receiptManager_data', JSON.stringify(dataToSave))
    console.log('Data saved to localStorage')
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    showError('Failed to save data locally. Please check your browser storage.')
  }
}

const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('receiptManager_data')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      if (parsed.receipts && Array.isArray(parsed.receipts)) {
        processedReceipts.value = parsed.receipts
        console.log('Loaded receipts from localStorage:', parsed.receipts.length)
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    showError('Failed to load saved data. Starting fresh.')
  }
}

// Lifecycle
onMounted(() => {
  console.log('Receipt Manager App initialized')
  console.log('Environment:', import.meta.env.MODE)
  console.log('Available features: Gemini Flash OCR, Local Storage, Responsive Design')
  
  // Load existing data
  loadFromLocalStorage()
  
  // Check if Gemini API key is configured
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found in environment variables')
    showError('OCR service not configured. Please add your Gemini API key to the .env file.')
  }
})

// Keyboard shortcuts
onMounted(() => {
  const handleKeyDown = (event) => {
    // Ctrl/Cmd + 1-4 for tab switching
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
      event.preventDefault()
      const tabIndex = parseInt(event.key) - 1
      if (tabs[tabIndex]) {
        activeTab.value = tabs[tabIndex].id
      }
    }
    
    // Escape to clear/cancel
    if (event.key === 'Escape') {
      if (isProcessingOCR.value) {
        // Cancel OCR if possible (for future enhancement)
        return
      }
      if (selectedFile.value || ocrResults.value) {
        clearAll()
      }
      if (errorMessage.value) {
        clearError()
      }
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  
  // Cleanup on unmount
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// Expose methods for debugging in development
if (import.meta.env.DEV) {
  window.receiptApp = {
    processedReceipts,
    selectedFile,
    ocrResults,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAll
  }
}
</script>