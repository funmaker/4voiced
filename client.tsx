import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from "./client/App";
import 'react-toastify/dist/ReactToastify.css';
import 'semantic-ui-less/semantic.less';

const initialData = JSON.parse(document?.getElementById('initialData')?.innerHTML || "{}"); // TODO: Inner text?

ReactDOM.hydrate(
  <BrowserRouter>
    <App initialData={initialData} />
  </BrowserRouter>
  , document.getElementById('root'));
