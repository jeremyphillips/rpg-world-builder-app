// First stylesheet to name a cascade layer fixes order for the page.
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
