export interface Room {
    id: string
    title: string
    createdBy?: string
    memberCount?: number
    members?: string[]
}

export interface RoomDetails {
    title: string
    createdBy?: string
    memberCount: number
    members: string[]
}
