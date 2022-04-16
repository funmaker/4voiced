import { useLocation } from "react-router";
import useChange from "./useChange";

type Location = ReturnType<typeof useLocation>;
type Callback = (current: Location, prev: Location) => void;
export const locationCmp = (a: Location, b: Location) => a.pathname + a.search === b.pathname + b.search;

export default function useLocationChange(callback: Callback) {
  const location = useLocation();
  
  useChange(location, callback, locationCmp);
}
