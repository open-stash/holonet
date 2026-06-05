import { defaultInterceptorConfig, InterceptorConfig } from './interceptor-config';

let currentConfig: InterceptorConfig = { ...defaultInterceptorConfig };

/**
 * Get the current interceptor configuration
 */
export const getInterceptorConfig = (): InterceptorConfig => {
  return { ...currentConfig };
};

/**
 * Update the interceptor configuration at runtime
 */
export const updateInterceptorConfig = (newConfig: Partial<InterceptorConfig>): void => {
  currentConfig = { ...currentConfig, ...newConfig };
};

/**
 * Reset the interceptor configuration to defaults
 */
export const resetInterceptorConfig = (): void => {
  currentConfig = { ...defaultInterceptorConfig };
};

/**
 * Get the current configuration (used internally by interceptor)
 */
export const getCurrentConfig = (): InterceptorConfig => currentConfig;