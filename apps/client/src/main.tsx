import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import EmailTemplatePage from './EmailTemplatePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmailTemplatePage />
  </StrictMode>,
)

