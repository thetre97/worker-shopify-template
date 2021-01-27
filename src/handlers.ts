import cookie from 'cookie'
import { buildInstallUrl, fetchAccessToken, fetchShopData, generateEncryptedHash } from './helpers'
import { nanoid } from 'nanoid'

export async function handleInstall(request: Request): Promise<Response> {
  try {
    const shop = new URL(request.url).searchParams.get('shop')
    if (!shop) throw new Error('No shop provided.')

    const state = nanoid()
    const stateCookie = cookie.serialize('state', state, { sameSite: 'none', secure: true, httpOnly: true })
    const installUrl = buildInstallUrl(shop, state)

    const init: ResponseInit = {
      status: 301,
      headers: {
        Location: installUrl,
        'Set-Cookie': stateCookie
      }
    }

    return new Response(null, init)
  } catch (error) {
    return new Response(error.message, { status: 400 })
  }
}

export async function handleCallback(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams

    const shop = params.get('shop')
    const code = params.get('code')
    const state = params.get('state')
    const hmac = params.get('hmac')

    if (!code) throw new Error('Missing code.')

    const stateCookie = cookie.parse(request.headers.get('cookie') || '').state

    if (state !== stateCookie) throw new Error('State does not match.')

    if (!shop) throw new Error('No shop provided.')

    params.delete('hmac')
    const hash = generateEncryptedHash(params.toString())

    if (hmac !== hash) throw new Error('HMAC validation failed.')

    const data = {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    }

    const { access_token } = await fetchAccessToken(shop, data)

    const shopData = await fetchShopData(shop, access_token)

    const init: ResponseInit = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return new Response(JSON.stringify(shopData), init)
  } catch (error) {
    return new Response(error.message, { status: 400, headers: { 'Content-Type': 'text/html' } })
  }
}
