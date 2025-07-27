import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {Provider} from "react-redux";
import { store } from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));
const queryClient = new QueryClient({
  defaultOptions : {
    queries : {
      staleTime : 0,
      retry : 0
    }
  }
})
root.render(
  <Provider store={store}>
  <QueryClientProvider client={queryClient} >
    <App />
    <ReactQueryDevtools initialIsOpen={true} buttonPosition='bottom-right' />
  </QueryClientProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
