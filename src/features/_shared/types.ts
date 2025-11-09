// Shared feature-layer types (DTOs, pagination, base responses)

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
