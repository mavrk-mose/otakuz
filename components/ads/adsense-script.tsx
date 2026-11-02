import Script from "next/script";

export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

  if (!clientId || !clientId.startsWith("ca-pub-")) {
    return null;
  }

  return (
    <Script
      id="google-adsense-sdk"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId
      )}`}
      crossOrigin="anonymous"
    />
  );
}
