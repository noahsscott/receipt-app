<template>
  <div v-if="imageFile" class="w-full max-w-4xl mx-auto">
    <!-- Header with Controls -->
    <div class="bg-white rounded-t-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-900">{{ fileName }}</h3>
          <p class="text-xs text-gray-500">{{ fileSize }} • {{ imageDimensions }}</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <!-- Rotation Controls -->
        <button
          @click="rotateImage(-90)"
          :disabled="isProcessing"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rotate Left"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2h-2m-7 4a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2z"></path>
          </svg>
        </button>
        
        <button
          @click="rotateImage(90)"
          :disabled="isProcessing"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rotate Right"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2h-2m-7 4a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2z"></path>
          </svg>
        </button>
        
        <!-- Zoom Controls -->
        <div class="flex items-center space-x-1 border-l border-gray-200 pl-2 ml-2">
          <button
            @click="zoomOut"
            :disabled="zoomLevel <= 0.5 || isProcessing"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
          </button>
          
          <span class="text-xs text-gray-500 min-w-[3rem] text-center">{{ Math.round(zoomLevel * 100) }}%</span>
          
          <button
            @click="zoomIn"
            :disabled="zoomLevel >= 3 || isProcessing"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </button>
        </div>
        
        <!-- Remove Button -->
        <button
          @click="clearImage"
          :disabled="isProcessing"
          class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 ml-2 pl-2"
          title="Remove Image"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Image Container -->
    <div 
      ref="imageContainer"
      class="relative bg-gray-900 rounded-b-xl border-x border-b border-gray-200 overflow-hidden"
      :style="{ height: containerHeight }"
    >
      <!-- Image Display Area -->
      <div
        ref="imageWrapper"
        class="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        @mousedown="startPan"
        @mousemove="handlePan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @wheel="handleWheel"
        @touchstart="startTouch"
        @touchmove="handleTouch"
        @touchend="endTouch"
      >
        <img
          ref="previewImage"
          :src="imageDataUrl"
          :alt="fileName"
          class="max-w-none transition-transform duration-200 ease-out select-none"
          :style="imageStyle"
          @load="handleImageLoad"
          @error="handleImageError"
          draggable="false"
        />
      </div>

      <!-- Processing Overlay -->
      <div 
        v-if="isProcessing"
        class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="text-center text-white">
          <div class="loading-spinner w-12 h-12 border-white/30 border-t-white mx-auto mb-4"></div>
          <h4 class="text-lg font-medium mb-2">Processing Receipt</h4>
          <p class="text-sm text-gray-300">Extracting text and data...</p>
        </div>
      </div>

      <!-- Image Loading -->
      <div 
        v-if="isLoading"
        class="absolute inset-0 bg-gray-100 flex items-center justify-center"
      >
        <div class="text-center text-gray-600">
          <div class="loading-spinner w-8 h-8 border-gray-300 border-t-gray-600 mx-auto mb-3"></div>
          <p class="text-sm">Loading image...</p>
        </div>
      </div>

      <!-- Error State -->
      <div 
        v-if="hasError"
        class="absolute inset-0 bg-red-50 flex items-center justify-center"
      >
        <div class="text-center text-red-600">
          <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-sm font-medium">Failed to load image</p>
        </div>
      </div>

      <!-- Reset View Button (visible when panned/zoomed) -->
      <button
        v-if="(zoomLevel !== 1 || panX !== 0 || panY !== 0) && !isProcessing"
        @click="resetView"
        class="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
      >
        Reset View
      </button>
    </div>

    <!-- Image Info Footer -->
    <div class="bg-gray-50 px-4 py-3 rounded-b-xl border-x border-b border-gray-200 text-xs text-gray-600">
      <div class="flex justify-between items-center">
        <span>Rotation: {{ rotation }}° • Zoom: {{ Math.round(zoomLevel * 100) }}%</span>
        <span class="text-gray-500">{{ fileLastModified }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  imageFile: {
    type: File,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: String,
    default: '70vh'
  }
})

// Emits
const emit = defineEmits(['image-cleared', 'image-rotated', 'processing-complete'])

// Refs
const imageContainer = ref(null)
const imageWrapper = ref(null)
const previewImage = ref(null)

// Reactive data
const imageDataUrl = ref('')
const isLoading = ref(true)
const hasError = ref(false)
const rotation = ref(0)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const naturalWidth = ref(0)
const naturalHeight = ref(0)

// Pan state
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const lastPanX = ref(0)
const lastPanY = ref(0)

// Touch state
const lastTouchDistance = ref(0)
const isTouching = ref(false)

// Computed properties
const fileName = computed(() => {
  return props.imageFile?.name || 'Unknown'
})

const fileSize = computed(() => {
  const bytes = props.imageFile?.size || 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const fileLastModified = computed(() => {
  if (!props.imageFile?.lastModified) return ''
  return new Date(props.imageFile.lastModified).toLocaleDateString()
})

const imageDimensions = computed(() => {
  if (!naturalWidth.value || !naturalHeight.value) return ''
  return `${naturalWidth.value} × ${naturalHeight.value}`
})

const containerHeight = computed(() => {
  return props.maxHeight
})

const imageStyle = computed(() => {
  return {
    transform: `rotate(${rotation.value}deg) scale(${zoomLevel.value}) translate(${panX.value}px, ${panY.value}px)`,
    transformOrigin: 'center center'
  }
})

// File reading
const loadImageFromFile = async () => {
  if (!props.imageFile) {
    console.log('No image file provided')
    return
  }

  console.log('Loading image file:', props.imageFile.name, props.imageFile.type, props.imageFile.size)
  
  isLoading.value = true
  hasError.value = false

  try {
    // Clean up previous URL
    if (imageDataUrl.value && imageDataUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imageDataUrl.value)
    }

    // Create object URL for better performance and reliability
    const objectUrl = URL.createObjectURL(props.imageFile)
    imageDataUrl.value = objectUrl
    
    console.log('Created object URL:', objectUrl)
    isLoading.value = false

  } catch (error) {
    console.error('Error creating object URL:', error)
    
    // Fallback to FileReader
    try {
      console.log('Falling back to FileReader...')
      const reader = new FileReader()
      
      reader.onload = (e) => {
        console.log('FileReader loaded successfully')
        imageDataUrl.value = e.target.result
        isLoading.value = false
      }
      
      reader.onerror = (e) => {
        console.error('FileReader error:', e)
        hasError.value = true
        isLoading.value = false
      }
      
      reader.readAsDataURL(props.imageFile)
    } catch (fallbackError) {
      console.error('FileReader fallback failed:', fallbackError)
      hasError.value = true
      isLoading.value = false
    }
  }
}

// Image transformations
const rotateImage = (degrees) => {
  rotation.value = (rotation.value + degrees) % 360
  emit('image-rotated', rotation.value)
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

const resetView = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  rotation.value = 0
}

// Pan functionality
const startPan = (e) => {
  if (isLoading.value || hasError.value || props.isProcessing) return
  
  isPanning.value = true
  panStartX.value = e.clientX - panX.value
  panStartY.value = e.clientY - panY.value
  lastPanX.value = panX.value
  lastPanY.value = panY.value
}

const handlePan = (e) => {
  if (!isPanning.value) return
  
  e.preventDefault()
  panX.value = e.clientX - panStartX.value
  panY.value = e.clientY - panStartY.value
}

const endPan = () => {
  isPanning.value = false
}

// Wheel zoom
const handleWheel = (e) => {
  if (isLoading.value || hasError.value || props.isProcessing) return
  
  e.preventDefault()
  const delta = e.deltaY > 0 ? -1 : 1
  const zoomFactor = 1.1
  
  if (delta > 0) {
    zoomLevel.value = Math.min(zoomLevel.value * zoomFactor, 3)
  } else {
    zoomLevel.value = Math.max(zoomLevel.value / zoomFactor, 0.5)
  }
}

// Touch functionality
const getTouchDistance = (touches) => {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const startTouch = (e) => {
  if (isLoading.value || hasError.value || props.isProcessing) return
  
  isTouching.value = true
  
  if (e.touches.length === 2) {
    // Pinch zoom
    lastTouchDistance.value = getTouchDistance(e.touches)
  } else if (e.touches.length === 1) {
    // Pan
    const touch = e.touches[0]
    panStartX.value = touch.clientX - panX.value
    panStartY.value = touch.clientY - panY.value
  }
}

const handleTouch = (e) => {
  if (!isTouching.value) return
  
  e.preventDefault()
  
  if (e.touches.length === 2) {
    // Pinch zoom
    const currentDistance = getTouchDistance(e.touches)
    if (lastTouchDistance.value > 0) {
      const zoomFactor = currentDistance / lastTouchDistance.value
      zoomLevel.value = Math.max(0.5, Math.min(3, zoomLevel.value * zoomFactor))
    }
    lastTouchDistance.value = currentDistance
  } else if (e.touches.length === 1) {
    // Pan
    const touch = e.touches[0]
    panX.value = touch.clientX - panStartX.value
    panY.value = touch.clientY - panStartY.value
  }
}

const endTouch = () => {
  isTouching.value = false
  lastTouchDistance.value = 0
}

// Event handlers
const handleImageLoad = (e) => {
  console.log('Image loaded successfully:', e.target.src)
  naturalWidth.value = e.target.naturalWidth
  naturalHeight.value = e.target.naturalHeight
  isLoading.value = false
  hasError.value = false
}

const handleImageError = (e) => {
  console.error('Image failed to load:', e.target.src, e)
  hasError.value = true
  isLoading.value = false
}

const clearImage = () => {
  emit('image-cleared')
}

// Cleanup
const cleanup = () => {
  if (imageDataUrl.value && imageDataUrl.value.startsWith('blob:')) {
    console.log('Cleaning up object URL:', imageDataUrl.value)
    URL.revokeObjectURL(imageDataUrl.value)
    imageDataUrl.value = ''
  }
}

// Watchers
watch(() => props.imageFile, () => {
  if (props.imageFile) {
    resetView()
    loadImageFromFile()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.imageFile) {
    loadImageFromFile()
  }
})

onUnmounted(() => {
  cleanup()
})

// Expose methods
defineExpose({
  rotateImage,
  resetView,
  getTransformedImageData: () => ({
    rotation: rotation.value,
    zoom: zoomLevel.value,
    pan: { x: panX.value, y: panY.value }
  })
})
</script>

<style scoped>
.loading-spinner {
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Disable text selection on image */
img {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  display: none;
}

/* Touch improvements */
@media (hover: none) and (pointer: coarse) {
  .cursor-grab {
    cursor: default;
  }
  
  .cursor-grabbing {
    cursor: default;
  }
}
</style>