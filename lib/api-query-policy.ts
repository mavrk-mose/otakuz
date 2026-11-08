import { retryApiRequest, apiRetryDelay } from "@/lib/http";
export const apiQueryPolicy = { retry: retryApiRequest, retryDelay: apiRetryDelay };
