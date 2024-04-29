import App from './App.jsx'
import React from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(App)
  )
)