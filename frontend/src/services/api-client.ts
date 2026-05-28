import axios, { AxiosError } from "axios";
import { tokenStorage } from "@/services/token-storage";
import type { ApiErrorResponse, ApiResponse } from "@/shared/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export class EnterpriseApiError extends Error {
  readonly status?: number;
  readonly code?: number;
  readonly userMessage: string;
  readonly traceCode?: string;
  readonly details?: unknown;

  constructor(error: AxiosError<ApiErrorResponse>) {
    const response = error.response;
    const payload = response?.data;
    const diagnostic = payload?.data?.details as
      | { rootCauseMessage?: string; exceptionType?: string }
      | undefined;
    const diagnosticHint = diagnostic?.rootCauseMessage
      ? ` (${diagnostic.rootCauseMessage})`
      : "";
    super((payload?.message ?? error.message) + diagnosticHint);
    this.name = "EnterpriseApiError";
    this.status = response?.status;
    this.code = payload?.code;
    this.userMessage = payload?.userMessage ?? "No fue posible completar la operación";
    this.traceCode = payload?.data?.traceCode;
    this.details = payload?.data?.details;
  }
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(new EnterpriseApiError(error));
  },
);

export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data;
}
