export type Room = {
  id: string;
  title: string;
  createdBy?: string;
  memberCount?: number;
  members?: string[];
};

export type RoomDetails = {
  title: string;
  createdBy?: string;
  memberCount: number;
  members: string[];
};
