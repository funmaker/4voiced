import React, { useEffect } from 'react';
import { Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import { PageDataProvider } from "./hooks/usePageData";
import { SSRProvider } from "./hooks/useSSR";
import IndexPage from "./routes/IndexPage";
import NotFoundPage from "./routes/NotFoundPage";
import ErrorPage from "./routes/ErrorPage";
import Layout from "./components/Layout";
import "./globals.css";

interface AppProps {
  initialData: any;
}

declare global {
  interface Window {
    _csrf: string;
  }
}

export default function App({ initialData }: AppProps) {
  useEffect(() => {
    window._csrf = initialData._csrf;
  }, [initialData._csrf]);
  
  // if(initialData._error) {
  //   return <ErrorPage error={initialData._error} />;
  // }
  
  return (
    <SSRProvider>
      <PageDataProvider initialData={initialData}>
        <Routes>
          <Route path="/" element={<Layout><IndexPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
        <ToastContainer position="bottom-right" newestOnTop />
      </PageDataProvider>
    </SSRProvider>
  );
}
