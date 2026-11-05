/** Direct conversations are isolated from the discoverable public room collection. */
export function roomCollection(roomId: string) {
  return roomId.startsWith('dm_') ? 'directChats' : 'chatrooms';
}
