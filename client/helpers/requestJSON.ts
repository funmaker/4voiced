import isNode from 'detect-node';
import axios, { Canceler, AxiosRequestConfig } from 'axios';
import { qsStringify } from './utils';
import { ClientError } from "./clientError";

const CancelToken = axios.CancelToken;

interface RequestOptions<Req> extends Omit<AxiosRequestConfig<Req>, "cancelToken"> {
  search?: string | Req;
  cancelCb?: (cancel: Canceler) => void;
  waitFix?: boolean; // TODO: Need proper fix for ns_binding_aborted
  multiPart?: boolean;
}

export default async function requestJSON<Res = void, Req = never>({ url = "", search, cancelCb, waitFix, data, multiPart, headers, ...rest }: RequestOptions<Req> = {}): Promise<Res> {
  if(isNode) return new Promise(() => {});
  
  if(search && typeof search !== "string") search = qsStringify(search);
  if(search) url += search;
  
  let parsedData: any = data;
  if(multiPart && data) {
    const formData = new FormData();
    
    const jsonPart = JSON.stringify(data, (key, value) => {
      if(value instanceof File || (Array.isArray(value) && value.some(value => value instanceof File))) return undefined;
      else return value;
    });
    
    formData.append("json_part", jsonPart);
    
    for(const [key, value] of Object.entries(data)) {
      if(value instanceof File) {
        formData.append(key, value);
      } else if(Array.isArray(value)) {
        for(const item of value) {
          if(item instanceof File) {
            formData.append(key, item);
          }
        }
      }
    }
    
    parsedData = formData;
  }
  
  if(waitFix) await new Promise(res => setTimeout(res, 0));
  
  try {
    const response = await axios({
      ...rest,
      data: parsedData,
      url,
      cancelToken: cancelCb ? new CancelToken(cancelCb) : undefined,
      headers: {
        ...headers,
        'CSRF-Token': window._csrf,
      },
    });
    
    return response.data;
  } catch(err: any) {
    err = new ClientError(err);
    
    if(!axios.isCancel(err.inner)) err.prepareNotify();
    
    throw err;
  }
}
