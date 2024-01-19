import "core-js/stable";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from "./client/App";
import 'react-toastify/dist/ReactToastify.css';

const initialData = JSON.parse(document?.getElementById('initialData')?.innerHTML || "{}"); // TODO: Inner text?

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App initialData={initialData} />
  </BrowserRouter>,
);
