export interface Message {
    id: string
    userId: string
    username: string
    message: string
    timestamp: number
    type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'anime_share'
    fileUrl?: string
    fileType?: string
    deliveryStatus?: 'sending' | 'sent' | 'error'
    editedAt?: number
    animeData?: {
        title: string
        image: string
        id: string | number
    }
}

export interface MessageProps {
    message: Message
    currentUserId: string | undefined
    onEdit: (messageId: string, content: string) => Promise<void>
    onDelete: (messageId: string) => Promise<void>
}
