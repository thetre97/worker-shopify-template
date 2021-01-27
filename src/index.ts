import Router from './router'
import { handleCallback, handleInstall } from './handlers'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request): Promise<Response> {
  const r = new Router()

  r.get('/shopify', handleInstall)
  r.get('/shopify/callback', handleCallback)

  const resp = await r.route(request)
  return resp
}
