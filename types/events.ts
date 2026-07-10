export type Event = {
  _id: string;
  title: string;
  description?: string;
  summary?: string;
  date?: string; // ISO 8601 date format
  publishedAt?: string;
  location?: {
    address: string;
    coordinates: {
      _type: "geopoint";
      lat: number;
    };
    name: string;
  };
  organizers?: {
    _id: string;
    name: string;
    avatar:  {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  }[];
  category?: string;
  tag?: string;
  section?: string;
  panelClassName?: string;
  textClassName?: string;
  itemClassName?: string;
  isFeatured?: boolean;
  commentsCount?: number;
  imageUrl?: string;
  authorName?: string;
  author?: {
    _id: string;
    name: string;
  };
  tags?: string[];
  attendees?: {
    name: string;
    _key: string;
    userId: string;
    avatar: {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
    status: "going" | "maybe" | "not going"; // Limited status values
  }[];
  createdBy?: {
    _id: string;
    name: string;
  };
  time?: string; // e.g., "04:00 PM"
  thumbnailUrl?: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  tournaments?: {
    _key: string;
    title: string;
    prize: string;
    participants: string;
    time: string;
  }[];
  activities?: {
    title: string;
    description: string;
    time: string;
  }[];
  gallery?: {
    _type: "image";
    _key: string;
    asset: {
      _ref: string;
      _type: "reference";
    };
  }[];
  ticket?: string;
};
