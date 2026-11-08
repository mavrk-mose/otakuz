import { z } from "zod";
export const roomStateSchema = z.object({
  roomId: z.string(), hostId: z.string(), videoUrl: z.string(), isPlaying: z.boolean(),
  position: z.number().finite().nonnegative(), playbackRate: z.number().finite().positive(),
  clients: z.array(z.string()), seq: z.number().int().nonnegative(),
});
export type RoomState = z.infer<typeof roomStateSchema>;
export const roomEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state_update"), payload: roomStateSchema }),
  z.object({ type: z.literal("chat_message") }), z.object({ type: z.literal("host_changed") }),
  z.object({ type: z.literal("client_joined") }), z.object({ type: z.literal("client_left") }), z.object({ type: z.literal("pong") }),
]);
