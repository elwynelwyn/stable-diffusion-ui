import React from 'react'
import ReactDOM from 'react-dom/client'
import { enableMapSet } from 'immer';
import App from './App'
import './index.css'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient();
enableMapSet();

// application entry point
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
     <QueryClientProvider client={queryClient}>
       <App />
     </QueryClientProvider>
  </React.StrictMode>
)
