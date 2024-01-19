import { Navigate } from "react-router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

export default function NotFoundPage() {
  useEffect(() => {
    toast.error("Page Not Found");
  }, []);
  
  return <Navigate to="/" />;
}
