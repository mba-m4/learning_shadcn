import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// MSW 初期化（開発環境のみ）
const initMSW = async () => {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser')
      await worker.start({
        onUnhandledRequest: (request, print) => {
          const requestUrl = new URL(request.url)
          const apiUrl = new URL(API_BASE_URL)
          const isApiRequest =
            requestUrl.origin === apiUrl.origin &&
            requestUrl.pathname.startsWith(apiUrl.pathname)

          if (isApiRequest) {
            print.warning()
          }
        },
      })
    } catch (error) {
      console.error('Failed to start MSW:', error)
    }
  }
}

// MSW を起動してからアプリをレンダリング
initMSW().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
