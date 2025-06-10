<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Upload Area -->
    <div
      ref="uploadArea"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      :class="[
        'relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out',
        isDragOver 
          ? 'border-primary-500 bg-primary-50 scale-[1.02] shadow-lg' 
          : 'border-gray-300 bg-white hover:border-primary-500 hover:bg-gray-50',
        isUploading ? 'pointer-events-none' : ''
      ]"
    >
      <!-- Upload Icon -->
      <div class="mb-6">
        <div 
          :class="[
            'w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300',
            isDragOver 
              ? 'bg-primary-100 text-primary-600 scale-110' 
              : 'bg-gray-100 text-gray-400'
          ]"
        >
          <svg 
            v-if="!isUploading" 
            class="w-8 h-8 sm:w-10 sm:h-10" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          
          <!-- Loading Spinner -->
          <div 
            v-else 
            class="loading-spinner w-8 h-8 sm:w-10 sm:h-10"
          ></div>
        </div>
      </div>

      <!-- Upload Text -->
      <div class="space-y-3">
        <h3 
          :class="[
            'text-lg sm:text-xl font-semibold transition-colors duration-300',
            isDragOver ? 'text-primary-700' : 'text-gray-900'
          ]"
        >
          {{ uploadText }}
        </h3>
        
        <p 
          :class="[
            'text-sm sm:text-base transition-colors duration-300',
            isDragOver ? 'text-primary-600' : 'text-gray-600'
          ]"
        >
          {{ uploadSubtext }}
        </p>
        
        <!-- File Requirements -->
        <div class="text-xs sm:text-sm text-gray-500 mt-4">
          <p>Supported formats: JPG, PNG, WEBP</p>
          <p>Maximum size: 5MB</p>
        </div>
      </div>

      <!-- Browse Button -->
      <div class="mt-6">
        <button
          type="button"
          :disabled="isUploading"
          :class="[
            'inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isUploading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
          ]"
        >
          <svg 
            v-if="!isUploading" 
            class="w-4 h-4 sm:w-5 sm:h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          {{ isUploading ? 'Processing...' : 'Browse Files' }}
        </button>
      </div>

      <!-- Progress Bar -->
      <div 
        v-if="isUploading" 
        class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden"
      >
        <div 
          class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      @change="handleFileSelect"
    >

    <!-- Error Message -->
    <div 
      v-if="errorMessage" 
      class="mt-4 p-4 bg-danger-100 border border-danger-200 rounded-lg animate-slide-up"
    >
      <div class="flex items-start">
        <svg class="w-5 h-5 text-danger-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h4 class="text-sm font-medium text-danger-800">Upload Error</h4>
          <p class="text-sm text-danger-700 mt-1">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div 
      v-if="successMessage" 
      class="mt-4 p-4 bg-success-100 border border-success-200 rounded-lg animate-slide-up"
    >
      <div class="flex items-start">
        <svg class="w-5 h-5 text-success-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h4 class="text-sm font-medium text-success-800">Upload Successful</h4>
          <p class="text-sm text-success-700 mt-1">{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB in bytes
  },
  acceptedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  }
})

// Emits
const emit = defineEmits(['file-selected', 'upload-error'])

// Reactive data
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const fileInput = ref(null)
const uploadArea = ref(null)

// Computed properties
const uploadText = computed(() => {
  if (isUploading.value) return 'Processing Receipt...'
  if (isDragOver.value) return 'Drop Receipt Here'
  return 'Upload Receipt Image'
})

const uploadSubtext = computed(() => {
  if (isUploading.value) return 'Please wait while we process your receipt'
  if (isDragOver.value) return 'Release to upload your receipt'
  return 'Drag and drop your receipt here, or click to browse'
})

// File validation
const validateFile = (file) => {
  // Clear previous messages
  errorMessage.value = ''
  successMessage.value = ''

  // Check if file exists
  if (!file) {
    errorMessage.value = 'No file selected. Please choose a receipt image.'
    return false
  }

  // Check file type
  if (!props.acceptedTypes.includes(file.type)) {
    errorMessage.value = `Invalid file type. Please upload a JPG, PNG, or WEBP image. You selected: ${file.type}`
    return false
  }

  // Check file size
  if (file.size > props.maxSize) {
    const maxSizeMB = (props.maxSize / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    errorMessage.value = `File too large. Maximum size is ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`
    return false
  }

  // Check if file is actually an image (additional validation)
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Selected file is not a valid image. Please choose a receipt photo.'
    return false
  }

  return true
}

// Drag and drop handlers
const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDragEnter = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  // Only set isDragOver to false if we're leaving the upload area entirely
  if (!uploadArea.value?.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false

  if (isUploading.value) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

// File input handlers
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

// File processing
const processFile = async (file) => {
  if (!validateFile(file)) {
    emit('upload-error', errorMessage.value)
    return
  }

  try {
    // Start upload simulation
    isUploading.value = true
    uploadProgress.value = 0

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      uploadProgress.value += Math.random() * 30
      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100
        clearInterval(progressInterval)
      }
    }, 200)

    // Wait for progress to complete
    await new Promise(resolve => {
      const checkProgress = () => {
        if (uploadProgress.value >= 100) {
          resolve()
        } else {
          setTimeout(checkProgress, 100)
        }
      }
      checkProgress()
    })

    // Success state
    successMessage.value = `Receipt "${file.name}" uploaded successfully! Ready for processing.`
    
    // Emit the file to parent component
    emit('file-selected', file)

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

  } catch (error) {
    errorMessage.value = 'An unexpected error occurred while uploading. Please try again.'
    emit('upload-error', error.message)
    console.error('Upload error:', error)
  } finally {
    // Reset upload state after a brief delay
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 1000)
  }
}

// Clear messages after delay
const clearMessages = () => {
  setTimeout(() => {
    errorMessage.value = ''
    successMessage.value = ''
  }, 5000)
}

// Watch for message changes to auto-clear
import { watch } from 'vue'

watch([errorMessage, successMessage], () => {
  if (errorMessage.value || successMessage.value) {
    clearMessages()
  }
})

// Expose methods for parent component if needed
defineExpose({
  clearMessages: () => {
    errorMessage.value = ''
    successMessage.value = ''
  },
  isUploading: () => isUploading.value
})
</script>

<style scoped>
/* Custom styles for enhanced visual feedback */
.loading-spinner {
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Enhanced hover effects */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Drag over animation */
@keyframes pulse-border {
  0%, 100% {
    border-color: theme('colors.primary.500');
  }
  50% {
    border-color: theme('colors.primary.600');
  }
}

/* Mobile touch improvements */
@media (hover: none) and (pointer: coarse) {
  .cursor-pointer:hover {
    transform: none;
  }
}
</style>