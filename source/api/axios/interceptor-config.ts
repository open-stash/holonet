/**
 * Configuration for axios interceptor notifications
 */
export interface InterceptorConfig {
    /** Whether to show notifications for successful responses */
    showSuccessNotifications: boolean;
    /** Whether to show notifications for info responses */
    showInfoNotifications: boolean;
    /** Whether to show notifications for warning responses */
    showWarningNotifications: boolean;
    /** Whether to show notifications for error responses */
    showErrorNotifications: boolean;
    /** Whether to show fallback error toasts for network errors */
    showFallbackErrors: boolean;
    /** Custom duration for notifications (in milliseconds) */
    duration?: number;
    /** Custom position for notifications */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  }
  
  export const defaultInterceptorConfig: InterceptorConfig = {
    showSuccessNotifications: true,
    showInfoNotifications: true,
    showWarningNotifications: true,
    showErrorNotifications: true,
    showFallbackErrors: true,
    duration: 4000,
    position: 'bottom-right',
  };
  
  /**
   * URLs that should be excluded from showing notifications
   * Add API endpoints that shouldn't trigger toasts (e.g., polling endpoints)
   */
  export const excludedNotificationUrls: string[] = [
    // Example: '/api/v1/health-check',
    // Example: '/api/v1/polling/*',
  ];

  /**
   * Exact path segments (no leading slash, no query) where 401 must not trigger global logout.
   * List endpoints only — not `/api/v1/customers/:id` or nested routes — so real auth failures still log out.
   * Axios `config.url` is usually relative to baseURL (e.g. `/api/v1/customers?...`).
   */
  export const urlsExcludedFrom401Logout: readonly string[] = [
    "api/v1/auth/me",
  ];

  function normalizeAxiosPath(url: string): string {
    const pathOnly = url.split("?")[0].split("#")[0];
    return pathOnly.replace(/^\/+/, "").replace(/\/+$/, "") || "";
  }

  export function shouldSkipGlobalLogoutOn401(
    requestUrl: string | undefined
  ): boolean {
    if (!requestUrl) return false;
    const normalized = normalizeAxiosPath(requestUrl);
    return urlsExcludedFrom401Logout.some((p) => normalized === p);
  }
  
  /**
   * Check if a URL should be excluded from notifications
   */
  export const shouldExcludeNotification = (url: string): boolean => {
    return excludedNotificationUrls.some(excludedUrl => {
      if (excludedUrl.endsWith('*')) {
        const baseUrl = excludedUrl.slice(0, -1);
        return url.startsWith(baseUrl);
      }
      return url === excludedUrl;
    });
  };