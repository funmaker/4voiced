import React, { Dispatch, useCallback, useEffect, useReducer, useRef } from "react";
import axios, { Canceler } from "axios";
import { useDebouncedCallback } from "use-debounce";
import requestJSON from "../helpers/requestJSON";
import useChange, { arrayCmp } from "./useChange";
import useRefCache from "./useRefCache";

export interface EndlessPageOptions<Res, Req, I> {
  pathname: string;
  search?: Omit<Req, 'page'>;
  initialPage?: I[];
  responseMap: (response: Res) => I[];
  context?: React.RefObject<HTMLElement | null>;
  fetchOverride?: boolean;
  resetDebounce?: number;
}

interface EndlessPageState<I> {
  items: I[];
  page: number;
  end: boolean;
  fetching: boolean;
}

type EndlessPageAction<I> = { kind: "fetchStart" | "fetchFail" | "fetchEnd" | "reset" }
                          | { kind: "fetchSuccess"; items: I[] };

function endlessPageReducer<I>(state: EndlessPageState<I>, action: EndlessPageAction<I>): EndlessPageState<I> {
  switch(action.kind) {
    case "fetchStart":
      return {
        ...state,
        fetching: true,
      };
    
    case "fetchSuccess":
      return {
        ...state,
        items: [...state.items, ...action.items],
        page: state.page + 1,
        fetching: false,
      };
    
    case "fetchEnd":
    case "fetchFail":
      return {
        ...state,
        fetching: false,
        end: true,
      };
    
    case "reset":
      return {
        ...state,
        items: [],
        page: 0,
        end: false,
      };
    
    default:
      return state;
  }
}

export interface Pageable {
  page?: number;
}

export default function useEndlessPage<Res, Req extends Pageable, I>(options: EndlessPageOptions<Res, Req, I>, deps: any[]) {
  const cancelRef = useRef<Canceler | null>(null);
  const fetchingRef = useRef(false);
  const optionsRef = useRefCache(options);
  const context = options.context;
  
  const [state, dispatch] = useReducer(endlessPageReducer, {
    items: options.initialPage || [],
    page: options.initialPage ? 1 : 0,
    end: false,
    fetching: false,
  }) as [EndlessPageState<I>, Dispatch<EndlessPageAction<I>>];
  const stateRef = useRef(state);
  stateRef.current = state;
  
  const requestNext = useCallback(async () => {
    if(fetchingRef.current || stateRef.current.end) return;
    
    fetchingRef.current = true;
    dispatch({ kind: "fetchStart" });
    
    try {
      const response = await requestJSON<Res, Req>({
        url: optionsRef.current.pathname,
        search: { // eslint-disable-line @typescript-eslint/consistent-type-assertions
          ...optionsRef.current.search,
          page: stateRef.current.page,
        } as Req,
        cancelCb: cancel => cancelRef.current = cancel,
      });
      
      const items = optionsRef.current.responseMap(response);
      
      if(items.length > 0) {
        dispatch({ kind: "fetchSuccess", items });
      } else {
        dispatch({ kind: "fetchEnd" });
      }
    } catch(e) {
      if(!(e instanceof axios.Cancel)) {
        dispatch({ kind: "fetchFail" });
      }
    } finally {
      cancelRef.current = null;
      fetchingRef.current = false;
    }
  }, [optionsRef]);
  
  const reset = useDebouncedCallback(() => {
    if(cancelRef.current) cancelRef.current();
    dispatch({ kind: "reset" });
  }, options.resetDebounce || 0);
  
  const checkScroll = useCallback((ev?: Event) => {
    if(ev && ev.type === "scroll") {
      if(ev.target !== document && ev.target !== optionsRef.current.context?.current) return;
    }
    
    if(reset.isPending()) return;
    
    if(optionsRef.current.fetchOverride !== undefined) {
      if(optionsRef.current.fetchOverride) requestNext();
      
      return;
    }
    
    let bottomPosition: number;
    let scrollHeight: number;
    let innerHeight: number;
    
    if(context?.current) {
      bottomPosition = context.current.scrollTop + context.current.offsetHeight;
      scrollHeight = context.current.scrollHeight;
      innerHeight = context.current.clientHeight;
    } else {
      const body = document.body;
      const html = document.documentElement;
      bottomPosition = window.scrollY + window.innerHeight;
      scrollHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      innerHeight = window.innerHeight;
    }
    
    if(scrollHeight - bottomPosition <= innerHeight * 0.5) requestNext();
  }, [context, optionsRef, requestNext, reset]);
  
  useChange(deps, reset, arrayCmp);
  
  useEffect(() => checkScroll(), [checkScroll, state.items, options.fetchOverride]); // remember to trigger checkScroll also whenever new page is fetched(state.items changed) or fetchOverride changed
  
  useEffect(() => {
    document.addEventListener("scroll", checkScroll, true);
    window.addEventListener("resize", checkScroll);
    
    return () => {
      document.removeEventListener("scroll", checkScroll, true);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);
  
  return { ...state, requestNext, reset };
}
