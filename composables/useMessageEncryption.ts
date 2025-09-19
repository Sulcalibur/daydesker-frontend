import { ref, computed, readonly } from 'vue'
import type { Ref } from 'vue'

export interface EncryptionKey {
  id: string
  key: CryptoKey
  algorithm: string
  created_at: Date
  expires_at?: Date
}

export interface EncryptedMessage {
  encrypted_content: string
  iv: string
  key_id: string
  algorithm: string
}

export const useMessageEncryption = () => {
  const isSupported = ref(false)
  const isInitialized = ref(false)
  const currentKey: Ref<EncryptionKey | null> = ref(null)
  const keyStore: Ref<Map<string, EncryptionKey>> = ref(new Map())
  const error = ref<string | null>(null)

  // Check if Web Crypto API is supported
  const checkSupport = (): boolean => {
    const supported = typeof window !== 'undefined' && 
                     'crypto' in window && 
                     'subtle' in window.crypto
    isSupported.value = supported
    return supported
  }

  // Generate a new encryption key
  const generateKey = async (): Promise<EncryptionKey> => {
    try {
      if (!checkSupport()) {
        throw new Error('Web Crypto API is not supported')
      }

      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // extractable
        ['encrypt', 'decrypt']
      )

      const keyId = generateKeyId()
      const encryptionKey: EncryptionKey = {
        id: keyId,
        key,
        algorithm: 'AES-GCM',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      keyStore.value.set(keyId, encryptionKey)
      currentKey.value = encryptionKey

      // Store key metadata in localStorage (not the actual key)
      await storeKeyMetadata(encryptionKey)

      return encryptionKey
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Generate a unique key ID
  const generateKeyId = (): string => {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Encrypt a message
  const encryptMessage = async (content: string, keyId?: string): Promise<EncryptedMessage> => {
    try {
      if (!checkSupport()) {
        throw new Error('Web Crypto API is not supported')
      }

      const key = keyId ? keyStore.value.get(keyId) : currentKey.value
      if (!key) {
        throw new Error('No encryption key available')
      }

      // Generate a random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12))
      
      // Encode the content
      const encoder = new TextEncoder()
      const data = encoder.encode(content)

      // Encrypt the data
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key.key,
        data
      )

      // Convert to base64 for storage
      const encryptedContent = arrayBufferToBase64(encryptedData)
      const ivBase64 = arrayBufferToBase64(iv)

      return {
        encrypted_content: encryptedContent,
        iv: ivBase64,
        key_id: key.id,
        algorithm: key.algorithm
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Decrypt a message
  const decryptMessage = async (encryptedMessage: EncryptedMessage): Promise<string> => {
    try {
      if (!checkSupport()) {
        throw new Error('Web Crypto API is not supported')
      }

      const key = keyStore.value.get(encryptedMessage.key_id)
      if (!key) {
        throw new Error(`Encryption key ${encryptedMessage.key_id} not found`)
      }

      // Convert from base64
      const encryptedData = base64ToArrayBuffer(encryptedMessage.encrypted_content)
      const iv = base64ToArrayBuffer(encryptedMessage.iv)

      // Decrypt the data
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key.key,
        encryptedData
      )

      // Decode the content
      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Export key for sharing
  const exportKey = async (keyId: string): Promise<string> => {
    try {
      const key = keyStore.value.get(keyId)
      if (!key) {
        throw new Error('Key not found')
      }

      const exportedKey = await window.crypto.subtle.exportKey('jwk', key.key)
      return JSON.stringify(exportedKey)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Import key from string
  const importKey = async (keyData: string, keyId?: string): Promise<EncryptionKey> => {
    try {
      const jwk = JSON.parse(keyData)
      const key = await window.crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      )

      const id = keyId || generateKeyId()
      const encryptionKey: EncryptionKey = {
        id,
        key,
        algorithm: 'AES-GCM',
        created_at: new Date()
      }

      keyStore.value.set(id, encryptionKey)
      return encryptionKey
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Store key metadata in localStorage
  const storeKeyMetadata = async (encryptionKey: EncryptionKey): Promise<void> => {
    try {
      const metadata = {
        id: encryptionKey.id,
        algorithm: encryptionKey.algorithm,
        created_at: encryptionKey.created_at.toISOString(),
        expires_at: encryptionKey.expires_at?.toISOString()
      }

      const stored = JSON.parse(localStorage.getItem('encryption_keys') || '[]')
      const existing = stored.findIndex((k: any) => k.id === encryptionKey.id)
      
      if (existing >= 0) {
        stored[existing] = metadata
      } else {
        stored.push(metadata)
      }

      localStorage.setItem('encryption_keys', JSON.stringify(stored))
    } catch (err: any) {
      console.warn('Failed to store key metadata:', err)
    }
  }

  // Load key metadata from localStorage
  const loadKeyMetadata = (): void => {
    try {
      const stored = JSON.parse(localStorage.getItem('encryption_keys') || '[]')
      // Note: We only load metadata, actual keys need to be regenerated or imported
      console.log('Loaded key metadata:', stored)
    } catch (err: any) {
      console.warn('Failed to load key metadata:', err)
    }
  }

  // Clean up expired keys
  const cleanupExpiredKeys = (): void => {
    const now = new Date()
    const keysToRemove: string[] = []

    keyStore.value.forEach((key, keyId) => {
      if (key.expires_at && key.expires_at < now) {
        keysToRemove.push(keyId)
      }
    })

    keysToRemove.forEach(keyId => {
      keyStore.value.delete(keyId)
    })

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired keys`)
    }
  }

  // Utility functions
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Initialize encryption
  const initialize = async (): Promise<void> => {
    try {
      if (!checkSupport()) {
        console.warn('Message encryption not supported in this browser')
        return
      }

      loadKeyMetadata()
      cleanupExpiredKeys()

      // Generate initial key if none exists
      if (!currentKey.value) {
        await generateKey()
      }

      isInitialized.value = true
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to initialize encryption:', err)
    }
  }

  // Check if encryption is enabled for conversation
  const isEncryptionEnabled = (conversationId: number): boolean => {
    // This would typically check conversation settings
    // For now, return false by default (encryption is opt-in)
    return false
  }

  // Toggle encryption for conversation
  const toggleEncryption = async (conversationId: number, enabled: boolean): Promise<void> => {
    try {
      // This would typically make an API call to update conversation settings
      console.log(`Encryption ${enabled ? 'enabled' : 'disabled'} for conversation ${conversationId}`)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Computed properties
  const hasCurrentKey = computed(() => currentKey.value !== null)
  const keyCount = computed(() => keyStore.value.size)
  const isReady = computed(() => isSupported.value && isInitialized.value && hasCurrentKey.value)

  return {
    isSupported: readonly(isSupported),
    isInitialized: readonly(isInitialized),
    currentKey: readonly(currentKey),
    keyStore: readonly(keyStore),
    error: readonly(error),
    hasCurrentKey,
    keyCount,
    isReady,
    checkSupport,
    generateKey,
    encryptMessage,
    decryptMessage,
    exportKey,
    importKey,
    initialize,
    isEncryptionEnabled,
    toggleEncryption,
    cleanupExpiredKeys
  }
}