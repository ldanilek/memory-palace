import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const authInfo = convexConfig.authInfo[0];


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: typeof window === "undefined" ? "" : window.location.origin
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
    <ConvexProviderWithAuth0
      client={convex}
    >
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
    </Auth0Provider>
  )
}

export default MyApp
