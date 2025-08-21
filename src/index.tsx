import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

createChat({
  webhookUrl: 'https://nrm-agent.app.n8n.cloud/webhook/51da722f-7785-479a-a7a5-04175eb3b754/chat'
})
