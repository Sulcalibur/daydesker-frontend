<template>
  <div class="file-preview-container">
    <!-- Image Preview -->
    <div v-if="isImage" class="image-preview">
      <div class="image-container" @click="openLightbox">
        <img
          :src="previewUrl"
          :alt="attachment.original_name"
          class="preview-image"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div class="image-overlay">
          <Icon name="eye" :size="20" class="text-white" />
        </div>
      </div>
      <div class="file-info">
        <p class="file-name">{{ attachment.original_name }}</p>
        <p class="file-size">{{ formatFileSize(attachment.file_size) }}</p>
      </div>
    </div>

    <!-- Video Preview -->
    <div v-else-if="isVideo" class="video-preview">
      <div class="video-container">
        <video
          :src="previewUrl"
          class="preview-video"
          controls
          preload="metadata"
          @loadedmetadata="onVideoLoad"
          @error="onVideoError"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="file-info">
        <p class="file-name">{{ attachment.original_name }}</p>
        <p class="file-size">{{ formatFileSize(attachment.file_size) }}</p>
      </div>
    </div>

    <!-- Audio Preview -->
    <div v-else-if="isAudio" class="audio-preview">
      <div class="audio-container">
        <div class="audio-icon">
          <Icon name="music" :size="32" class="text-blue-500" />
        </div>
        <audio
          :src="previewUrl"
          class="audio-player"
          controls
          preload="metadata"
          @loadedmetadata="onAudioLoad"
          @error="onAudioError"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
      <div class="file-info">
        <p class="file-name">{{ attachment.original_name }}</p>
        <p class="file-size">{{ formatFileSize(attachment.file_size) }}</p>
      </div>
    </div>

    <!-- Document/File Preview -->
    <div v-else class="document-preview">
      <div class="document-container" @click="downloadFile">
        <div class="document-icon">
          <Icon :name="getFileIcon(attachment.mime_type)" :size="32" class="text-gray-500" />
        </div>
        <div class="document-info">
          <p class="file-name">{{ attachment.original_name }}</p>
          <p class="file-size">{{ formatFileSize(attachment.file_size) }}</p>
          <p class="file-type">{{ getFileTypeLabel(attachment.mime_type) }}</p>
        </div>
        <div class="download-icon">
          <Icon name="download" :size="20" class="text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <Icon name="loader-2" :size="24" class="text-blue-500 animate-spin" />
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="error-overlay">
      <Icon name="alert-circle" :size="24" class="text-red-500" />
      <p class="text-sm text-red-600 mt-1">Failed to load</p>
    </div>

    <!-- Actions Menu -->
    <div class="actions-menu" v-if="showActions">
      <button
        @click="downloadFile"
        class="action-btn"
        title="Download"
      >
        <Icon name="download" :size="16" />
      </button>
      <button
        v-if="canDelete"
        @click="deleteFile"
        class="action-btn delete-btn"
        title="Delete"
      >
        <Icon name="trash-2" :size="16" />
      </button>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="showLightbox"
        class="lightbox-overlay"
        @click="closeLightbox"
        @keydown.esc="closeLightbox"
        tabindex="0"
      >
        <div class="lightbox-container" @click.stop>
          <button
            @click="closeLightbox"
            class="lightbox-close"
          >
            <Icon name="x" :size="24" class="text-white" />
          </button>
          <img
            :src="previewUrl"
            :alt="attachment.original_name"
            class="lightbox-image"
          />
          <div class="lightbox-info">
            <p class="text-white text-lg font-medium">{{ attachment.original_name }}</p>
            <p class="text-gray-300 text-sm">{{ formatFileSize(attachment.file_size) }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '#components'

interface MessageAttachment {
  id: number
  message_id: number
  file_name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  file_type: string
  created_at: string
  updated_at: string
}

interface Props {
  attachment: MessageAttachment
  showActions?: boolean
  canDelete?: boolean
}

interface Emits {
  (e: 'delete', attachmentId: number): void
  (e: 'download-error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  canDelete: false
})

const emit = defineEmits<Emits>()

// Reactive state
const isLoading = ref(false)
const hasError = ref(false)
const showLightbox = ref(false)
const previewUrl = ref('')

// Computed properties
const isImage = computed(() => props.attachment.file_type === 'image')
const isVideo = computed(() => props.attachment.file_type === 'video')
const isAudio = computed(() => props.attachment.file_type === 'audio')
const isDocument = computed(() => props.attachment.file_type === 'document')

// Generate preview URL
const generatePreviewUrl = () => {
  const { token } = useAuthStore()
  return `http://localhost:8000/api/message-attachments/${props.attachment.id}/download?token=${token}`
}

// Media load handlers
const onImageLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const onImageError = () => {
  isLoading.value = false
  hasError.value = true
}

const onVideoLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const onVideoError = () => {
  isLoading.value = false
  hasError.value = true
}

const onAudioLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const onAudioError = () => {
  isLoading.value = false
  hasError.value = true
}

// Lightbox handlers
const openLightbox = () => {
  if (isImage.value && !hasError.value) {
    showLightbox.value = true
    document.body.style.overflow = 'hidden'
  }
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

// File actions
const downloadFile = async () => {
  try {
    const { token } = useAuthStore()
    const response = await fetch(`http://localhost:8000/api/message-attachments/${props.attachment.id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Download failed')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.attachment.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    emit('download-error', 'Failed to download file')
  }
}

const deleteFile = () => {
  if (confirm(`Are you sure you want to delete "${props.attachment.original_name}"?`)) {
    emit('delete', props.attachment.id)
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

const getFileTypeLabel = (mimeType: string): string => {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
    'application/zip': 'ZIP Archive',
    'application/x-rar-compressed': 'RAR Archive',
    'text/plain': 'Text File',
    'text/csv': 'CSV File'
  }
  
  return typeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'Unknown'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Initialize component
onMounted(() => {
  previewUrl.value = generatePreviewUrl()
  if (isImage.value || isVideo.value || isAudio.value) {
    isLoading.value = true
  }
})
</script>

<style scoped>
.file-preview-container {
  @apply relative max-w-sm;
}

/* Image Preview */
.image-preview {
  @apply space-y-2;
}

.image-container {
  @apply relative cursor-pointer overflow-hidden rounded-lg bg-gray-100;
}

.preview-image {
  @apply w-full h-auto max-h-64 object-cover transition-transform duration-200;
}

.image-container:hover .preview-image {
  @apply scale-105;
}

.image-overlay {
  @apply absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-200;
}

.image-container:hover .image-overlay {
  @apply bg-opacity-30;
}

/* Video Preview */
.video-preview {
  @apply space-y-2;
}

.video-container {
  @apply rounded-lg overflow-hidden bg-gray-100;
}

.preview-video {
  @apply w-full h-auto max-h-64;
}

/* Audio Preview */
.audio-preview {
  @apply space-y-2;
}

.audio-container {
  @apply p-4 bg-gray-50 rounded-lg flex flex-col items-center space-y-3;
}

.audio-player {
  @apply w-full;
}

/* Document Preview */
.document-preview {
  @apply cursor-pointer;
}

.document-container {
  @apply flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors;
}

.document-info {
  @apply flex-1 min-w-0;
}

/* File Info */
.file-info {
  @apply space-y-1;
}

.file-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.file-size {
  @apply text-xs text-gray-500;
}

.file-type {
  @apply text-xs text-gray-400;
}

/* Loading and Error States */
.loading-overlay,
.error-overlay {
  @apply absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-lg;
}

/* Actions Menu */
.actions-menu {
  @apply absolute top-2 right-2 flex space-x-1;
}

.action-btn {
  @apply p-1.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200;
}

.delete-btn {
  @apply text-red-500 hover:text-red-600;
}

/* Lightbox */
.lightbox-overlay {
  @apply fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50;
}

.lightbox-container {
  @apply relative max-w-4xl max-h-full p-4;
}

.lightbox-close {
  @apply absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors z-10;
}

.lightbox-image {
  @apply max-w-full max-h-full object-contain;
}

.lightbox-info {
  @apply absolute bottom-4 left-4 right-4 text-center;
}
</style>