import axios, { AxiosInstance, AxiosResponse } from "axios";
import { toast } from "sonner";
import { BaseResponse } from "@/source/types/apis/common/http";
import {
  shouldExcludeNotification,
  shouldSkipGlobalLogoutOn401,
} from "./interceptor-config";
import { getCurrentConfig } from "./config-manager";
import useAuthStore from "@/source/stores/auth/useAuthStore";
import { supabase } from "@/source/lib/supabase-browser";
import {
  authLog,
  authLogError,
  interceptorLog,
  maskToken,
} from "@/source/lib/auth-debug";

// Always use proxy for all requests in both dev and production
// This ensures cookies work correctly across all environments
const getBaseURL = () => {
  return "/api/proxy";
};

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  // Base URL - automatically uses proxy in development
  baseURL: getBaseURL(),

  // Billing-audit / Athena routes can run up to ~30m server-side (athena.poll_timeout_seconds); keep a small buffer.
  timeout: 35 * 60 * 1000,

  // Include credentials (cookies, authorization headers, etc.) in cross-origin requests
  withCredentials: true,

  // Default headers
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: add Authorization Bearer from Supabase session
apiClient.interceptors.request.use(async (config) => {
  const url = config.url ?? "";
  let token: string | null = null;

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token ?? null;
  }

  const isAuthish = url.includes("auth/");
  if (isAuthish) {
    authLog("axios:request (auth path)", {
      method: config.method,
      url,
      tokenFromSupabase: maskToken(token),
      willSetAuthorization: Boolean(token),
    });
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (url.includes("/api/v1/")) {
    interceptorLog("outbound (proxied)", {
      method: config.method,
      url,
      bearerMasked: maskToken(token),
      authorizationSet: Boolean(token),
    });
  }
  return config;
});

// Function to reset all stores and clear session when user is unauthenticated
const resetAllStores = () => {
  authLog("axios:resetAllStores (401 or explicit logout path)");
  useAuthStore.getState().reset();
  void supabase?.auth.signOut();
};

// Add response interceptor to handle 401 (Unauthorized) and 403 (Forbidden) responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url ?? "";

    if (status === 401) {
      const skipLogout = shouldSkipGlobalLogoutOn401(reqUrl);
      interceptorLog("401 response", {
        url: reqUrl,
        skipGlobalLogout: skipLogout,
        hadAuthHeader: Boolean(error.config?.headers?.Authorization),
      });
      authLogError(
        "axios:401 Unauthorized",
        error.response?.data,
        {
          url: reqUrl,
          hadAuthHeader: Boolean(error.config?.headers?.Authorization),
          skipGlobalLogout: skipLogout,
        }
      );
      if (!skipLogout) {
        resetAllStores();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    if (status === 403) {
      interceptorLog("403 Forbidden", { url: reqUrl });
    }

    // Continue with the error to be handled by the next interceptor
    return Promise.reject(error);
  }
);

// Response interceptor to handle notifications from base_response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = getCurrentConfig();

    // Check if this URL should be excluded from notifications
    if (shouldExcludeNotification(response.config.url || "")) {
      return response;
    }

    // Check if the response has a base_response with notification
    if (response.data && typeof response.data === "object") {
      const data = response.data as { base_response?: BaseResponse };

      if (data.base_response?.notification) {
        const notification = data.base_response.notification;

        const toastOptions = {
          duration: config.duration,
          position: config.position,
        };

        switch (notification.type) {
          case "success":
            if (config.showSuccessNotifications) {
              toast.success(notification.message, toastOptions);
            }
            break;
          case "info":
            if (config.showInfoNotifications) {
              toast.info(notification.message, toastOptions);
            }
            break;
          case "warning":
            if (config.showWarningNotifications) {
              toast.warning(notification.message, toastOptions);
            }
            break;
          case "error":
            if (config.showErrorNotifications) {
              toast.error(notification.message, toastOptions);
            }
            break;
          default:
            // Fallback to info for any unexpected types
            if (config.showInfoNotifications) {
              toast.info(notification.message, toastOptions);
            }
        }
      }
    }

    return response;
  },
  (error) => {
    const config = getCurrentConfig();

    // Check if this URL should be excluded from notifications
    if (shouldExcludeNotification(error.config?.url || "")) {
      return Promise.reject(error);
    }

    const toastOptions = {
      duration: config.duration,
      position: config.position,
    };

    // 403s are handled by the auth interceptor (redirect to /403) — never toast them
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    // Handle error responses
    if (error.response?.data && typeof error.response.data === "object") {
      const data = error.response.data as { base_response?: BaseResponse };

      if (data.base_response?.notification) {
        const notification = data.base_response.notification;

        switch (notification.type) {
          case "error":
            if (config.showErrorNotifications) {
              const toastId = data.base_response?.error_code;
              toast.error(notification.message, {
                ...toastOptions,
                ...(toastId ? { id: toastId } : {}),
              });
            }
            break;
          case "warning":
            if (config.showWarningNotifications) {
              toast.warning(notification.message, toastOptions);
            }
            break;
          case "info":
            if (config.showInfoNotifications) {
              toast.info(notification.message, toastOptions);
            }
            break;
          case "success":
            if (config.showSuccessNotifications) {
              toast.success(notification.message, toastOptions);
            }
            break;
          default:
            // Fallback to error for error responses
            if (config.showErrorNotifications) {
              const toastId = data.base_response?.error_code;
              toast.error(notification.message, {
                ...toastOptions,
                ...(toastId ? { id: toastId } : {}),
              });
            }
        }
      } else if (config.showFallbackErrors) {
        // Fallback error toast if no notification is provided
        toast.error(
          "An error occurred while processing your request",
          toastOptions
        );
      }
    } else if (config.showFallbackErrors) {
      // Network errors or other issues
      toast.error(
        "Network error. Please check your connection and try again.",
        toastOptions
      );
    }

    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods with proper typing
const api = {
  get: <T = unknown>(url: string, config?: object): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: object
  ): Promise<AxiosResponse<T>> => apiClient.post<T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: object
  ): Promise<AxiosResponse<T>> => apiClient.put<T>(url, data, config),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: object
  ): Promise<AxiosResponse<T>> => apiClient.patch<T>(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: object
  ): Promise<AxiosResponse<T>> => apiClient.delete<T>(url, config),
};

// Export configuration management functions
export {
  getInterceptorConfig,
  updateInterceptorConfig,
  resetInterceptorConfig,
} from "./config-manager";

export default api;