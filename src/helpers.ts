import crypto from 'crypto'

const scopes = 'write_products'

export const redirectUri = `${SHOPIFY_APP_URL}/shopify/callback`

export const buildInstallUrl = (shop: string, state: string): string =>
  `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`

export const buildAccessTokenRequestUrl = (shop: string): string => `https://${shop}/admin/oauth/access_token`

export const buildShopDataRequestUrl = (shop: string): string => `https://${shop}/admin/shop.json`

export const generateEncryptedHash = (params: string): string =>
  crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(params).digest('hex')

export async function fetchAccessToken(shop: string, data: Record<string, string>): Promise<Record<string, string>> {
  const response = await fetch(buildAccessTokenRequestUrl(shop), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export async function fetchShopData(shop: string, accessToken: string): Promise<Record<string, string>> {
  const response = await fetch(buildShopDataRequestUrl(shop), {
    method: 'GET',
    headers: { 'X-Shopify-Access-Token': accessToken }
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}
