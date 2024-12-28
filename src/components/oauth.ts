import { useOAuth, UseOAuth, UseOAuthProps } from "../hooks/useOAuth";

export interface OAuthProps extends UseOAuthProps {
  children: (props: UseOAuth) => React.ReactNode
}

export const OAuth: React.FC<OAuthProps> = ({ endpoint, params, children }) => {
  const { token, verifyToken } = useOAuth({ endpoint, params })

  return children({ token, verifyToken })
}