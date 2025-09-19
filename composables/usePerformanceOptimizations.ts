import { ref, computed, readonly, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'

export interface PerformanceMetrics {
  messageRenderTime: number
  scrollPerformance: number
  memoryUsage: number
  connectionLatency: number
  frameRate: number
  bundleSize: number
}

export interface OptimizationConfig {
  enableVirtualScrolling: boolean
  enableMessageBatching: boolean
  enableImageLazyLoading: boolean
  enableConnectionPooling: boolean
  maxCachedMessages: number
  batchSize: number
  debounceDelay: number
}

export const usePerformanceOptimizations = () => {
  const metrics: Ref<PerformanceMetrics> = ref({
    messageRenderTime: 0,
    scrollPerformance: 0,
    memoryUsage: 0,
    connectionLatency: 0,
    frameRate: 0,
    bundleSize: 0
  })

  const config: Ref<OptimizationConfig> = ref({
    enableVirtualScrolling: true,
    enableMessageBatching: true,
    enableImageLazyLoading: true,
    enableConnectionPooling: true,
    maxCachedMessages: 1000,
    batchSize: 50,
    debounceDelay: 300
  })

  const isMonitoring = ref(false)
  const performanceObserver: Ref<PerformanceObserver | null> = ref(null)
  const frameRateMonitor: Ref<number | null> = ref(null)
  const memoryMonitor: Ref<NodeJS.Timeout | null> = ref(null)

  // Message batching
  const messageBatch: Ref<any[]> = ref([])
  const batchTimeout: Ref<NodeJS.Timeout | null> = ref(null)
  const batchCallbacks: Ref<((messages: any[]) => void)[]> = ref([])

  // Connection pooling
  const connectionPool: Ref<Map<string, any>> = ref(new Map())
  const maxConnections = 5

  // Image lazy loading
  const imageObserver: Ref<IntersectionObserver | null> = ref(null)
  const lazyImages: Ref<Set<HTMLImageElement>> = ref(new Set())

  // Virtual scrolling
  const virtualScrollConfig = ref({
    itemHeight: 80,
    containerHeight: 400,
    buffer: 5
  })

  // Start performance monitoring
  const startMonitoring = (): void => {
    if (isMonitoring.value) return

    isMonitoring.value = true

    // Monitor rendering performance
    if ('PerformanceObserver' in window) {
      performanceObserver.value = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('message-render')) {
            metrics.value.messageRenderTime = entry.duration
          }
        })
      })
      performanceObserver.value.observe({ entryTypes: ['measure'] })
    }

    // Monitor frame rate
    startFrameRateMonitoring()

    // Monitor memory usage
    startMemoryMonitoring()
  }

  // Stop performance monitoring
  const stopMonitoring = (): void => {
    isMonitoring.value = false

    if (performanceObserver.value) {
      performanceObserver.value.disconnect()
      performanceObserver.value = null
    }

    if (frameRateMonitor.value) {
      cancelAnimationFrame(frameRateMonitor.value)
      frameRateMonitor.value = null
    }

    if (memoryMonitor.value) {
      clearInterval(memoryMonitor.value)
      memoryMonitor.value = null
    }
  }

  // Monitor frame rate
  const startFrameRateMonitoring = (): void => {
    let lastTime = performance.now()
    let frameCount = 0

    const measureFrameRate = (currentTime: number) => {
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        metrics.value.frameRate = frameCount
        frameCount = 0
        lastTime = currentTime
      }

      frameRateMonitor.value = requestAnimationFrame(measureFrameRate)
    }

    frameRateMonitor.value = requestAnimationFrame(measureFrameRate)
  }

  // Monitor memory usage
  const startMemoryMonitoring = (): void => {
    if ('memory' in performance) {
      memoryMonitor.value = setInterval(() => {
        const memory = (performance as any).memory
        metrics.value.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      }, 5000)
    }
  }

  // Measure message render time
  const measureMessageRender = async (messageId: string, renderFn: () => Promise<void>): Promise<void> => {
    const measureName = `message-render-${messageId}`
    performance.mark(`${measureName}-start`)
    
    await renderFn()
    await nextTick()
    
    performance.mark(`${measureName}-end`)
    performance.measure(measureName, `${measureName}-start`, `${measureName}-end`)
  }

  // Message batching functions
  const addToBatch = (message: any, callback?: (messages: any[]) => void): void => {
    if (!config.value.enableMessageBatching) {
      callback?.([message])
      return
    }

    messageBatch.value.push(message)
    if (callback) {
      batchCallbacks.value.push(callback)
    }

    if (messageBatch.value.length >= config.value.batchSize) {
      processBatch()
    } else if (!batchTimeout.value) {
      batchTimeout.value = setTimeout(processBatch, config.value.debounceDelay)
    }
  }

  const processBatch = (): void => {
    if (messageBatch.value.length === 0) return

    const messages = [...messageBatch.value]
    const callbacks = [...batchCallbacks.value]
    
    messageBatch.value = []
    batchCallbacks.value = []
    
    if (batchTimeout.value) {
      clearTimeout(batchTimeout.value)
      batchTimeout.value = null
    }

    callbacks.forEach(callback => callback(messages))
  }

  // Connection pooling functions
  const getConnection = (key: string, factory: () => any): any => {
    if (!config.value.enableConnectionPooling) {
      return factory()
    }

    if (connectionPool.value.has(key)) {
      return connectionPool.value.get(key)
    }

    if (connectionPool.value.size >= maxConnections) {
      // Remove oldest connection
      const firstKey = connectionPool.value.keys().next().value
      const connection = connectionPool.value.get(firstKey)
      connection?.close?.()
      connectionPool.value.delete(firstKey)
    }

    const connection = factory()
    connectionPool.value.set(key, connection)
    return connection
  }

  const releaseConnection = (key: string): void => {
    const connection = connectionPool.value.get(key)
    if (connection) {
      connection.close?.()
      connectionPool.value.delete(key)
    }
  }

  const clearConnectionPool = (): void => {
    connectionPool.value.forEach(connection => {
      connection.close?.()
    })
    connectionPool.value.clear()
  }

  // Image lazy loading functions
  const initializeLazyLoading = (): void => {
    if (!config.value.enableImageLazyLoading || !('IntersectionObserver' in window)) {
      return
    }

    imageObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              imageObserver.value?.unobserve(img)
              lazyImages.value.delete(img)
            }
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )
  }

  const observeImage = (img: HTMLImageElement): void => {
    if (imageObserver.value && config.value.enableImageLazyLoading) {
      imageObserver.value.observe(img)
      lazyImages.value.add(img)
    }
  }

  const unobserveImage = (img: HTMLImageElement): void => {
    if (imageObserver.value) {
      imageObserver.value.unobserve(img)
      lazyImages.value.delete(img)
    }
  }

  // Virtual scrolling calculations
  const calculateVirtualScrolling = (scrollTop: number, totalItems: number) => {
    if (!config.value.enableVirtualScrolling) {
      return {
        startIndex: 0,
        endIndex: totalItems - 1,
        offsetY: 0
      }
    }

    const { itemHeight, containerHeight, buffer } = virtualScrollConfig.value
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + buffer * 2)
    const offsetY = startIndex * itemHeight

    return {
      startIndex,
      endIndex,
      offsetY,
      visibleCount
    }
  }

  // Debounce function
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number = config.value.debounceDelay
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle function
  const throttle = <T extends (...args: any[]) => void>(
    func: T,
    limit: number = 16 // ~60fps
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Optimize DOM operations
  const batchDOMUpdates = (updates: (() => void)[]): void => {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }

  // Memory cleanup
  const cleanupMemory = (): void => {
    // Clear message batch
    messageBatch.value = []
    batchCallbacks.value = []
    
    if (batchTimeout.value) {
      clearTimeout(batchTimeout.value)
      batchTimeout.value = null
    }

    // Clear connection pool
    clearConnectionPool()

    // Clear lazy images
    lazyImages.value.clear()
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<OptimizationConfig>): void => {
    config.value = { ...config.value, ...newConfig }
  }

  // Get performance report
  const getPerformanceReport = (): PerformanceMetrics & { recommendations: string[] } => {
    const recommendations: string[] = []

    if (metrics.value.frameRate < 30) {
      recommendations.push('Consider enabling virtual scrolling for better performance')
    }

    if (metrics.value.memoryUsage > 0.8) {
      recommendations.push('Memory usage is high, consider reducing cached messages')
    }

    if (metrics.value.messageRenderTime > 16) {
      recommendations.push('Message rendering is slow, consider optimizing components')
    }

    return {
      ...metrics.value,
      recommendations
    }
  }

  // Computed properties
  const isPerformanceGood = computed(() => {
    return metrics.value.frameRate >= 30 && 
           metrics.value.memoryUsage < 0.8 && 
           metrics.value.messageRenderTime < 16
  })

  const optimizationStatus = computed(() => {
    const enabled = Object.values(config.value).filter(v => typeof v === 'boolean' && v).length
    const total = Object.values(config.value).filter(v => typeof v === 'boolean').length
    return `${enabled}/${total} optimizations enabled`
  })

  // Lifecycle
  onMounted(() => {
    initializeLazyLoading()
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
    cleanupMemory()
    
    if (imageObserver.value) {
      imageObserver.value.disconnect()
    }
  })

  return {
    metrics: readonly(metrics),
    config: readonly(config),
    isMonitoring: readonly(isMonitoring),
    isPerformanceGood,
    optimizationStatus,
    startMonitoring,
    stopMonitoring,
    measureMessageRender,
    addToBatch,
    processBatch,
    getConnection,
    releaseConnection,
    clearConnectionPool,
    observeImage,
    unobserveImage,
    calculateVirtualScrolling,
    debounce,
    throttle,
    batchDOMUpdates,
    cleanupMemory,
    updateConfig,
    getPerformanceReport
  }
}