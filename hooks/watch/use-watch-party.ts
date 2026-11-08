import { useEffect, useRef, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { roomStateSchema, roomEventSchema, type RoomState } from "@/lib/schemas/watch-party";
import { fetchJson, retryApiRequest, apiRetryDelay } from "@/lib/http";

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
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "open" | "closed">("connecting");

  // ---- 1. Load initial room state via HTTP ----
  const { data, isLoading } = useQuery<RoomState>({
    queryKey: ["room", roomId],
    queryFn: ({ signal }) => fetchJson(`/rooms/${roomId}`, roomStateSchema, { signal }),
    enabled: !!roomId, retry: retryApiRequest, retryDelay: apiRetryDelay,
    staleTime: 0,
    // A slow HTTP refresh must not overwrite a newer state received over the socket.
    structuralSharing: (previous, incoming) => {
      const oldState = roomStateSchema.safeParse(previous), newState = roomStateSchema.safeParse(incoming);
      return oldState.success && newState.success && oldState.data.seq > newState.data.seq ? previous : incoming;
    },
  });

  // ---- 2. Send messages through WebSocket ----
  const wsSend = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ---- 3. WebSocket setup and event listeners ----
  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/${roomId}`);
    wsRef.current = ws;
    setConnectionStatus("connecting");

    ws.onopen = () => {
      setConnectionStatus("open");
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    };

    ws.onclose = () => {
      setConnectionStatus("closed");
    };

    ws.onerror = () => {
      setConnectionStatus("closed");
    };

    ws.onmessage = (event) => {
      let payload: unknown;
      try { payload = JSON.parse(event.data); } catch { return; }
      const parsed = roomEventSchema.safeParse(payload);
      if (!parsed.success) return;
      const msg = parsed.data;

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
    connectionStatus,
  };
}
