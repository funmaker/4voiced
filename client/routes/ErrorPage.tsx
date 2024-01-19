import React, { useEffect } from 'react';
import { Navigate } from 'react-router';
import { toast } from "react-toastify";
import { ErrorResponse } from "../../types/api";

interface Props {
  error: ErrorResponse;
}

export default function ErrorPage({ error }: Props) {
  useEffect(() => {
    // if(error.code === ErrorCode.UNAUTHORIZED) {
    //   toast.warning(initialError.message);
    //   navigateRef.current(`/auth/login${qsStringify({ redirect: locationRef.current.pathname + locationRef.current.search + locationRef.current.hash })}`);
    // } else if(error.code === ErrorCode.INSUFFICIENT_PERMISSIONS || error.code === ErrorCode.ROUTE_NOT_FOUND) {
    //   toast.warning(initialError.message);
    //   navigateRef.current(`/`);
    // } else if(error.code !== ErrorCode.NOT_FOUND) {
    //   toast.error(error?.message || "Something Happened");
    // }
    
    toast.error(error?.message || "Something Happened");
  }, [error?.message]);
  
  return <Navigate to="/" />;
}
