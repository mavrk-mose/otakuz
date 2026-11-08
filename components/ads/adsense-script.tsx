import { ADSENSE_CLIENT_ID } from "@/lib/adsense-config";

export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || ADSENSE_CLIENT_ID;

  if (!clientId || !clientId.startsWith("ca-pub-")) {
    return null;
  }

  return (
    <script
      id="google-adsense-sdk"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId,
      )}`}
      crossOrigin="anonymous"
    />
  );
}
