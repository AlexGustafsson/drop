import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { BrowserRouter } from 'react-router-dom'

import App from './app'
import { SnackbarContainer } from './components/Snackbar'
import { translationsForLanguage } from './i18n'
import { useAuth } from './lib/auth'
import './main.css'

function disableBodyDragAndDrop() {
  document.body.addEventListener('dragover', (event: DragEvent) => {
    event.preventDefault()
  })

  document.body.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault()
  })
}

async function main() {
  disableBodyDragAndDrop()
  const locale = navigator.language
  const messages = translationsForLanguage(locale)
  const auth = useAuth()
  auth.initialize()

  const root = document.getElementById('app')
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <BrowserRouter>
          <IntlProvider
            defaultLocale="en-us"
            locale={locale}
            messages={messages}
          >
            <SnackbarContainer>
              <App />
            </SnackbarContainer>
          </IntlProvider>
        </BrowserRouter>
      </React.StrictMode>
    )
  }
}

document.addEventListener('DOMContentLoaded', main)
