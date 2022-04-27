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
  config: null as null | Config,
  fetch: null as null | (() => UnlistenCallback),
});

interface FetchEmitter {
  listeners: number;
  unlisten: UnlistenCallback;
  cancel: Canceler;
}

interface PageDataProviderProps {
  initialData: any;
  children: React.ReactNode;
}

export function PageDataProvider({ initialData, children }: PageDataProviderProps) {
  const initialError = !!initialData?._error;
  
  const [pageData, setPageData] = useState(initialError ? null : initialData);
  const fetchEmitter = useRef<FetchEmitter | null>(null);
  const location = useLocation();
  const locationRef = useRef(location);
  const locationChanged = !locationCmp(locationRef.current, location);
  const error = useRef(initialError);
  const config = initialData._config;
  
  if(locationChanged) {
    fetchEmitter.current?.cancel();
    fetchEmitter.current = null;
    locationRef.current = location;
    error.current = false;
  }
  
  useEffect(() => {
    if(locationChanged && pageData) setPageData(null);
  }, [locationChanged, pageData]);
  
  useEffect(() => {
    if(initialData?._error && initialData._error.code !== 404) {
      toast.error(initialData?._error?.message || "Something Happened");
      console.error(initialData._error);
    }
  }, [initialData._error]);
  
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
    
    const self = fetchEmitter.current = {
      listeners: 1,
      unlisten() {
        self.listeners--;
        if(self.listeners <= 0) self.cancel();
      },
      cancel: cancelFetch,
    };
    fetchEmitter.current.unlisten = fetchEmitter.current.unlisten.bind(fetchEmitter.current);
    
    return fetchEmitter.current.unlisten;
  }, []);
  
  const value = useMemo(() => ({
    pageData: locationChanged ? null : pageData,
    fetch,
    config,
  }), [locationChanged, pageData, fetch, config]);
  
  return (
    <PageDataContext.Provider value={value}>
      {children}
    </PageDataContext.Provider>
  );
}

export default function usePageData<T>(autoFetch = true): [T | null, boolean, () => UnlistenCallback] {
  const { pageData, fetch } = useContext(PageDataContext);
  if(!fetch) throw new Error("useConfig must be used within PageData context");
  
  const loaded = pageData !== null;
  
  useEffect(() => {
    if(loaded || !autoFetch) return;
    else return fetch();
  }, [fetch, loaded, autoFetch]);
  
  return [pageData, !loaded, fetch];
}

export function useConfig(): Config {
  const { config } = useContext(PageDataContext);
  if(!config) throw new Error("useConfig must be used within PageData context");
  
  return config;
}
