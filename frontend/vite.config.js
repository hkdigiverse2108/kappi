import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { injectSeoIntoHtml } from './src/utils/seoTags.js'

// index.html ships with default SEO tags. On every dev page load, replace their values with the
// SEO saved in the admin panel for the requested page (so view-source and link previews match it).
// backend/app/main.py does the same for the built site.
const seoHtmlPlugin = (backendUrl) => ({
  name: 'kapee-seo-html',
  apply: 'serve',
  transformIndexHtml: {
    order: 'pre',
    async handler(html, ctx) {
      try {
        const path = (ctx.originalUrl || ctx.path || '/').split('?')[0]
        const res = await fetch(`${backendUrl}/api/seo?path=${encodeURIComponent(path)}`)
        return injectSeoIntoHtml(html, (await res.json()).seo)
      } catch {
        return html // backend not running: keep the defaults
      }
    },
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env lives in the project root, shared with the backend
  const env = loadEnv(mode, '..', '')
  // 127.0.0.1 instead of localhost: on Windows "localhost" adds ~200ms to every request
  const backendUrl = env.BACKEND_URL || `http://127.0.0.1:${env.BACKEND_PORT || 5000}`

  return {
    plugins: [react(), seoHtmlPlugin(backendUrl)],
    server: {
      port: Number(env.FRONTEND_PORT) || 5173,
      host: true,
      proxy: {
        '/api': backendUrl,
        '/uploads': backendUrl,
      },
    },
  }
})
