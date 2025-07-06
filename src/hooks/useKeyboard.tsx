
import { useState, useEffect } from 'react';

export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Detect if keyboard is visible by checking if viewport height decreased significantly
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.screen.height;
      const heightDifference = windowHeight - viewportHeight;
      
      // If height difference is more than 150px, assume keyboard is visible
      setIsKeyboardVisible(heightDifference > 150);
    };

    const handleFocusIn = () => {
      // Small delay to allow for keyboard animation
      setTimeout(() => {
        setIsKeyboardVisible(true);
      }, 300);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setIsKeyboardVisible(false);
      }, 300);
    };

    // Listen for visual viewport changes (more reliable for keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Fallback focus detection
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isKeyboardVisible };
};
