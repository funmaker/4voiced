import isNode from 'detect-node';
import axios, { Method, Canceler, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from "react-toastify";
import { ErrorResponse } from "../../types/api";
import { qsStringify } from './utils';

// eslint-disable-next-line @typescript-eslint/naming-convention
const CancelToken = axios.CancelToken;

interface RequestOptions<Req> extends Omit<AxiosRequestConfig<Req>, "cancelToken"> {
  search?: string | Req;
  cancelCb?: (cancel: Canceler) => void;
  waitFix?: boolean; // TODO: Need proper fix for ns_binding_aborted
}

interface RequestJsonError<T> extends AxiosError<T> {
  cancelNotify: () => void;
}

export default async function requestJSON<Res = void, Req = never>({ url = "", search, cancelCb, waitFix, headers, ...rest }: RequestOptions<Req> = {}): Promise<Res> {
  if(isNode) return new Promise(() => {});
  
  if(search && typeof search !== "string") search = qsStringify(search);
  if(search) url += search;
  
  if(waitFix) await new Promise(res => setTimeout(res, 0));
  
  try {
    const response = await axios({
      ...rest,
      url,
      cancelToken: cancelCb ? new CancelToken(cancelCb) : undefined,
      headers: {
        ...headers,
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
