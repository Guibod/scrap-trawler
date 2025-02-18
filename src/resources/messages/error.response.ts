export interface ErrorResponse {
  error: string;
  type: string;
}

export function isErrorResponse(obj: any): obj is ErrorResponse {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj.error === 'string' &&
    typeof obj.type === 'string';
}