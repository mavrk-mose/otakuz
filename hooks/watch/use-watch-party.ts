import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface RoomState {
  roomId: string;
  hostId: string;
  videoUrl: string;
  isPlaying: boolean;
  position: number;
  playbackRate: number;
  clients: string[];
  seq: number;
}

interface UseWatchPartyRoomResults {
  state: RoomState | undefined;
  isLoading: boolean;
  wsSend: (msg: any) => void;
  connectionStatus: "connecting" | "open" | "closed";
}

/**
 * Hook manages:
 *   - WebSocket connection
 *   - Live room state syncing
 *   - TanStack query invalidation on events
 */
export function useWatchPartyRoom(roomId: string): UseWatchPartyRoomResults {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<"connecting" | "open" | "closed">("connecting");

  // ---- 1. Load initial room state via HTTP ----
  const { data, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const res = await fetch(`/rooms/${roomId}`);
      if (!res.ok) throw new Error("Failed to load room state");
      return res.json() as Promise<RoomState>;
    },
    staleTime: 0,
  });

  // ---- 2. Send messages through WebSocket ----
  const wsSend = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ---- 3. WebSocket setup and event listeners ----
  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/${roomId}`);
    wsRef.current = ws;
    statusRef.current = "connecting";

    ws.onopen = () => {
      statusRef.current = "open";
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    };

    ws.onclose = () => {
      statusRef.current = "closed";
    };

    ws.onerror = () => {
      statusRef.current = "closed";
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "state_update":
          // Update TanStack cache
          queryClient.setQueryData(["room", roomId], (prev: RoomState | undefined) => {
            if (!prev) return msg.payload;
            // Only update if seq is newer
            if (msg.payload.seq > prev.seq) return msg.payload;
            return prev;
          });
          break;

        case "chat_message":
          queryClient.invalidateQueries({ queryKey: ["room_chat", roomId] });
          break;

        case "host_changed":
          queryClient.invalidateQueries({ queryKey: ["room", roomId] });
          break;

        case "client_joined":
        case "client_left":
          queryClient.invalidateQueries({ queryKey: ["room", roomId] });
          break;

        case "pong":
          // optional latency logic here
          break;

        default:
          console.warn("Unknown WS message:", msg);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, queryClient]);

  return {
    state: data,
    isLoading,
    wsSend,
    connectionStatus: statusRef.current,
  };
}
