import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface TouchGesture {
  type: 'swipe' | 'tap' | 'long-press' | 'pinch'
  direction?: 'left' | 'right' | 'up' | 'down'
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  distance: number
}

export interface SwipeAction {
  direction: 'left' | 'right'
  threshold: number
  callback: (gesture: TouchGesture) => void
}

export const useTouchOptimizations = () => {
  const isTouchDevice = ref(false)
  const isLongPress = ref(false)
  const touchStart: Ref<Touch | null> = ref(null)
  const touchStartTime = ref(0)
  const swipeActions: Ref<SwipeAction[]> = ref([])
  const longPressTimeout: Ref<NodeJS.Timeout | null> = ref(null)
  const hapticFeedback = ref(true)

  // Touch thresholds
  const SWIPE_THRESHOLD = 50
  const LONG_PRESS_DURATION = 500
  const TAP_THRESHOLD = 10
  const VELOCITY_THRESHOLD = 0.3

  // Detect if device supports touch
  const detectTouchDevice = (): boolean => {
    const hasTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 || 
                    (navigator as any).msMaxTouchPoints > 0
    isTouchDevice.value = hasTouch
    return hasTouch
  }

  // Handle touch start
  const handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      touchStart.value = touch
      touchStartTime.value = Date.now()
      isLongPress.value = false

      // Start long press timer
      longPressTimeout.value = setTimeout(() => {
        isLongPress.value = true
        triggerHapticFeedback('medium')
        
        const gesture: TouchGesture = {
          type: 'long-press',
          startX: touch.clientX,
          startY: touch.clientY,
          endX: touch.clientX,
          endY: touch.clientY,
          duration: LONG_PRESS_DURATION,
          distance: 0
        }
        
        handleGesture(gesture)
      }, LONG_PRESS_DURATION)
    }
  }

  // Handle touch move
  const handleTouchMove = (event: TouchEvent): void => {
    if (longPressTimeout.value) {
      clearTimeout(longPressTimeout.value)
      longPressTimeout.value = null
    }
  }

  // Handle touch end
  const handleTouchEnd = (event: TouchEvent): void => {
    if (longPressTimeout.value) {
      clearTimeout(longPressTimeout.value)
      longPressTimeout.value = null
    }

    if (!touchStart.value || isLongPress.value) {
      return
    }

    const touch = event.changedTouches[0]
    const endTime = Date.now()
    const duration = endTime - touchStartTime.value
    
    const deltaX = touch.clientX - touchStart.value.clientX
    const deltaY = touch.clientY - touchStart.value.clientY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / duration

    let gesture: TouchGesture

    // Determine gesture type
    if (distance < TAP_THRESHOLD) {
      // Tap gesture
      gesture = {
        type: 'tap',
        startX: touchStart.value.clientX,
        startY: touchStart.value.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance
      }
    } else if (distance > SWIPE_THRESHOLD && velocity > VELOCITY_THRESHOLD) {
      // Swipe gesture
      const direction = getSwipeDirection(deltaX, deltaY)
      gesture = {
        type: 'swipe',
        direction,
        startX: touchStart.value.clientX,
        startY: touchStart.value.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance
      }
    } else {
      return // No valid gesture
    }

    handleGesture(gesture)
    touchStart.value = null
  }

  // Determine swipe direction
  const getSwipeDirection = (deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' => {
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  // Handle gesture
  const handleGesture = (gesture: TouchGesture): void => {
    if (gesture.type === 'swipe' && gesture.direction) {
      // Check for registered swipe actions
      const action = swipeActions.value.find(a => 
        a.direction === gesture.direction && 
        gesture.distance >= a.threshold
      )
      
      if (action) {
        triggerHapticFeedback('light')
        action.callback(gesture)
      }
    }
  }

  // Register swipe action
  const registerSwipeAction = (action: SwipeAction): void => {
    swipeActions.value.push(action)
  }

  // Unregister swipe action
  const unregisterSwipeAction = (direction: 'left' | 'right'): void => {
    swipeActions.value = swipeActions.value.filter(a => a.direction !== direction)
  }

  // Clear all swipe actions
  const clearSwipeActions = (): void => {
    swipeActions.value = []
  }

  // Trigger haptic feedback
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
    if (!hapticFeedback.value || !navigator.vibrate) {
      return
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }

    navigator.vibrate(patterns[type])
  }

  // Enable/disable haptic feedback
  const setHapticFeedback = (enabled: boolean): void => {
    hapticFeedback.value = enabled
  }

  // Add touch event listeners to element
  const addTouchListeners = (element: HTMLElement): void => {
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Remove touch event listeners from element
  const removeTouchListeners = (element: HTMLElement): void => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  }

  // Optimize scrolling performance
  const optimizeScrolling = (element: HTMLElement): void => {
    element.style.webkitOverflowScrolling = 'touch'
    element.style.overflowScrolling = 'touch'
  }

  // Prevent zoom on double tap
  const preventZoom = (element: HTMLElement): void => {
    element.style.touchAction = 'manipulation'
  }

  // Enable smooth scrolling
  const enableSmoothScrolling = (element: HTMLElement): void => {
    element.style.scrollBehavior = 'smooth'
  }

  // Get optimal touch target size
  const getOptimalTouchTargetSize = (): { width: number; height: number } => {
    // Apple recommends 44px minimum, Google recommends 48dp
    return {
      width: 48,
      height: 48
    }
  }

  // Check if element meets touch target guidelines
  const validateTouchTarget = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    const optimal = getOptimalTouchTargetSize()
    
    return rect.width >= optimal.width && rect.height >= optimal.height
  }

  // Add touch-friendly styles to element
  const makeTouchFriendly = (element: HTMLElement): void => {
    const optimal = getOptimalTouchTargetSize()
    
    // Ensure minimum touch target size
    if (!validateTouchTarget(element)) {
      element.style.minWidth = `${optimal.width}px`
      element.style.minHeight = `${optimal.height}px`
    }

    // Add touch optimizations
    element.style.touchAction = 'manipulation'
    element.style.userSelect = 'none'
    element.style.webkitUserSelect = 'none'
    element.style.webkitTapHighlightColor = 'transparent'
  }

  // Debounce function for touch events
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle function for touch events
  const throttle = <T extends (...args: any[]) => void>(
    func: T,
    limit: number
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

  // Initialize touch optimizations
  const initialize = (): void => {
    detectTouchDevice()
    
    // Add global touch optimizations
    if (isTouchDevice.value) {
      document.body.style.webkitTapHighlightColor = 'transparent'
      document.body.style.webkitTouchCallout = 'none'
      document.body.style.webkitUserSelect = 'none'
    }
  }

  // Cleanup
  const cleanup = (): void => {
    if (longPressTimeout.value) {
      clearTimeout(longPressTimeout.value)
      longPressTimeout.value = null
    }
    clearSwipeActions()
  }

  // Computed properties
  const isMobile = computed(() => {
    return isTouchDevice.value && window.innerWidth <= 768
  })

  const isTablet = computed(() => {
    return isTouchDevice.value && window.innerWidth > 768 && window.innerWidth <= 1024
  })

  const touchTargetSize = computed(() => getOptimalTouchTargetSize())

  // Lifecycle
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isTouchDevice: readonly(isTouchDevice),
    isLongPress: readonly(isLongPress),
    hapticFeedback: readonly(hapticFeedback),
    isMobile,
    isTablet,
    touchTargetSize,
    detectTouchDevice,
    registerSwipeAction,
    unregisterSwipeAction,
    clearSwipeActions,
    triggerHapticFeedback,
    setHapticFeedback,
    addTouchListeners,
    removeTouchListeners,
    optimizeScrolling,
    preventZoom,
    enableSmoothScrolling,
    validateTouchTarget,
    makeTouchFriendly,
    debounce,
    throttle,
    initialize,
    cleanup
  }
}