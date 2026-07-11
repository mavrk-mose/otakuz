import { NextResponse } from "next/server";

import type { IptvChannel, IptvChannelsResponse } from "@/types/channel";

const ANIMATION_PLAYLIST_URL =
  "https://iptv-org.github.io/iptv/categories/animation.m3u";

function splitExtInf(line: string) {
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      isQuoted = !isQuoted;
    } else if (character === "," && !isQuoted) {
      return {
        metadata: line.slice(0, index),
        title: line.slice(index + 1).trim(),
      };
    }
  }

  return { metadata: line, title: "Unknown channel" };
}

function getAttributes(metadata: string) {
  const attributes: Record<string, string> = {};
  const attributePattern = /([\w-]+)="([^"]*)"/g;

  for (const match of metadata.matchAll(attributePattern)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function getCountryCode(channelId: string) {
  const baseId = channelId.split("@")[0];
  const countryCode = baseId.split(".").at(-1);

  return countryCode && /^[a-z]{2}$/i.test(countryCode)
    ? countryCode.toUpperCase()
    : null;
}

function getDisplayName(title: string) {
  return title
    .replace(/\s*\(\d{3,4}p(?:\d+)?\)/gi, "")
    .replace(/\s*\[[^\]]+\]/g, "")
    .trim();
}

function parsePlaylist(playlist: string) {
  const lines = playlist
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const channels: IptvChannel[] = [];
  let extInf: string | null = null;
  let requiresCustomHeaders = false;

  for (const line of lines) {
    if (line.startsWith("#EXTINF:")) {
      extInf = line;
      requiresCustomHeaders =
        line.includes('http-referrer="') || line.includes('http-user-agent="');
      continue;
    }

    if (line.startsWith("#EXTVLCOPT:")) {
      requiresCustomHeaders = true;
      continue;
    }

    if (!extInf || line.startsWith("#")) {
      continue;
    }

    const streamUrl = line;
    const isBrowserCompatibleHls =
      streamUrl.startsWith("https://") && /\.m3u8(?:[?#].*)?$/i.test(streamUrl);

    if (!requiresCustomHeaders && isBrowserCompatibleHls) {
      const { metadata, title } = splitExtInf(extInf);
      const attributes = getAttributes(metadata);
      const channelId = attributes["tvg-id"] || `animation-${channels.length + 1}`;
      const quality = title.match(/\((\d{3,4}p(?:\d+)?)\)/i)?.[1] ?? null;
      const labels = Array.from(title.matchAll(/\[([^\]]+)\]/g), (match) => match[1]);
      const categories = (attributes["group-title"] || "Animation")
        .split(";")
        .map((category) => category.trim())
        .filter(Boolean);

      channels.push({
        id: `${channelId}-${channels.length}`,
        channelId,
        name: getDisplayName(title),
        streamUrl,
        logoUrl: attributes["tvg-logo"] || null,
        countryCode: getCountryCode(channelId),
        quality,
        labels,
        categories,
      });
    }

    extInf = null;
    requiresCustomHeaders = false;
  }

  return channels;
}

export async function GET() {
  try {
    const response = await fetch(ANIMATION_PLAYLIST_URL, {
      next: { revalidate: 60 * 60 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`IPTV-org returned ${response.status}`);
    }

    const channels = parsePlaylist(await response.text());

    if (channels.length === 0) {
      throw new Error("The Animation playlist did not contain playable HLS streams");
    }

    const payload: IptvChannelsResponse = {
      channels,
      source: ANIMATION_PLAYLIST_URL,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Unable to load IPTV-org Animation channels", error);

    return NextResponse.json(
      { error: "Animation channels are temporarily unavailable." },
      { status: 502 }
    );
  }
}
