import { Axios, isAxiosError } from "axios";

const apiClient = new Axios({
  baseURL: "https://a.4cdn.org/",
});

const API_REQUESTS_COOLDOWN = 1000;

let lastRequestTime: number | null = null;
let requestsWaiting = 0;
const lastRequestTimeMap = new Map<string, number>();

export async function request<T>(url: string, noCache: true): Promise<T>;
export async function request<T>(url: string, noCache?: boolean): Promise<T | null>;
export async function request<T>(url: string, noCache = false): Promise<T | null> {
  if(lastRequestTime !== null) {
    const nextSlot = lastRequestTime + (requestsWaiting + 1) * API_REQUESTS_COOLDOWN;
    if(nextSlot > Date.now()) {
      requestsWaiting++;
      await new Promise(res => setTimeout(res, nextSlot - Date.now()));
      requestsWaiting--;
    }
  }
  lastRequestTime = Date.now();
  
  const ifModifiedSince = noCache ? null : lastRequestTimeMap.get(url);
  lastRequestTimeMap.set(url, Date.now());
  
  try {
    const response = await apiClient.get<string>(url, {
      headers: {
        "If-Modified-Since": ifModifiedSince ? new Date(ifModifiedSince).toUTCString() : undefined,
      },
    });
    
    if(!response.data && noCache) throw new Error("Empty response!");
    else if(!response.data) return null;
    else return JSON.parse(response.data) as T;
  } catch(err) {
    if(isAxiosError(err) && err.response?.status === 304) {
      return null;
    }
    
    throw err;
  }
}
