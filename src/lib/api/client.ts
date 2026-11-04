"use client";

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiEnvelope, AuthResult } from "@/types";

export class ApiClientError extends Error {
  status: number | null;
  details: unknown;

  constructor(message: string, status: number | null = null, details: unknown = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Let the browser set the multipart boundary.
    config.headers.delete("Content-Type");
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiEnvelope<AuthResult>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 30_000 },
    );

    const session = response.data.data;
    if (!session?.accessToken) {
      useAuthStore.getState().clearSession();
      return null;
    }

    useAuthStore.getState().setSession(session);
    return session.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/google");

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });

      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(original);
      }
    }

    return Promise.reject(error);
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiEnvelope<T>>(config);
    const body = response.data;

    if (!body || body.success !== true) {
      throw new ApiClientError(
        body && typeof body === "object" && "message" in body
          ? String((body as { message?: unknown }).message ?? "Request failed")
          : "Request failed",
        response.status,
        body,
      );
    }

    return body.data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;

    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as
        | { message?: unknown; error?: unknown }
        | undefined;
      const message =
        (typeof payload?.message === "string" && payload.message) ||
        (typeof payload?.error === "string" && payload.error) ||
        error.message ||
        "Network request failed";

      throw new ApiClientError(message, error.response?.status ?? null, payload);
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "Unexpected error",
      null,
      error,
    );
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 403;
}
