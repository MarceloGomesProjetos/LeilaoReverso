import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Reverse from './reverse_auction_docs.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Reverse />
  </StrictMode>,
)
