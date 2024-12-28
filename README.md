# react-oauth-login

`react-oauth-login`は、ReactでOAuth 2.0の認証を簡単に実装するためのライブラリです。`useOAuth`フックと`OAuth`コンポーネントを提供し、アクセストークンの取得や検証をシンプルに行うことができます。

## 特徴
- OAuth 2.0認証の簡易化
- アクセストークンのローカルストレージ管理
- Reactフック (`useOAuth`) とコンポーネント (`OAuth`) のサポート
- トークンの有効期限管理と自動リフレッシュ

---

## インストール

```bash
npm install react-oauth-login
```

---

## 使用方法

### フック: `useOAuth`

`useOAuth`は、OAuth 2.0認証を処理するためのカスタムフックです。

#### パラメータ
- `endpoint`: 認証エンドポイントURL（例: GoogleのOAuthエンドポイント）
- `params`: 認証時に必要なクエリパラメータ

#### 戻り値
- `token`: アクセストークン
- `verifyToken`: トークンの有効期限を確認する関数

#### 使用例
```tsx
import { useOAuth } from 'react-oauth-login'

const App = () => {
  const { token, verifyToken } = useOAuth({
    endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    params: {
      client_id: 'YOUR_CLIENT_ID',
      redirect_uri: 'YOUR_REDIRECT_URI',
      response_type: 'token',
      scope: 'YOUR_REQUESTED_SCOPE',
    },
  })

  if (!verifyToken()) {
    return <p>Authenticating...</p>
  }

  return <p>Authenticated! Token: {token}</p>
}
```

---

### コンポーネント: `OAuth`

`OAuth`コンポーネントは、`useOAuth`をラップして、Reactのコンポーネント構造で使いやすくしたものです。

#### Props
- `endpoint`: 認証エンドポイントURL
- `params`: 認証時に必要なクエリパラメータ
- `children`: トークン情報と検証関数を受け取る子コンポーネント

#### 使用例
```tsx
import { OAuth } from 'react-oauth-login'

const App = () => {
  return (
    <OAuth
      endpoint="https://accounts.google.com/o/oauth2/v2/auth"
      params={{
        client_id: 'YOUR_CLIENT_ID',
        redirect_uri: 'YOUR_REDIRECT_URI',
        response_type: 'token',
        scope: 'YOUR_REQUESTED_SCOPE',
      }}
    >
      {({ token, verifyToken }) => (
        verifyToken() ? <p>Token: {token}</p> : <p>Authenticating...</p>
      )}
    </OAuth>
  )
}
```

---

### 応用例: Firebase Cloud Messaging (FCM)

以下は、取得したアクセストークンを使用してFirebase Cloud MessagingのAPIを呼び出す例です。

```tsx
import { OAuth } from 'react-oauth-login'

export const App = () => {
  const sendHandler = async (e, token) => {
    e.preventDefault()

    const form = new FormData(e.target)

    try {
      const res = await fetch('https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: form.get('destination'),
            notification: {
              title: form.get('title'),
              body: form.get('body'),
            },
          },
        }),
      })

      const data = await res.json()
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <OAuth
      endpoint="https://accounts.google.com/o/oauth2/v2/auth"
      params={{
        client_id: 'YOUR_CLIENT_ID',
        redirect_uri: 'YOUR_REDIRECT_URI',
        response_type: 'token',
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
      }}
    >
      {({ token }) => (
        <form onSubmit={(e) => sendHandler(e, token)}>
          <label>User Device Token:
            <input name="destination" required />
          </label>

          <label>Title:
            <input name="title" required />
          </label>

          <label>Body:
            <input name="body" required />
          </label>

          <button type="submit">Send Notification</button>
        </form>
      )}
    </OAuth>
  )
}
```

---

## 作者
[@shinosaki](https://shinosaki.com)

---

## ライセンス

MIT License