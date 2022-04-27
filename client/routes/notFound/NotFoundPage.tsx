import { useNavigate } from "react-router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast.error("Page Not Found");
    navigate("/");
  }, [navigate]);
  
  return (
    <div className="NotFoundPage">
      Page Not Found
    </div>
  );
}
