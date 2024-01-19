import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios, { Canceler } from "axios";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Config, InitialData } from "../../types/api";
import { ClientError } from "../helpers/clientError";
import { qsStringify } from "../helpers/utils";
import requestJSON from "../helpers/requestJSON";
import { locationCmp } from "./useLocationChange";
import useRefCache from "./useRefCache";

type UnlistenCallback = () => void;

interface PageDataContextState {
  pageData: any;
  pageError: ClientError | null;
  fetching: boolean;
  fetch: (() => UnlistenCallback) | null;
  config: Config | null;
}

export const PageDataContext = React.createContext<PageDataContextState>({
  pageData: null,
  pageError: null,
  fetching: false,
  fetch: null,
  config: null,
});

declare global {
  interface Window {
    _csrf: string;
  }
}

interface FetchEmitter {
  listeners: number;
  unlisten: UnlistenCallback;
  cancel: Canceler;
}

interface PageDataProviderProps {
  initialData: InitialData;
  children: React.ReactNode;
}

export function PageDataProvider({ initialData, children }: PageDataProviderProps) {
  const [pageData, setPageData] = useState<any>(initialData?._error ? null : initialData);
  const [pageError, setPageError] = useState<ClientError | null>(initialData?._error ? new ClientError(initialData._error) : null);
  const [fetching, setFetching] = useState(false);
  const fetchEmitter = useRef<FetchEmitter | null>(null);
  const navigate = useNavigate();
  const navigateRef = useRefCache(navigate); // TODO: remix-run/react-router/issues/7634
  const location = useLocation();
  const locationRef = useRef(location);
  const locationChanged = !locationCmp(locationRef.current, location);
  const error = useRef(!!pageError);
  const config = initialData._config;
  
  if(locationChanged) {
    fetchEmitter.current?.cancel();
    fetchEmitter.current = null;
    locationRef.current = location;
    error.current = false;
  }
  
  useEffect(() => {
    window._csrf = config.csrf;
  }, [config.csrf]);
  
  useEffect(() => {
    if(locationChanged) {
      if(pageData) setPageData(null);
      if(pageError) setPageError(null);
    }
  }, [locationChanged, pageData, pageError]);
  
  useEffect(() => {
    const initialError = initialData?._error;
    if(initialError) {
      if(initialError.status === 401) {
        toast.warning(initialError.message);
        navigateRef.current(`/auth/login${qsStringify({ redirect: locationRef.current.pathname + locationRef.current.search + locationRef.current.hash })}`);
      } else if(initialError.status === 403 || (initialError.status === 404 && initialError.message === "Route not found")) {
        toast.warning(initialError.message);
        navigateRef.current(`/`);
      } else if(initialError.status !== 404) {
        toast.error(initialError?.message || "Something Happened");
      }
    }
  }, [navigateRef, initialData]);
  
  const fetch = useCallback(() => {
    if(error.current) return () => {};
    
    if(fetchEmitter.current) {
      fetchEmitter.current.listeners++;
      return fetchEmitter.current.unlisten;
    }
    
    setFetching(true);
    
    let cancelFetch = () => {};
    requestJSON({
      waitFix: true,
      cancelCb: cancel => cancelFetch = cancel,
    }).then(data => {
      setPageData(data);
    }).catch(err => {
      if(!axios.isCancel(err)) {
        error.current = true;
        setPageError(new ClientError(err));
      }
    }).finally(() => {
      fetchEmitter.current = null;
      setFetching(false);
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
    pageError: locationChanged ? null : pageError,
    fetching,
    fetch,
    config,
  }), [locationChanged, pageData, pageError, fetching, fetch, config]);
  
  return (
    <PageDataContext.Provider value={value}>
      {children}
    </PageDataContext.Provider>
  );
}

export default function usePageData<T>(autoFetch = true) {
  const { pageData, fetching, fetch, pageError } = useContext(PageDataContext);
  if(!fetch) throw new Error("useConfig must be used within PageData context");
  
  const loaded = pageData !== null;
  
  useEffect(() => {
    if(loaded || !autoFetch) return;
    else return fetch();
  }, [fetch, loaded, autoFetch]);
  
  return {
    pageData: pageData as T | null,
    fetching: fetching || (autoFetch && !pageData && !pageError),
    refresh: fetch,
    pageError,
  };
}

export function useConfig(): Config {
  const { config } = useContext(PageDataContext);
  if(!config) throw new Error("useConfig must be used within PageData context");
  
  return config;
}
