export type WSError = {
  statusCode: number;
  message: string;
  detail?: any;
};

export interface WSResponse<T = any> {
  data?: T | null;
  error?: WSError | null;
}

export function wsResponse<T>({ data = null, error = null }: WSResponse<T> = {}): WSResponse<T> {
  return { data, error };
}
