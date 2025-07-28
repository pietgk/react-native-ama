/**
 * AccessibilityInfo polyfill for react-native-web environments
 * 
 * This polyfill extends react-native-web's AccessibilityInfo with additional methods
 * that @react-native-ama/core expects but aren't available in the web implementation.
 * 
 * **Problem**: react-native-web only implements `isScreenReaderEnabled`, `isReduceMotionEnabled`,
 * and basic event handling for `reduceMotionChanged`. However, @react-native-ama/core expects
 * many additional accessibility methods that are available in React Native but not on the web.
 * 
 * **Solution**: This polyfill provides:
 * - All missing accessibility state methods (returns false as default for web)
 * - Proper event listener handling for unsupported accessibility events
 * - Runtime patching of both react-native and react-native-web modules
 * - Graceful fallbacks for web-specific limitations
 * 
 * **Usage**: Import this file in your Storybook preview.tsx or other web setup files
 * before importing components that use @react-native-ama/core.
 * 
 * **Compatibility**: 
 * - @react-native-ama/core: ^1.2.0
 * - react-native-web: Compatible with standard distributions
 * - Storybook: v9.0.15+
 * 
 * @author Mindler Development Team
 * @version 1.0.0
 * @since 2024-01-17
 */

/**
 * Detect if we're in a DOM environment (browser)
 * @type {boolean}
 */
const canUseDOM = typeof window !== 'undefined' && window.document && window.document.createElement;

/**
 * Media query for detecting reduced motion preference
 * @type {MediaQueryList|null}
 */
const prefersReducedMotionMedia = canUseDOM && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

/**
 * Check if screen reader is enabled
 * Uses heuristics to detect likely screen reader usage
 * @returns {Promise<boolean>} Best guess based on available indicators
 */
function isScreenReaderEnabled() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    // Check for common screen reader indicators
    let screenReaderLikely = false;
    
    try {
      // Check if user has navigated using keyboard/assistive tech
      const hasAccessibleNavigation = 
        // Check for focus indicators
        document.activeElement !== document.body ||
        // Check for prefers-reduced-motion (common accessibility setting)
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
        // Check for forced colors (Windows high contrast/screen reader mode)
        (window.matchMedia && window.matchMedia('(forced-colors: active)').matches);
      
      screenReaderLikely = hasAccessibleNavigation;
    } catch (e) {
      // If we can't detect, assume false for better UX
      screenReaderLikely = false;
    }
    
    resolve(screenReaderLikely);
  });
}

/**
 * Check if user prefers reduced motion
 * Uses CSS media query to detect user's motion preference
 * @returns {Promise<boolean>} True if user prefers reduced motion, false otherwise
 */
function isReduceMotionEnabled() {
  return new Promise((resolve) => {
    try {
      if (prefersReducedMotionMedia && typeof prefersReducedMotionMedia.matches === 'boolean') {
        resolve(prefersReducedMotionMedia.matches);
      } else {
        // Fallback: try to create a fresh media query
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          resolve(mediaQuery.matches);
        } else {
          resolve(false);
        }
      }
    } catch (e) {
      console.warn('[AccessibilityInfo] Failed to check reduced motion preference:', e.message);
      resolve(false);
    }
  });
}

/**
 * Add event listener for reduced motion preference changes
 * @param {Function} fn - Callback function to handle preference changes
 */
function addChangeListener(fn) {
  if (prefersReducedMotionMedia != null) {
    try {
      if (prefersReducedMotionMedia.addEventListener != null) {
        prefersReducedMotionMedia.addEventListener('change', fn);
      } else if (prefersReducedMotionMedia.addListener != null) {
        // @ts-ignore - deprecated but still needed for older browsers
        prefersReducedMotionMedia.addListener(fn);
      }
    } catch (e) {
      console.warn('[AccessibilityInfo] Failed to add change listener:', e.message);
    }
  }
}

/**
 * Remove event listener for reduced motion preference changes
 * @param {Function} fn - Callback function to remove
 */
function removeChangeListener(fn) {
  if (prefersReducedMotionMedia != null) {
    try {
      if (prefersReducedMotionMedia.removeEventListener != null) {
        prefersReducedMotionMedia.removeEventListener('change', fn);
      } else if (prefersReducedMotionMedia.removeListener != null) {
        // @ts-ignore - deprecated but still needed for older browsers
        prefersReducedMotionMedia.removeListener(fn);
      }
    } catch (e) {
      console.warn('[AccessibilityInfo] Failed to remove change listener:', e.message);
    }
  }
}

/**
 * Storage for event handler mappings
 * @type {Object.<Function, Function>}
 */
const handlers = {};

/**
 * Extended AccessibilityInfo implementation with comprehensive polyfill support
 * 
 * This object provides all the methods that @react-native-ama/core expects,
 * combining react-native-web's existing functionality with polyfilled methods
 * for accessibility features not available in web environments.
 * 
 * @namespace ExtendedAccessibilityInfo
 */
const ExtendedAccessibilityInfo = {
  // Original react-native-web methods
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  /** @deprecated Use isScreenReaderEnabled instead */
  fetch: isScreenReaderEnabled,

  // Polyfilled methods that AMA expects but aren't in react-native-web
  // All return false as these iOS/Android-specific features don't have web equivalents
  
  /** @returns {Promise<boolean>} Always false - transparency changes not detectable on web */
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - bold text preference not detectable on web */
  isBoldTextEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - grayscale mode not detectable on web */
  isGrayscaleEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - inverted colors not detectable on web */
  isInvertColorsEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - use isReduceMotionEnabled instead */
  isReduceMotionAndAnimationsEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Detects high contrast mode using CSS media queries */
  isHighContrastEnabled: () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          // Check for high contrast mode using media queries
          const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
          resolve(highContrastQuery.matches);
        } catch (e) {
          // Fallback: try to detect Windows high contrast mode
          try {
            const forcedColors = window.matchMedia('(forced-colors: active)');
            resolve(forcedColors.matches);
          } catch (e2) {
            resolve(false);
          }
        }
      } else {
        resolve(false);
      }
    });
  },
  /** @returns {Promise<boolean>} Always false - system color changes not detectable on web */
  isDarkerSystemColorsEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - switch label preference not detectable on web */
  isOnOffSwitchLabelsEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - closed captions not detectable on web */
  isClosedCaptionEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - mono audio not detectable on web */
  isMonoAudioEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - shake to undo not available on web */
  isShakeToUndoEnabled: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - AssistiveTouch is iOS-specific */
  isAssistiveTouchRunning: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - Switch Control is iOS-specific */
  isSwitchControlRunning: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - VoiceOver is iOS-specific */
  isVoiceOverRunning: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - TalkBack is Android-specific */
  isTalkBackRunning: () => Promise.resolve(false),
  /** @returns {Promise<boolean>} Always false - accessibility services concept is mobile-specific */
  isAccessibilityServiceEnabled: () => Promise.resolve(false),
  
  /**
   * Announce message to screen readers with options
   * @param {string} message - Message to announce
   * @param {Object} options - Announcement options (queue and priority supported on web)
   */
  announceForAccessibilityWithOptions: (message, options) => {
    console.log(`[AccessibilityInfo] Announcement with options: ${message}`, options);
    
    // Use the enhanced announcement method, respecting options where possible
    if (options && options.queue === false) {
      // If not queuing, use assertive live region
      if (typeof window !== 'undefined' && window.document) {
        try {
          let liveRegion = window.document.getElementById('accessibility-live-region-assertive');
          if (!liveRegion) {
            liveRegion = window.document.createElement('div');
            liveRegion.id = 'accessibility-live-region-assertive';
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            window.document.body.appendChild(liveRegion);
          }
          
          liveRegion.textContent = '';
          setTimeout(() => {
            liveRegion.textContent = message;
          }, 10);
        } catch (e) {
          console.log('[AccessibilityInfo] Assertive ARIA live region failed:', e.message);
        }
      }
    } else {
      // Use the regular announcement method
      ExtendedAccessibilityInfo.announceForAccessibility(message);
    }
  },
  
  /**
   * Get recommended timeout for accessibility
   * @param {number} originalTimeout - Original timeout in milliseconds
   * @returns {Promise<number>} The same timeout (no adjustment needed on web)
   */
  getRecommendedTimeoutMillis: (originalTimeout) => Promise.resolve(originalTimeout),
  
  /**
   * Send accessibility event (no-op on web)
   * @param {number} reactTag - React component tag
   * @param {string} eventType - Type of accessibility event
   */
  sendAccessibilityEvent: (reactTag, eventType) => {
    console.log(`[AccessibilityInfo] sendAccessibilityEvent: ${reactTag}, ${eventType}`);
  },
  
  /**
   * Set accessibility focus to a component (no-op on web)
   * @param {number} reactTag - React component tag
   */
  setAccessibilityFocus: (reactTag) => {
    console.log(`[AccessibilityInfo] setAccessibilityFocus: ${reactTag}`);
  },
  
  /**
   * Announce message to screen readers
   * Uses multiple methods to ensure screen reader compatibility
   * @param {string} message - Message to announce
   */
  announceForAccessibility: (message) => {
    console.log(`[AccessibilityInfo] Announcement: ${message}`);
    
    // Try to use speech synthesis for actual announcements
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create and speak the message
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.volume = 0.1; // Low volume to avoid disturbing users
        utterance.rate = 1.5; // Slightly faster
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log('[AccessibilityInfo] Speech synthesis failed:', e.message);
      }
    }
    
    // Also try to create an ARIA live region for screen readers
    if (typeof window !== 'undefined' && window.document) {
      try {
        let liveRegion = window.document.getElementById('accessibility-live-region');
        if (!liveRegion) {
          liveRegion = window.document.createElement('div');
          liveRegion.id = 'accessibility-live-region';
          liveRegion.setAttribute('aria-live', 'polite');
          liveRegion.setAttribute('aria-atomic', 'true');
          liveRegion.style.position = 'absolute';
          liveRegion.style.left = '-10000px';
          liveRegion.style.width = '1px';
          liveRegion.style.height = '1px';
          liveRegion.style.overflow = 'hidden';
          window.document.body.appendChild(liveRegion);
        }
        
        // Clear and set the message
        liveRegion.textContent = '';
        setTimeout(() => {
          liveRegion.textContent = message;
        }, 10);
      } catch (e) {
        console.log('[AccessibilityInfo] ARIA live region failed:', e.message);
      }
    }
  },
  
  /**
   * Add event listener for accessibility changes
   * 
   * Supports 'reduceMotionChanged' with actual implementation, other events are mocked
   * 
   * @param {string} eventName - Name of the accessibility event
   * @param {Function} handler - Callback function to handle the event
   * @returns {Object} Subscription object with remove method
   */
  addEventListener: (eventName, handler) => {
    // Handle reduceMotionChanged which is supported by react-native-web
    if (eventName === 'reduceMotionChanged') {
      if (!prefersReducedMotionMedia) {
        return { remove: () => {} };
      }
      const listener = (event) => {
        handler(event.matches);
      };
      addChangeListener(listener);
      handlers[handler] = listener;
      return {
        remove: () => ExtendedAccessibilityInfo.removeEventListener(eventName, handler)
      };
    }

    // Events that AMA expects but react-native-web doesn't handle
    const mockEvents = [
      'reduceTransparencyChanged',
      'boldTextChanged', 
      'grayscaleChanged',
      'invertColorsChanged',
      'screenReaderChanged'
    ];
    
    if (mockEvents.includes(eventName)) {
      // console.log(`[AccessibilityInfo] addEventListener: ${eventName} (no-op)`);
      // Return a subscription object with remove method
      return {
        remove: () => {
          // console.log(`[AccessibilityInfo] removeEventListener: ${eventName}`);
        }
      };
    }
    
    // Unknown event, return empty subscription
    console.log(`[AccessibilityInfo] addEventListener: ${eventName} (unknown event)`);
    return { remove: () => {} };
  },
  
  /**
   * Remove event listener for accessibility changes
   * 
   * @param {string} eventName - Name of the accessibility event
   * @param {Function} handler - Callback function to remove
   */
  removeEventListener: (eventName, handler) => {
    // Handle reduceMotionChanged which is supported by react-native-web
    if (eventName === 'reduceMotionChanged') {
      const listener = handlers[handler];
      if (!listener || !prefersReducedMotionMedia) {
        return;
      }
      removeChangeListener(listener);
      delete handlers[handler];
      return;
    }

    // Mock events - just log
    const mockEvents = [
      'reduceTransparencyChanged',
      'boldTextChanged', 
      'grayscaleChanged',
      'invertColorsChanged',
      'screenReaderChanged'
    ];
    
    if (mockEvents.includes(eventName)) {
      console.log(`[AccessibilityInfo] removeEventListener: ${eventName} (no-op)`);
      return;
    }
    
    // Unknown event
    console.log(`[AccessibilityInfo] removeEventListener: ${eventName} (unknown event)`);
  },
};

/**
 * Runtime patching of AccessibilityInfo in both react-native and react-native-web modules
 * 
 * This approach ensures that any code importing AccessibilityInfo from either module
 * will get the extended version with all AMA-required methods.
 * 
 * Note: This is a runtime monkey-patch and should be loaded before any components
 * that use @react-native-ama/core are imported.
 */
if (typeof window !== 'undefined') {
  let patchedModules = 0;
  
  // Try to patch the react-native module directly
  try {
    // @ts-ignore - runtime module resolution
    const reactNative = require('react-native');
    if (reactNative && reactNative.AccessibilityInfo) {
      // Validate that the original module has the expected structure
      if (typeof reactNative.AccessibilityInfo === 'object') {
        // Extend the existing AccessibilityInfo with our polyfill
        Object.assign(reactNative.AccessibilityInfo, ExtendedAccessibilityInfo);
        patchedModules++;
        // console.log('[AccessibilityInfo] Successfully patched react-native AccessibilityInfo');
      } else {
        console.warn('[AccessibilityInfo] react-native AccessibilityInfo has unexpected structure');
      }
    } else {
      console.log('[AccessibilityInfo] react-native module not found or AccessibilityInfo not available');
    }
  } catch (e) {
    console.log('[AccessibilityInfo] Could not patch react-native:', e.message);
  }
  
  // Also try to patch react-native-web
  try {
    // @ts-ignore - runtime module resolution
    const reactNativeWeb = require('react-native-web');
    if (reactNativeWeb && reactNativeWeb.AccessibilityInfo) {
      // Validate that the original module has the expected structure
      if (typeof reactNativeWeb.AccessibilityInfo === 'object') {
        Object.assign(reactNativeWeb.AccessibilityInfo, ExtendedAccessibilityInfo);
        patchedModules++;
        // console.log('[AccessibilityInfo] Successfully patched react-native-web AccessibilityInfo');
      } else {
        console.warn('[AccessibilityInfo] react-native-web AccessibilityInfo has unexpected structure');
      }
    } else {
      console.log('[AccessibilityInfo] react-native-web module not found or AccessibilityInfo not available');
    }
  } catch (e) {
    console.log('[AccessibilityInfo] Could not patch react-native-web:', e.message);
  }
  
  // Report patching success
  if (patchedModules === 0) {
    console.warn('[AccessibilityInfo] No modules were successfully patched. AMA may not work properly.');
    console.warn('[AccessibilityInfo] Ensure this polyfill is loaded before any AMA components.');
  } else {
    // console.log(`[AccessibilityInfo] Successfully patched ${patchedModules} module(s)`);
  }
}

export default ExtendedAccessibilityInfo;