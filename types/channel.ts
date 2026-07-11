export interface IptvChannel {
  id: string;
  channelId: string;
  name: string;
  streamUrl: string;
  logoUrl: string | null;
  countryCode: string | null;
  quality: string | null;
  labels: string[];
  categories: string[];
}

export interface IptvChannelsResponse {
  channels: IptvChannel[];
  source: string;
  updatedAt: string;
}
