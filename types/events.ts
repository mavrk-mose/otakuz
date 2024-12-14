export type Event = {
  _id: string;
  description: string;
  date: string; // ISO 8601 date format
  location: {
    address: string;
    coordinates: {
      _type: "geopoint";
      lat: number;
    };
    name: string;
  };
  category: string;
  tags: string[];
  attendees: {
    name: string;
    _key: string;
    userId: string;
    status: "going" | "maybe" | "not going"; // Limited status values
  }[];
  title: string;
  createdBy: {
    _id: string;
    name: string;
  };
  time: string; // e.g., "04:00 PM"
  thumbnailUrl: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  tournaments: {
    _key: string;
    title: string;
    prize: string;
    participants: string;
    time: string;
  }[];
  activities: {
    title: string;
    description: string;
    time: string;
  }[];
  gallery: Array<string | null>;
  ticket: string;
};
