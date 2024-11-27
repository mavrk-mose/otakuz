export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  thumbnailUrl: string;
  createdBy: {
    id: string;
    name: string;
  };
  attendees: {
    id: string;
    name: string;
    status: 'going' | 'maybe' | 'not_going';
  }[];
  maxAttendees?: number;
  tags: string[];
  category: 'meetup' | 'convention' | 'screening' | 'cosplay' | 'other';
}