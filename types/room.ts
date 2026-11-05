export type Room = {
  id: string;
  title: string;
  photoURL?: string;
  participantIds?: string[];
  createdBy?: string;
  memberCount?: number;
  members?: string[];
};

export type RoomDetails = {
  title: string;
  photoURL?: string;
  participantIds?: string[];
  createdBy?: string;
  memberCount: number;
  members: string[];
};
