import type { Nullable } from "./common";

export type IptvChannel = {
  id: string;
  channelId: string;
  name: string;
  streamUrl: string;
  logoUrl: Nullable<string>;
  countryCode: Nullable<string>;
  quality: Nullable<string>;
  labels: string[];
  categories: string[];
};

export type IptvChannelsResponse = {
  channels: IptvChannel[];
  source: string;
  updatedAt: string;
};
