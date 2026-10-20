import type { SanityCardDisplay, SanityImage } from "./common";

export type EventLocation = {
  address: string;
  coordinates: {
    _type: "geopoint";
    lat: number;
  };
  name: string;
};

export type EventPerson = {
  _id: string;
  name: string;
  avatar?: SanityImage;
};

export type EventAttendeeStatus = "going" | "maybe" | "not going";

export type EventAttendee = {
  name: string;
  _key: string;
  userId: string;
  avatar: SanityImage;
  status: EventAttendeeStatus;
};

export type EventTournament = {
  _key: string;
  title: string;
  prize: string;
  participants: string;
  time: string;
};

export type EventActivity = {
  title: string;
  description: string;
  time: string;
};

export type Event = SanityCardDisplay & {
  _id: string;
  title: string;
  description?: string;
  summary?: string;
  date?: string; // ISO 8601 date format
  publishedAt?: string;
  location?: EventLocation;
  organizers?: EventPerson[];
  category?: string;
  tag?: string;
  commentsCount?: number;
  imageUrl?: string;
  authorName?: string;
  author?: EventPerson;
  tags?: string[];
  attendees?: EventAttendee[];
  createdBy?: EventPerson;
  time?: string; // e.g., "04:00 PM"
  thumbnailUrl?: SanityImage;
  tournaments?: EventTournament[];
  activities?: EventActivity[];
  gallery?: SanityImage[];
  ticket?: string;
};
