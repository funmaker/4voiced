import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { ErrorResponse } from "../../types/api";

export class ClientError extends Error {
  status: number;
  response: AxiosResponse<ErrorResponse> | null;
  inner: any;
  toastTimeout: NodeJS.Timeout | null = null;
  toastId: React.ReactText | null = null;
  
  constructor(error: AxiosError<ErrorResponse> | ErrorResponse | Error) {
    const anyError = error as any;
    const message = anyError.response?.data?.message || anyError.message || "Something Happened";
    
    super(message);
    
    this.status = anyError.response?.data?.status || anyError.status || anyError.response?.status || 0;
    this.response = anyError.response || null;
    this.stack = anyError.response?.data?.stack || anyError.stack || this.stack;
    this.inner = anyError;
  }
  
  prepareNotify() {
    if(this.toastTimeout) return;
    
    this.toastTimeout = setTimeout(() => {
      this.toastTimeout = null;
      this.toastId = toast.error(this.message);
    }, 0);
  }
  
  cancelNotify() {
    if(this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    if(this.toastId && toast.isActive(this.toastId)) {
      toast.dismiss(this.toastId);
      this.toastId = null;
    }
  }
}
