import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from "react-router";
import { hot } from 'react-hot-loader';
import { ToastContainer } from "react-toastify";
import { usePageDataInit, PageDataContext } from "./hooks/usePageData";
import IndexPage from "./routes/index/IndexPage";
import "./globals.scss";

interface Props {
  initialData: any;
}

declare global {
  interface Window {
    _csrf: string;
  }
}

// eslint-disable-next-line prefer-arrow-callback
export default hot(module)(function App({ initialData }: Props) {
  const contextData = usePageDataInit(initialData);
  
  useEffect(() => {
    window._csrf = initialData._csrf;
  }, [initialData._csrf]);
  
  // if(initialData._error) {
  //   return <ErrorPage error={initialData._error} />;
  // }
  
  return (
    <PageDataContext.Provider value={contextData}>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Redirect to="/" />
      </Switch>
      <ToastContainer position="bottom-right" newestOnTop />
    </PageDataContext.Provider>
  );
});
