/**
 * Performance monitoring utilities
 */
import { lazy } from 'react'

// Measure component render time
export const measurePerformance = (componentName) => {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.performance) {
    return {
      start: () => {
        performance.mark(`${componentName}-start`);
      },
      end: () => {
        performance.mark(`${componentName}-end`);
        try {
          performance.measure(
            componentName,
            `${componentName}-start`,
            `${componentName}-end`
          );
          const measure = performance.getEntriesByName(componentName)[0];
          if (measure && measure.duration > 100) {
            console.warn(`Slow render detected: ${componentName} took ${measure.duration.toFixed(2)}ms`);
          }
        } catch (e) {
          // Ignore measurement errors
        }
      },
    };
  }
  return { start: () => {}, end: () => {} };
};

// Lazy load components with error boundary
export const lazyLoad = (importFunc) => {
  return lazy(() => importFunc().catch((error) => {
    console.error('Failed to load component:', error);
    // Return a fallback component
    return {
      default: () => <div>Failed to load component. Please refresh the page.</div>
    };
  }));
};
