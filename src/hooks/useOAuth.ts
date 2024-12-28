import { useEffect, useState } from "react"

export interface OAuthParams {
  client_id: string
  redirect_uri: string
  response_type: string
  scope: string
  state?: string
  [key: string]: string | undefined
}

export interface UseOAuthProps {
  endpoint: string
  params: OAuthParams
}

export interface UseOAuth {
  token: string | null
  verifyToken: () => boolean
}

export const useOAuth = ({ endpoint, params }: UseOAuthProps): UseOAuth => {
  const [token, setToken]     = useState<string|null>(null)
  const [expires, setExpires] = useState<number|null>(null)

  const verifyToken = (): boolean => {
    if (!token || !expires) {
      return false
    }

    return Date.now() < expires
  }

  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1))

    const expiresIn   = hash.get('expires_in')
    const accessToken = hash.get('access_token')
    const state = hash.get('state')

    const parseTokenHandler = (token: string, expires: number) => {
      setToken(token)
      setExpires(expires)

      localStorage.setItem('oauth_token', token)
      localStorage.setItem('oauth_expires', expires.toString())

      // Remove hash from url
      window.history.replaceState(null, '', window.location.pathname)
    }

    const authorize = () => {
      const state = crypto.randomUUID()
      localStorage.setItem('oauth_state', state)

      const url = new URL(endpoint)
      url.search = new URLSearchParams({ ...params, state } as any).toString()

      location.href = url.toString()
    }

    if (expiresIn && accessToken) {
      const localState = localStorage.getItem('oauth_state')
      if (!state || !localState || state !== localState) {
        console.error('useOAuth: state mismatch', { state, localState })
        return
      }

      // get access token from url hash
      parseTokenHandler(
        accessToken,
        Date.now() + parseInt(expiresIn, 10) * 1000, // expires_in をミリ秒にして現在時刻に加算する
      )

      localStorage.removeItem('oauth_state')
    } else {
      const localToken   = localStorage.getItem('oauth_token')
      const localExpires = localStorage.getItem('oauth_expires')

      if (localToken && localExpires && Date.now() < parseInt(localExpires, 10)) {
        // LocalStorage にトークンがあって、有効期限内であればそれを返す
        setToken(localToken)
        setExpires(parseInt(localExpires, 10))
      } else {
        authorize()
      }
    }
  }, [endpoint, params])

  return { token, verifyToken }
}