import { Dispatch, useCallback, useEffect, useReducer, useRef } from "react";
import axios, { Canceler } from "axios";
import requestJSON from "../helpers/requestJSON";
import useChange, { arrayCmp } from "./useChange";

export interface EndlessPageOptions<Res, Req, I> {
  pathname: string;
  search?: Omit<Req, 'page'>;
  initialPage?: I[];
  responseMap: (response: Res) => I[];
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
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
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
  }, []);
  
  const checkScroll = useCallback(() => {
    const body = document.body;
    const html = document.documentElement;
    const bottomPosition = window.pageYOffset + window.innerHeight;
    const bodyHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    
    if(bodyHeight - bottomPosition < window.innerHeight * 0.5) requestNext();
  }, [requestNext]);
  
  const reset = useCallback(() => {
    if(cancelRef.current) cancelRef.current();
    dispatch({ kind: "reset" });
  }, []);
  
  useEffect(() => checkScroll(), [checkScroll, state.items]);
  
  useEffect(() => {
    checkScroll();
    document.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      document.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);
  
  useChange(deps, reset, arrayCmp);
  
  return { ...state, requestNext, reset };
}
