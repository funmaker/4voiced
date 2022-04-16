import isNode from 'detect-node';
import axios, { Method, Canceler, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from "react-toastify";
import { ErrorResponse } from "../../types/api";
import { qsStringify } from './utils';

// eslint-disable-next-line @typescript-eslint/naming-convention
const CancelToken = axios.CancelToken;

interface RequestOptions<Req> {
  method?: Method;
  href?: string;
  host?: string;
  pathname?: string;
  search?: string | Req;
  data?: Req;
  cancelCb?: (cancel: Canceler) => void;
  axiosConfig?: AxiosRequestConfig;
  waitFix?: boolean; // TODO: Need proper fix for ns_binding_aborted
}

interface RequestJsonError<T> extends AxiosError<T> {
  cancelNotify: () => void;
}

export default async function requestJSON<Res = void, Req = never>(options: RequestOptions<Req> = {}): Promise<Res> {
  if(isNode) return new Promise(() => {});
  let { method, href, host, pathname, search, cancelCb, data, axiosConfig } = options;
  
  host = host || location.host;
  pathname = pathname || location.pathname;
  if(search && typeof search !== "string") {
    search = qsStringify(search);
  }
  search = search !== undefined ? search : location.search;
  href = href || `//${host}${pathname}${search}`;
  method = method || "GET";
  
  if(options.waitFix) await new Promise(res => setTimeout(res, 0));
  
  try {
    const response = await axios({
      ...axiosConfig,
      method,
      url: href,
      data,
      cancelToken: cancelCb ? new CancelToken(cancelCb) : undefined,
      headers: {
        'CSRF-Token': window._csrf, // eslint-disable-line @typescript-eslint/naming-convention
      },
    });
    
    return response.data;
  } catch(err: any) {
    console.error(err);
    
    const error: RequestJsonError<ErrorResponse> = err;
    error.cancelNotify = () => {};
    
    if(error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
      const jsonError = error?.response?.data?._error;
      if(jsonError) {
        console.error(jsonError);
        const code = jsonError.code;
        
        const err = new Error(jsonError.message);
        err.stack = jsonError.stack;
        
        const content = jsonError.message.replace("#CODE", `${code}`);
        
        const toastTimeout = setTimeout(() => {
          const toastId = toast.error(content);
          error.cancelNotify = () => toast.dismiss(toastId);
        }, 0);
        
        error.cancelNotify = () => clearTimeout(toastTimeout);
      }
    }
    
    throw error;
  }
}
