export interface Message {
    id: string
    userId: string
    username: string
    message: string
    timestamp: number
    type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'anime_share'
    fileUrl?: string
    fileType?: string
}

export interface MessageProps {
    message: {
        id: string
        userId: string
        username: string
        message: string
        timestamp: number
        type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'anime_share'
        fileUrl?: string
        animeData?: {
            title: string
            image: string
            id: string
        }
    }
    currentUserId: string | undefined
    roomId: string
}