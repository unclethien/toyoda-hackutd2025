import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

// Auth0 configuration
const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!domain || !clientId) {
  throw new Error(
    "Missing Auth0 configuration. Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env.local"
  );
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
