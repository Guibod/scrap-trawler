
export type QueryParams<T> = {
  search?: string
  sort?: keyof T
  direction?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}