import type { AppProps } from "next/app";

import { AuthProvider } from "@/context/auth-context";

import "@/styles/globals.css";

export default function EternixApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
