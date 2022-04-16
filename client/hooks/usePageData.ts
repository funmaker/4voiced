import React, { ContextType, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Canceler } from "axios";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import { Config } from "../../types/api";
import requestJSON from "../helpers/requestJSON";
import useLocationChange, { locationCmp } from "./useLocationChange";

type UnlistenCallback = () => void;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PageDataContext = React.createContext({
  pageData: null as any,
  config: null as any as Config,
  fetch: (): UnlistenCallback => { throw new Error("Not Initialized"); },
});

interface FetchEmitter {
  listeners: number;
  unlisten: UnlistenCallback;
  cancel: Canceler;
}

export function usePageDataInit(initialData: any = null): ContextType<typeof PageDataContext> {
  const initialError = !!initialData?._error;
  
  const [pageData, setPageData] = useState(initialError ? null : initialData);
  const fetchEmitter = useRef<FetchEmitter | null>(null);
  const location = useLocation();
  const locationRef = useRef(location);
  const error = useRef(initialError);
  const config = initialData._config;
  
  useEffect(() => {
    if(initialData?._error) {
      toast.error(initialData?._error?.message || "Something Happened");
      console.error(initialData._error);
    }
  }, [initialData._error]);
  
  useLocationChange((location) => {
    fetchEmitter.current?.cancel();
    fetchEmitter.current = null;
    locationRef.current = location;
    error.current = false;
    setPageData(null);
  });
  
  const fetch = useCallback(() => {
    if(error.current) return () => {};
    
    if(fetchEmitter.current) {
      fetchEmitter.current.listeners++;
      return fetchEmitter.current.unlisten;
    }
    
    let cancelFetch = () => {};
    requestJSON({
      waitFix: true,
      cancelCb: cancel => cancelFetch = cancel,
    }).then(data => {
      setPageData(data);
    }).catch(error => {
      error.current = true;
    }).finally(() => {
      fetchEmitter.current = null;
    });
    
    fetchEmitter.current = {
      listeners: 1,
      unlisten() {
        this.listeners--;
        if(this.listeners <= 0) this.cancel();
      },
      cancel: cancelFetch,
    };
    fetchEmitter.current.unlisten = fetchEmitter.current.unlisten.bind(fetchEmitter.current);
    
    return fetchEmitter.current.unlisten;
  }, []);
  
  const data = locationCmp(locationRef.current, location) ? pageData : null;
  return useMemo(() => ({ pageData: data, fetch, config }), [data, fetch, config]);
}

export default function usePageData<T>(autoFetch = true): [T | null, boolean, () => void] {
  const { pageData, fetch } = useContext(PageDataContext);
  
  const loaded = pageData !== null;
  
  useEffect(() => {
    if(loaded || !autoFetch) return;
    else return fetch();
  }, [fetch, loaded, autoFetch]);
  
  return [pageData, !loaded, fetch];
}

export function useConfig(): Config {
  const { config } = useContext(PageDataContext);
  return config;
}
