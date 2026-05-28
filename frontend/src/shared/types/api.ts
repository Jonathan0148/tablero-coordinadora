export type ApiResponse<T> = {
  code: number;
  message: string;
  userMessage: string;
  data: T;
};

export type ApiErrorData = {
  traceCode?: string;
  module?: string;
  process?: string;
  details?: unknown;
};

export type ApiErrorResponse = ApiResponse<ApiErrorData | null>;

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ApiFieldError = {
  field: string;
  message: string;
};
