<template>
  <div class="file-upload-container">
    <!-- Drag and Drop Zone -->
    <div
      ref="dropZone"
      class="drop-zone"
      :class="{
        'drag-over': isDragOver,
        'uploading': isUploading,
        'error': hasError
      }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="openFileDialog"
    >
      <div class="drop-zone-content">
        <div v-if="!isUploading" class="upload-icon">
          <Icon name="upload-cloud" :size="32" class="text-gray-400" />
        </div>
        <div v-else class="upload-progress">
          <Icon name="loader-2" :size="32" class="text-blue-500 animate-spin" />
        </div>
        
        <div class="upload-text">
          <p v-if="!isUploading" class="text-sm font-medium text-gray-700">
            Drop files here or click to browse
          </p>
          <p v-else class="text-sm font-medium text-blue-600">
            Uploading {{ uploadProgress }}%
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
      accept="*/*"
    />

    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length > 0" class="selected-files mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">
        Selected Files ({{ selectedFiles.length }})
      </h4>
      <div class="files-list space-y-2">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="file-info flex items-center space-x-3">
            <div class="file-icon">
              <Icon :name="getFileIcon(file.type)" :size="20" class="text-gray-500" />
            </div>
            <div class="file-details">
              <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
            </div>
          </div>
          <button
            @click="removeFile(index)"
            class="remove-btn p-1 hover:bg-gray-200 rounded-full transition-colors"
            :disabled="isUploading"
          >
            <Icon name="x" :size="16" class="text-gray-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Actions -->
    <div v-if="selectedFiles.length > 0" class="upload-actions mt-4 flex justify-end space-x-2">
      <button
        @click="clearFiles"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        :disabled="isUploading"
      >
        Clear
      </button>
      <button
        @click="uploadFiles"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isUploading || selectedFiles.length === 0"
      >
        <span v-if="!isUploading">Upload Files</span>
        <span v-else>Uploading...</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <div class="flex items-center space-x-2">
        <Icon name="alert-circle" :size="16" class="text-red-500" />
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '#components'

interface Props {
  messageId?: number
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedTypes?: string[]
}

interface Emits {
  (e: 'upload-success', attachments: any[]): void
  (e: 'upload-error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxFileSize: 52428800, // 50MB
  acceptedTypes: () => []
})

const emit = defineEmits<Emits>()

// Reactive state
const dropZone = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const hasError = computed(() => !!errorMessage.value)

// Drag and drop handlers
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  // Only set to false if leaving the drop zone entirely
  if (!dropZone.value?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  addFiles(files)
}

// File selection handlers
const openFileDialog = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFiles(files)
  
  // Clear the input so the same file can be selected again
  target.value = ''
}

// File management
const addFiles = (files: File[]) => {
  errorMessage.value = ''
  
  // Validate files
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > props.maxFileSize) {
      errorMessage.value = `File "${file.name}" is too large. Maximum size is ${formatFileSize(props.maxFileSize)}.`
      return false
    }
    
    // Check file type if restrictions exist
    if (props.acceptedTypes.length > 0 && !props.acceptedTypes.includes(file.type)) {
      errorMessage.value = `File "${file.name}" is not an accepted file type.`
      return false
    }
    
    return true
  })
  
  // Check total file count
  const totalFiles = selectedFiles.value.length + validFiles.length
  if (totalFiles > props.maxFiles) {
    errorMessage.value = `Cannot select more than ${props.maxFiles} files.`
    return
  }
  
  selectedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  errorMessage.value = ''
}

const clearFiles = () => {
  selectedFiles.value = []
  errorMessage.value = ''
}

// File upload
const uploadFiles = async () => {
  if (!props.messageId || selectedFiles.value.length === 0) {
    errorMessage.value = 'No message ID provided or no files selected.'
    return
  }
  
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  
  try {
    const formData = new FormData()
    formData.append('message_id', props.messageId.toString())
    
    selectedFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    const { $fetch } = useNuxtApp()
    const { token } = useAuthStore()
    
    const response = await $fetch('/api/message-attachments', {
      method: 'POST',
      baseURL: 'http://localhost:8000',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      onUploadProgress: (progress) => {
        uploadProgress.value = Math.round((progress.loaded / progress.total) * 100)
      }
    })
    
    emit('upload-success', response.attachments)
    clearFiles()
  } catch (error: any) {
    console.error('Upload failed:', error)
    errorMessage.value = error.data?.message || 'Failed to upload files. Please try again.'
    emit('upload-error', errorMessage.value)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Utility functions
const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'music'
  if (mimeType.includes('pdf')) return 'file-text'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-spreadsheet'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive'
  return 'file'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.drop-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200;
}

.drop-zone:hover {
  @apply border-gray-400 bg-gray-50;
}

.drop-zone.drag-over {
  @apply border-blue-500 bg-blue-50;
}

.drop-zone.uploading {
  @apply border-blue-500 bg-blue-50 cursor-not-allowed;
}

.drop-zone.error {
  @apply border-red-500 bg-red-50;
}

.drop-zone-content {
  @apply flex flex-col items-center space-y-3;
}

.file-item {
  @apply transition-all duration-200;
}

.file-item:hover {
  @apply bg-gray-100;
}

.remove-btn:hover {
  @apply bg-gray-200;
}
</style>