/**
 * Device detection utilities
 */

/**
 * Detect if device is mobile based on screen size and touch capability
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || "ontouchstart" in window;
}

/**
 * Calculate responsive column count based on screen width
 * 1200px+ = 5 columns, 1035px+ = 4 columns, 835px+ = 3 columns, ≤834px = 2 columns
 */
export function calculateColumnCount(width: number): number {
  if (width <= 834) return 2;
  if (width >= 835 && width < 1035) return 3;
  if (width >= 1035 && width < 1200) return 4;
  return 5; // 1200px and above
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Hook-like function to get window dimensions
 */
export function getWindowDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}