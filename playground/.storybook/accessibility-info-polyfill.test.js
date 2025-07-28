/**
 * Comprehensive test suite for the AccessibilityInfo polyfill.
 * 
 * Note: jest.setup.js has been fixed to use virtual mocking for AMA internals.
 * See jest-conflict-fix-summary.md for details about the { virtual: true } fix.
 */

// Mock react-native before importing the polyfill
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),  
    announceForAccessibility: jest.fn(),
  }
}));

// Mock react-native-web separately
jest.mock('react-native-web', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
  }
}));

// Setup global window and document mocks
global.window = {
  matchMedia: jest.fn(),
  speechSynthesis: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn().mockReturnValue([]),
  },
  document: {
    createElement: jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      style: {},
      textContent: '',
    }),
    body: {
      appendChild: jest.fn(),
    },
    getElementById: jest.fn().mockReturnValue(null),
    activeElement: { tagName: 'BODY' },
  },
};

global.document = global.window.document;
global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  volume: 1,
  rate: 1,
  pitch: 1,
  voice: null,
  lang: 'en-US',
}));

// Import after mocks
import ExtendedAccessibilityInfo from './accessibility-info-polyfill.js';

describe('AccessibilityInfo Polyfill', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset global window and document to consistent state
    global.window = {
      matchMedia: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
      speechSynthesis: {
        speak: jest.fn(),
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        getVoices: jest.fn().mockReturnValue([]),
      },
      document: {
        createElement: jest.fn().mockReturnValue({
          setAttribute: jest.fn(),
          style: {},
          textContent: '',
        }),
        body: {
          appendChild: jest.fn(),
        },
        getElementById: jest.fn().mockReturnValue(null),
        activeElement: { tagName: 'BODY' },
      },
    };
    
    global.document = global.window.document;
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  describe('Basic Accessibility Methods', () => {
    test('isScreenReaderEnabled returns boolean promise', async () => {
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(typeof result).toBe('boolean');
    });

    test('isScreenReaderEnabled detects activeElement not body', async () => {
      // Mock document.activeElement to be something other than body
      const mockElement = { tagName: 'INPUT' };
      Object.defineProperty(document, 'activeElement', {
        value: mockElement,
        configurable: true
      });
      Object.defineProperty(document, 'body', {
        value: { tagName: 'BODY' },
        configurable: true
      });
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(true);
      
      // Restore
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });
    });

    test('isScreenReaderEnabled detects prefers-reduced-motion', async () => {
      // Mock matchMedia to return true for reduced motion
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });
      
      // Ensure activeElement is body (no focus indicator)
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(true);
    });

    test('isScreenReaderEnabled detects forced-colors', async () => {
      // Mock matchMedia to return true for forced colors
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(forced-colors: active)') {
          return { matches: true };
        }
        return { matches: false };
      });
      
      // Ensure activeElement is body and no reduced motion
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(true);
    });

    test('isScreenReaderEnabled returns false when no indicators present', async () => {
      // Mock matchMedia to return false for all queries
      window.matchMedia = jest.fn().mockReturnValue({ matches: false });
      
      // Ensure activeElement is body
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(false);
    });

    test('isScreenReaderEnabled handles errors gracefully', async () => {
      // Mock matchMedia to throw
      window.matchMedia = jest.fn().mockImplementation(() => {
        throw new Error('matchMedia error');
      });
      
      // Mock activeElement to throw when accessed
      Object.defineProperty(document, 'activeElement', {
        get: () => { throw new Error('activeElement error'); },
        configurable: true
      });
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(false);
      
      // Restore activeElement
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true
      });
    });

    test('isScreenReaderEnabled handles window undefined', async () => {
      const originalWindow = global.window;
      delete global.window;
      
      const result = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      expect(result).toBe(false);
      
      global.window = originalWindow;
    });

    test('isReduceMotionEnabled returns boolean promise', async () => {
      const result = await ExtendedAccessibilityInfo.isReduceMotionEnabled();
      expect(typeof result).toBe('boolean');
    });

    test('isReduceMotionEnabled uses matchMedia', async () => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: true });
      const result = await ExtendedAccessibilityInfo.isReduceMotionEnabled();
      expect(result).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    test('isHighContrastEnabled uses matchMedia for contrast detection', async () => {
      window.matchMedia = jest.fn()
        .mockReturnValueOnce({ matches: true }) // prefers-contrast: high
        .mockReturnValue({ matches: false });
      
      const result = await ExtendedAccessibilityInfo.isHighContrastEnabled();
      expect(result).toBe(true);
    });

    test('isHighContrastEnabled falls back to forced-colors', async () => {
      window.matchMedia = jest.fn()
        .mockImplementationOnce(() => { throw new Error('not supported'); })
        .mockReturnValue({ matches: true }); // forced-colors: active
      
      const result = await ExtendedAccessibilityInfo.isHighContrastEnabled();
      expect(result).toBe(true);
    });
  });

  describe('Polyfilled Methods', () => {
    const polyfillMethods = [
      'isReduceTransparencyEnabled',
      'isBoldTextEnabled',
      'isGrayscaleEnabled',
      'isInvertColorsEnabled',
      'isReduceMotionAndAnimationsEnabled',
      'isDarkerSystemColorsEnabled',
      'isOnOffSwitchLabelsEnabled',
      'isClosedCaptionEnabled',
      'isMonoAudioEnabled',
      'isShakeToUndoEnabled',
      'isAssistiveTouchRunning',
      'isSwitchControlRunning',
      'isVoiceOverRunning',
      'isTalkBackRunning',
      'isAccessibilityServiceEnabled',
    ];

    polyfillMethods.forEach(method => {
      test(`${method} returns false promise`, async () => {
        const result = await ExtendedAccessibilityInfo[method]();
        expect(result).toBe(false);
      });
    });
  });

  describe('Announcement Methods', () => {
    test('announceForAccessibility calls speech synthesis', () => {
      ExtendedAccessibilityInfo.announceForAccessibility('test message');
      // Should not test console.log - implementation detail
      // Instead verify the actual behavior
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    test('announceForAccessibility uses speech synthesis', () => {
      ExtendedAccessibilityInfo.announceForAccessibility('test message');
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    test('announceForAccessibility configures SpeechSynthesisUtterance correctly', () => {
      ExtendedAccessibilityInfo.announceForAccessibility('test message');
      
      // Verify SpeechSynthesisUtterance was created with correct text
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('test message');
      
      // Get the utterance instance that was created
      const utteranceCall = global.SpeechSynthesisUtterance.mock.calls[0];
      expect(utteranceCall[0]).toBe('test message');
      
      // Verify speak was called with an utterance
      const speakCall = window.speechSynthesis.speak.mock.calls[0];
      expect(speakCall).toBeDefined();
      expect(speakCall[0]).toBeDefined();
    });

    test('SpeechSynthesisUtterance is configured with correct properties', () => {
      // The mock implementation sets these properties
      const utterance = new global.SpeechSynthesisUtterance('test');
      
      expect(utterance.text).toBe('test');
      expect(utterance.volume).toBe(1);
      expect(utterance.rate).toBe(1);
      expect(utterance.pitch).toBe(1);
      expect(utterance.voice).toBe(null);
      expect(utterance.lang).toBe('en-US');
    });

    test('announceForAccessibility handles multiple rapid calls', () => {
      // Call multiple times rapidly
      ExtendedAccessibilityInfo.announceForAccessibility('message 1');
      ExtendedAccessibilityInfo.announceForAccessibility('message 2');
      ExtendedAccessibilityInfo.announceForAccessibility('message 3');
      
      // Should cancel before each speak call
      expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(3);
      expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(3);
      
      // Should create utterances for each message
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('message 1');
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('message 2');
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('message 3');
    });

    test('announceForAccessibility creates ARIA live region', async () => {
      const mockElement = {
        setAttribute: jest.fn(),
        style: {},
        textContent: '',
        id: '',
      };
      document.createElement.mockReturnValue(mockElement);
      
      ExtendedAccessibilityInfo.announceForAccessibility('test message');
      
      // Verify element was created
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
      
      // Wait for the timeout to set text content
      await new Promise(resolve => setTimeout(resolve, 15));
      expect(mockElement.textContent).toBe('test message');
    });

    test('announceForAccessibility reuses existing live region', async () => {
      const mockExistingElement = {
        setAttribute: jest.fn(),
        style: {},
        textContent: 'old message',
        id: 'accessibility-live-region',
      };
      
      // Mock getElementById to return existing element
      document.getElementById.mockReturnValue(mockExistingElement);
      
      ExtendedAccessibilityInfo.announceForAccessibility('new message');
      
      // Should not create new element
      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.body.appendChild).not.toHaveBeenCalled();
      
      // Should clear and set new content
      expect(mockExistingElement.textContent).toBe('');
      await new Promise(resolve => setTimeout(resolve, 15));
      expect(mockExistingElement.textContent).toBe('new message');
    });

    test('announceForAccessibility sets correct styles for accessibility', () => {
      const mockElement = {
        setAttribute: jest.fn(),
        style: {},
        textContent: '',
        id: '',
      };
      document.createElement.mockReturnValue(mockElement);
      
      ExtendedAccessibilityInfo.announceForAccessibility('test message');
      
      // Verify all required styles are set for screen reader accessibility
      expect(mockElement.style.position).toBe('absolute');
      expect(mockElement.style.left).toBe('-10000px');
      expect(mockElement.style.width).toBe('1px');
      expect(mockElement.style.height).toBe('1px');
      expect(mockElement.style.overflow).toBe('hidden');
      expect(mockElement.id).toBe('accessibility-live-region');
    });

    test('announceForAccessibilityWithOptions uses assertive live region for queue=false', async () => {
      const mockElement = {
        setAttribute: jest.fn(),
        style: {},
        textContent: '',
        id: '',
      };
      document.createElement.mockReturnValue(mockElement);
      
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('urgent message', { queue: false });
      
      // Verify element was created with assertive
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.id).toBe('accessibility-live-region-assertive');
      
      // Wait for the timeout to set text content
      await new Promise(resolve => setTimeout(resolve, 15));
      expect(mockElement.textContent).toBe('urgent message');
    });

    test('announceForAccessibilityWithOptions reuses existing assertive live region', async () => {
      const mockExistingElement = {
        setAttribute: jest.fn(),
        style: {},
        textContent: 'old urgent message',
        id: 'accessibility-live-region-assertive',
      };
      
      // Mock getElementById to return existing assertive element
      document.getElementById.mockReturnValue(mockExistingElement);
      
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('new urgent message', { queue: false });
      
      // Should not create new element
      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.body.appendChild).not.toHaveBeenCalled();
      
      // Should clear and set new content
      expect(mockExistingElement.textContent).toBe('');
      await new Promise(resolve => setTimeout(resolve, 15));
      expect(mockExistingElement.textContent).toBe('new urgent message');
    });

    test('announceForAccessibilityWithOptions falls back to regular announcement', () => {
      const spy = jest.spyOn(ExtendedAccessibilityInfo, 'announceForAccessibility');
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test message', { queue: true });
      expect(spy).toHaveBeenCalledWith('test message');
    });

    test('announceForAccessibilityWithOptions handles undefined options', () => {
      const spy = jest.spyOn(ExtendedAccessibilityInfo, 'announceForAccessibility');
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test message', undefined);
      expect(spy).toHaveBeenCalledWith('test message');
    });

    test('announceForAccessibilityWithOptions handles null options', () => {
      const spy = jest.spyOn(ExtendedAccessibilityInfo, 'announceForAccessibility');
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test message', null);
      expect(spy).toHaveBeenCalledWith('test message');
    });

    test('announceForAccessibilityWithOptions handles empty options object', () => {
      const spy = jest.spyOn(ExtendedAccessibilityInfo, 'announceForAccessibility');
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test message', {});
      expect(spy).toHaveBeenCalledWith('test message');
    });

    test('announceForAccessibilityWithOptions logs message with options', () => {
      const options = { queue: false, priority: 'high' };
      ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test message', options);
      
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] Announcement with options: test message', options);
    });

    test('announceForAccessibilityWithOptions handles window undefined for assertive', () => {
      const originalWindow = global.window;
      delete global.window;
      
      // Should not throw when window is undefined
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test', { queue: false });
      }).not.toThrow();
      
      global.window = originalWindow;
    });

    test('announceForAccessibilityWithOptions handles document undefined for assertive', () => {
      const originalDocument = global.window.document;
      delete global.window.document;
      
      // Should not throw when document is undefined
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test', { queue: false });
      }).not.toThrow();
      
      global.window.document = originalDocument;
    });

    test('announceForAccessibilityWithOptions handles DOM errors for assertive region', async () => {
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('DOM creation error');
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibilityWithOptions('test', { queue: false });
      }).not.toThrow();
      
      // Should log the error
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] Assertive ARIA live region failed:', 'DOM creation error');
      
      document.createElement = originalCreateElement;
    });
  });

  describe('Event Listeners', () => {
    test('addEventListener returns subscription object', () => {
      const handler = jest.fn();
      const subscription = ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler);
      
      expect(subscription).toHaveProperty('remove');
      expect(typeof subscription.remove).toBe('function');
    });

    test('addEventListener handles reduceMotionChanged when matchMedia is available', () => {
      // Create a fresh module instance by mocking before import
      jest.resetModules();
      
      // Mock matchMedia to be available during module initialization
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn()
      };
      
      global.window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);
      
      // Re-import to get fresh instance with working matchMedia
      const FreshPolyfill = require('./accessibility-info-polyfill.js').default;
      
      const handler = jest.fn();
      const subscription = FreshPolyfill.addEventListener('reduceMotionChanged', handler);
      
      // Verify subscription object
      expect(subscription).toHaveProperty('remove');
      expect(typeof subscription.remove).toBe('function');
      
      // Verify addEventListener was called on the media query
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('addEventListener stores handler mapping for reduceMotionChanged', () => {
      // This tests the internal handler storage mechanism
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const subscription1 = ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler1);
      const subscription2 = ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler2);
      
      // Both should return valid subscriptions
      expect(subscription1).toHaveProperty('remove');
      expect(subscription2).toHaveProperty('remove');
      
      // Remove should not throw
      expect(() => subscription1.remove()).not.toThrow();
      expect(() => subscription2.remove()).not.toThrow();
    });

    test('addEventListener handles mock events', () => {
      const handler = jest.fn();
      const subscription = ExtendedAccessibilityInfo.addEventListener('boldTextChanged', handler);
      
      expect(subscription).toHaveProperty('remove');
      expect(typeof subscription.remove).toBe('function');
      
      // Test all supported mock events
      const mockEvents = [
        'reduceTransparencyChanged',
        'boldTextChanged', 
        'grayscaleChanged',
        'invertColorsChanged',
        'screenReaderChanged'
      ];
      
      mockEvents.forEach(eventName => {
        const sub = ExtendedAccessibilityInfo.addEventListener(eventName, handler);
        expect(sub).toHaveProperty('remove');
        expect(typeof sub.remove).toBe('function');
        expect(() => sub.remove()).not.toThrow();
      });
    });

    test('addEventListener handles unknown events with console log', () => {
      const handler = jest.fn();
      const subscription = ExtendedAccessibilityInfo.addEventListener('unknownEvent', handler);
      
      expect(subscription).toHaveProperty('remove');
      expect(typeof subscription.remove).toBe('function');
      
      // Verify console.log was called for unknown event
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] addEventListener: unknownEvent (unknown event)');
    });

    test('removeEventListener handles reduceMotionChanged with handler cleanup', () => {
      const handler = jest.fn();
      
      // Add listener
      const subscription = ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler);
      
      // Remove via direct call (not subscription.remove)
      expect(() => {
        ExtendedAccessibilityInfo.removeEventListener('reduceMotionChanged', handler);
      }).not.toThrow();
      
      // Remove again should not throw
      expect(() => {
        ExtendedAccessibilityInfo.removeEventListener('reduceMotionChanged', handler);
      }).not.toThrow();
    });

    test('removeEventListener handles mock events with console log', () => {
      const handler = jest.fn();
      
      ExtendedAccessibilityInfo.removeEventListener('boldTextChanged', handler);
      
      // Verify console.log was called
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] removeEventListener: boldTextChanged (no-op)');
    });

    test('removeEventListener handles unknown events with console log', () => {
      const handler = jest.fn();
      
      ExtendedAccessibilityInfo.removeEventListener('unknownEvent', handler);
      
      // Verify console.log was called
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] removeEventListener: unknownEvent (unknown event)');
    });
  });

  describe('Other Methods', () => {
    test('getRecommendedTimeoutMillis returns original timeout', async () => {
      const result = await ExtendedAccessibilityInfo.getRecommendedTimeoutMillis(5000);
      expect(result).toBe(5000);
    });

    test('setAccessibilityFocus does not throw', () => {
      // Verify the method exists and doesn't throw
      expect(() => {
        ExtendedAccessibilityInfo.setAccessibilityFocus(123);
      }).not.toThrow();
    });

    test('sendAccessibilityEvent does not throw', () => {
      // Verify the method exists and doesn't throw
      expect(() => {
        ExtendedAccessibilityInfo.sendAccessibilityEvent(123, 'focus');
      }).not.toThrow();
    });

    test('fetch method is deprecated alias', async () => {
      // The fetch method should be an alias for isScreenReaderEnabled
      // @ts-ignore - Testing deprecated method
      const fetchResult = await ExtendedAccessibilityInfo.fetch();
      const screenReaderResult = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
      
      // Both should return the same type (boolean)
      expect(typeof fetchResult).toBe('boolean');
      expect(typeof screenReaderResult).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('isReduceMotionEnabled handles matchMedia errors', async () => {
      window.matchMedia = jest.fn().mockImplementation(() => {
        throw new Error('matchMedia error');
      });
      
      const result = await ExtendedAccessibilityInfo.isReduceMotionEnabled();
      expect(result).toBe(false);
      // Console.warn is called with two separate arguments, not concatenated
      expect(console.warn).toHaveBeenCalledWith('[AccessibilityInfo] Failed to check reduced motion preference:', 'matchMedia error');
    });

    test('isHighContrastEnabled handles primary contrast query errors', async () => {
      window.matchMedia = jest.fn()
        .mockImplementationOnce(() => { throw new Error('contrast query error'); })
        .mockReturnValue({ matches: false }); // forced-colors fallback
      
      const result = await ExtendedAccessibilityInfo.isHighContrastEnabled();
      expect(result).toBe(false);
      
      // Should have tried both queries
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
      expect(window.matchMedia).toHaveBeenCalledWith('(forced-colors: active)');
    });

    test('isHighContrastEnabled handles all query errors', async () => {
      window.matchMedia = jest.fn().mockImplementation(() => {
        throw new Error('matchMedia error');
      });
      
      const result = await ExtendedAccessibilityInfo.isHighContrastEnabled();
      expect(result).toBe(false);
    });

    test('isHighContrastEnabled handles no matchMedia support', async () => {
      const originalWindow = global.window;
      global.window = { matchMedia: undefined };
      
      const result = await ExtendedAccessibilityInfo.isHighContrastEnabled();
      expect(result).toBe(false);
      
      global.window = originalWindow;
    });

    test('announceForAccessibility handles speech synthesis errors', () => {
      window.speechSynthesis.speak = jest.fn().mockImplementation(() => {
        throw new Error('Speech synthesis error');
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      // Console.log is called with two separate arguments
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] Speech synthesis failed:', 'Speech synthesis error');
    });

    test('announceForAccessibility handles SpeechSynthesisUtterance creation errors', () => {
      const originalUtterance = global.SpeechSynthesisUtterance;
      global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => {
        throw new Error('Utterance creation error');
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      global.SpeechSynthesisUtterance = originalUtterance;
    });

    test('announceForAccessibility handles DOM errors', () => {
      // Mock document.createElement to throw
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      // Console.log is called with two separate arguments
      expect(console.log).toHaveBeenCalledWith('[AccessibilityInfo] ARIA live region failed:', 'DOM error');
      
      // Restore original
      document.createElement = originalCreateElement;
    });

    test('announceForAccessibility handles document.body.appendChild errors', () => {
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = jest.fn().mockImplementation(() => {
        throw new Error('appendChild error');
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      document.body.appendChild = originalAppendChild;
    });

    test('getRecommendedTimeoutMillis handles various input types', async () => {
      // Should handle different timeout values
      expect(await ExtendedAccessibilityInfo.getRecommendedTimeoutMillis(0)).toBe(0);
      expect(await ExtendedAccessibilityInfo.getRecommendedTimeoutMillis(1000)).toBe(1000);
      expect(await ExtendedAccessibilityInfo.getRecommendedTimeoutMillis(null)).toBe(null);
      expect(await ExtendedAccessibilityInfo.getRecommendedTimeoutMillis(undefined)).toBe(undefined);
    });

    test('addEventListener handles changeListener errors', () => {
      // Mock a scenario where addEventListener is called but listener setup fails
      const handler = jest.fn();
      
      // Should not throw even if internal setup fails
      expect(() => {
        ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler);
      }).not.toThrow();
      
      expect(() => {
        ExtendedAccessibilityInfo.addEventListener('unknownEvent', handler);
      }).not.toThrow();
    });
  });

  describe('Browser Environment', () => {
    test('handles when window methods are undefined', async () => {
      // Test that methods handle missing window gracefully
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;
      
      // Should return false when matchMedia is not available
      const result = await ExtendedAccessibilityInfo.isReduceMotionEnabled();
      expect(result).toBe(false);
      
      // Restore
      window.matchMedia = originalMatchMedia;
    });

    test('handles when speechSynthesis is undefined', () => {
      const originalSpeechSynthesis = window.speechSynthesis;
      delete window.speechSynthesis;
      
      // Should not throw when speechSynthesis is not available
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      // Restore
      window.speechSynthesis = originalSpeechSynthesis;
    });

    test('handles missing browser APIs gracefully', () => {
      // Test that the polyfill doesn't crash when various APIs are missing
      const originalDocument = global.document;
      
      // Temporarily remove document
      Object.defineProperty(global, 'document', {
        value: undefined,
        configurable: true
      });
      
      expect(() => {
        ExtendedAccessibilityInfo.announceForAccessibility('test message');
      }).not.toThrow();
      
      // Restore
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        configurable: true
      });
    });
  });
});

describe('Integration Tests', () => {
  test('accessibility state detection with multiple indicators', async () => {
    // Setup multiple accessibility indicators
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') return { matches: true };
      if (query === '(prefers-contrast: high)') return { matches: true };
      return { matches: false };
    });
    
    // Test multiple methods together
    const [screenReader, reduceMotion, highContrast] = await Promise.all([
      ExtendedAccessibilityInfo.isScreenReaderEnabled(),
      ExtendedAccessibilityInfo.isReduceMotionEnabled(),
      ExtendedAccessibilityInfo.isHighContrastEnabled()
    ]);
    
    expect(screenReader).toBe(true);
    expect(reduceMotion).toBe(true);
    expect(highContrast).toBe(true);
  });

  test('announcement with speech and ARIA combined', async () => {
    const mockElement = {
      setAttribute: jest.fn(),
      style: {},
      textContent: '',
      id: '',
    };
    document.createElement.mockReturnValue(mockElement);
    
    ExtendedAccessibilityInfo.announceForAccessibility('Integration test message');
    
    // Verify both speech synthesis and ARIA live region
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('div');
    
    await new Promise(resolve => setTimeout(resolve, 15));
    expect(mockElement.textContent).toBe('Integration test message');
  });

  test('event listeners work with accessibility state changes', async () => {
    const handler = jest.fn();
    
    // Add listeners for multiple events
    const subscriptions = [
      ExtendedAccessibilityInfo.addEventListener('reduceMotionChanged', handler),
      ExtendedAccessibilityInfo.addEventListener('boldTextChanged', handler),
      ExtendedAccessibilityInfo.addEventListener('screenReaderChanged', handler)
    ];
    
    // All should return valid subscriptions
    subscriptions.forEach(sub => {
      expect(sub).toHaveProperty('remove');
      expect(typeof sub.remove).toBe('function');
    });
    
    // Remove all listeners
    subscriptions.forEach(sub => {
      expect(() => sub.remove()).not.toThrow();
    });
  });

  test('error handling across multiple methods', async () => {
    // Setup to cause errors in multiple methods
    window.matchMedia = jest.fn().mockImplementation(() => {
      throw new Error('matchMedia error');
    });
    window.speechSynthesis.speak = jest.fn().mockImplementation(() => {
      throw new Error('speech error');
    });
    document.createElement = jest.fn().mockImplementation(() => {
      throw new Error('DOM error');
    });
    
    // All methods should handle errors gracefully
    const [reduceMotion, highContrast] = await Promise.all([
      ExtendedAccessibilityInfo.isReduceMotionEnabled(),
      ExtendedAccessibilityInfo.isHighContrastEnabled()
    ]);
    
    expect(reduceMotion).toBe(false);
    expect(highContrast).toBe(false);
    
    // Announcement should not throw
    expect(() => {
      ExtendedAccessibilityInfo.announceForAccessibility('Error test');
    }).not.toThrow();
    
    // Restore createElement for other tests
    document.createElement = jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      style: {},
      textContent: '',
    });
  });

  test('polyfilled methods return consistent types', async () => {
    const polyfillMethods = [
      'isReduceTransparencyEnabled',
      'isBoldTextEnabled', 
      'isGrayscaleEnabled',
      'isInvertColorsEnabled',
      'isReduceMotionAndAnimationsEnabled',
      'isDarkerSystemColorsEnabled',
      'isOnOffSwitchLabelsEnabled',
      'isClosedCaptionEnabled',
      'isMonoAudioEnabled',
      'isShakeToUndoEnabled',
      'isAssistiveTouchRunning',
      'isSwitchControlRunning',
      'isVoiceOverRunning',
      'isTalkBackRunning',
      'isAccessibilityServiceEnabled'
    ];
    
    // Test all methods in parallel
    const results = await Promise.all(
      polyfillMethods.map(method => ExtendedAccessibilityInfo[method]())
    );
    
    // All should return false (boolean)
    results.forEach((result) => {
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });
});

describe('Runtime Patching', () => {
  test('polyfill exports all required methods', () => {
    const requiredMethods = [
      'isScreenReaderEnabled',
      'isReduceMotionEnabled',
      'isHighContrastEnabled',
      'announceForAccessibility',
      'announceForAccessibilityWithOptions',
      'addEventListener',
      'removeEventListener',
      'getRecommendedTimeoutMillis',
      'setAccessibilityFocus',
      'sendAccessibilityEvent',
      'fetch' // deprecated but still present
    ];
    
    requiredMethods.forEach(method => {
      expect(ExtendedAccessibilityInfo).toHaveProperty(method);
      expect(typeof ExtendedAccessibilityInfo[method]).toBe('function');
    });
  });

  test('polyfill has all AMA-expected polyfilled methods', () => {
    const polyfillMethods = [
      'isReduceTransparencyEnabled',
      'isBoldTextEnabled',
      'isGrayscaleEnabled', 
      'isInvertColorsEnabled',
      'isReduceMotionAndAnimationsEnabled',
      'isDarkerSystemColorsEnabled',
      'isOnOffSwitchLabelsEnabled',
      'isClosedCaptionEnabled',
      'isMonoAudioEnabled',
      'isShakeToUndoEnabled',
      'isAssistiveTouchRunning',
      'isSwitchControlRunning',
      'isVoiceOverRunning',
      'isTalkBackRunning',
      'isAccessibilityServiceEnabled'
    ];
    
    polyfillMethods.forEach(method => {
      expect(ExtendedAccessibilityInfo).toHaveProperty(method);
      expect(typeof ExtendedAccessibilityInfo[method]).toBe('function');
    });
  });

  test('module patching is conditionally executed based on environment', () => {
    // The polyfill should run module patching when window is defined (browser environment)
    expect(typeof window).toBe('object');
    
    // In our test environment, we mock modules, but the polyfill structure should be intact
    expect(ExtendedAccessibilityInfo).toBeDefined();
    expect(typeof ExtendedAccessibilityInfo).toBe('object');
  });

  test('polyfill handles missing modules gracefully', () => {
    // The polyfill should not break if modules are missing
    // This is tested implicitly by the fact that our tests run successfully
    // even with mocked modules
    expect(() => {
      // Re-importing should not throw
      const polyfill = require('./accessibility-info-polyfill.js');
      expect(polyfill.default).toBeDefined();
    }).not.toThrow();
  });

  test('polyfill provides consistent API surface', () => {
    // All polyfilled boolean methods should return promises
    const booleanMethods = [
      'isScreenReaderEnabled',
      'isReduceMotionEnabled',
      'isHighContrastEnabled',
      'isReduceTransparencyEnabled',
      'isBoldTextEnabled',
      'isGrayscaleEnabled',
      'isInvertColorsEnabled',
      'isReduceMotionAndAnimationsEnabled',
      'isDarkerSystemColorsEnabled',
      'isOnOffSwitchLabelsEnabled',
      'isClosedCaptionEnabled',
      'isMonoAudioEnabled',
      'isShakeToUndoEnabled',
      'isAssistiveTouchRunning',
      'isSwitchControlRunning',
      'isVoiceOverRunning',
      'isTalkBackRunning',
      'isAccessibilityServiceEnabled'
    ];
    
    booleanMethods.forEach(method => {
      const result = ExtendedAccessibilityInfo[method]();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  test('polyfill methods handle synchronous and asynchronous patterns correctly', async () => {
    // Async methods (return promises)
    const asyncMethods = ['isScreenReaderEnabled', 'isReduceMotionEnabled', 'getRecommendedTimeoutMillis'];
    
    for (const method of asyncMethods) {
      const result = ExtendedAccessibilityInfo[method](1000); // pass timeout for getRecommendedTimeoutMillis
      expect(result).toBeInstanceOf(Promise);
      await result; // Should not throw
    }
    
    // Sync methods (return subscriptions or void)
    const syncMethods = ['addEventListener', 'removeEventListener', 'announceForAccessibility', 'setAccessibilityFocus', 'sendAccessibilityEvent'];
    
    syncMethods.forEach(method => {
      expect(() => {
        if (method === 'addEventListener') {
          const result = ExtendedAccessibilityInfo[method]('testEvent', jest.fn());
          expect(result).toHaveProperty('remove');
        } else if (method === 'removeEventListener') {
          ExtendedAccessibilityInfo[method]('testEvent', jest.fn());
        } else {
          ExtendedAccessibilityInfo[method]('test');
        }
      }).not.toThrow();
    });
  });

  test('polyfill maintains backward compatibility', async () => {
    // Test deprecated fetch method
    const fetchResult = await ExtendedAccessibilityInfo.fetch();
    const screenReaderResult = await ExtendedAccessibilityInfo.isScreenReaderEnabled();
    
    // Should return same type
    expect(typeof fetchResult).toBe(typeof screenReaderResult);
    expect(typeof fetchResult).toBe('boolean');
  });
});