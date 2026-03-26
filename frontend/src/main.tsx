import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'

// MSW 初期化（開発環境のみ）
const initMSW = async () => {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser')
      await worker.start({
        onUnhandledRequest: 'warn',
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
