import "./dom";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import {
  render,
  renderHook,
  screen,
  waitFor,
  act,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withNuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useGenreFilter } from "@/hooks/use-genre-filter";
import { characterAvatarOptions } from "@/hooks/use-character-avatars";
import { I18nProvider, useI18n } from "@/components/i18n-provider";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { useGlobalSearchStore } from "@/store/use-global-search-store";
import { ProfileSettingsModal } from "@/components/profile/profile-settings-modal";
import type { UserProfileData } from "@/types/user";

const originalFetch = globalThis.fetch;
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  localStorage.clear();
});
const router = {
  push() {},
  replace() {},
  refresh() {},
  back() {},
  forward() {},
  prefetch: async () => {},
};
function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRouterContext.Provider value={router}>
        <QueryClientProvider client={client}>
          <I18nProvider>{children}</I18nProvider>
        </QueryClientProvider>
      </AppRouterContext.Provider>
    );
  };
}
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

test("category filter updates nuqs history, preserves unrelated filters, and clears pagination", async () => {
  let event: UrlUpdateEvent | undefined;
  const { result } = renderHook(() => useGenreFilter(), {
    wrapper: withNuqsTestingAdapter({
      searchParams: "?genre=4&page=3&sort=score",
      hasMemory: true,
      onUrlUpdate: (value) => {
        event = value;
      },
    }),
  });
  assert.equal(result.current.genre, "4");
  await act(async () => {
    await result.current.setGenre("46");
  });
  assert.equal(result.current.genre, "46");
  assert.equal(event?.searchParams.get("sort"), "score");
  assert.equal(event?.searchParams.has("page"), false);
  assert.equal(event?.options.history, "push");
  await act(async () => {
    await result.current.setGenre(undefined);
  });
  assert.equal(result.current.genre, undefined);
});
test("avatar queries reuse cached results across modal openings", async () => {
  let calls = 0;
  const queryClient = client();
  globalThis.fetch = async () => {
    calls++;
    return Response.json({
      data: [{ name: "Hero", images: { webp: { image_url: "https://example.com/hero.webp" } } }],
    });
  };
  const first = await queryClient.fetchQuery(characterAvatarOptions),
    second = await queryClient.fetchQuery(characterAvatarOptions);
  assert.deepEqual(first, second);
  assert.equal(calls, 1);
  queryClient.clear();
});
test("language switching keeps existing translation callers and persists preference", async () => {
  function Probe() {
    const { t, toggleLocale } = useI18n();
    return <button onClick={toggleLocale}>{t("common.loading")}</button>;
  }
  render(
    <I18nProvider>
      <Probe />
    </I18nProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Loading..." }));
  assert(screen.getByRole("button", { name: "読み込み中..." }));
  assert.equal(document.documentElement.lang, "ja");
  assert.equal(localStorage.getItem("otakuz-locale"), "ja");
});
test("cmdk navigates recent searches with arrows and selects with Enter", async () => {
  const queryClient = client();
  useGlobalSearchStore.setState({
    isOpen: true,
    query: "",
    enabledCategories: [],
    recentSearches: ["Naruto", "Bleach"],
  });
  render(<GlobalSearchModal />, { wrapper: wrapper(queryClient) });
  const input = screen.getByRole("combobox");
  await waitFor(() => assert.equal(document.activeElement, input));
  fireEvent.keyDown(input, { key: "ArrowDown" });
  await waitFor(() =>
    assert.equal(
      screen.getByRole("option", { name: /Bleach/ }).getAttribute("aria-selected"),
      "true",
    ),
  );
  fireEvent.keyDown(input, { key: "Enter" });
  assert.equal(useGlobalSearchStore.getState().query, "Bleach");
  useGlobalSearchStore.setState({ isOpen: false });
  queryClient.clear();
});
test("profile form blocks invalid edits, then saves validated fields", async () => {
  const queryClient = client();
  globalThis.fetch = async () => Response.json({ data: [] });
  const saves: Partial<UserProfileData>[] = [];
  render(
    <ProfileSettingsModal
      isOpen
      onClose={() => {}}
      profile={null}
      onSaveProfile={async (updates) => {
        saves.push(updates);
      }}
      onResetGoogleAvatar={async () => {}}
    />,
    { wrapper: wrapper(queryClient) },
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Display Name"), "New Name");
  await user.type(screen.getByLabelText("Handle / Username"), "bad handle");
  await user.type(screen.getByPlaceholderText("Custom image URL (https://...)"), "not-a-url");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  assert.equal(saves.length, 0);
  assert(screen.getByRole("alert"));
  await user.clear(screen.getByPlaceholderText("Custom image URL (https://...)"));
  await user.clear(screen.getByLabelText("Handle / Username"));
  await user.type(screen.getByLabelText("Handle / Username"), "new_name");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() => assert.equal(saves.at(-1)?.username, "@new_name"));
  assert.equal(saves.at(-1)?.displayName, "New Name");
  queryClient.clear();
});

test("watch-party connection changes rerender and malformed events leave cached state intact", async () => {
  const { useWatchPartyRoom } = await import("@/hooks/watch/use-watch-party");
  const queryClient = client(),
    originalWebSocket = globalThis.WebSocket;
  const initial = {
    roomId: "room",
    hostId: "host",
    videoUrl: "video",
    isPlaying: false,
    position: 0,
    playbackRate: 1,
    clients: [],
    seq: 1,
  };
  globalThis.fetch = async () => Response.json(initial);
  class Socket {
    static OPEN = 1;
    static instance: Socket;
    readyState = 1;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    constructor() {
      Socket.instance = this;
    }
    send() {}
    close() {}
  }
  globalThis.WebSocket = Socket as unknown as typeof WebSocket;
  try {
    const { result, unmount } = renderHook(() => useWatchPartyRoom("room"), {
      wrapper: wrapper(queryClient),
    });
    await waitFor(() => assert.equal(result.current.state?.seq, 1));
    act(() => Socket.instance.onopen?.());
    assert.equal(result.current.connectionStatus, "open");
    act(() => Socket.instance.onmessage?.({ data: "invalid json" }));
    assert.equal(result.current.state?.seq, 1);
    act(() =>
      Socket.instance.onmessage?.({
        data: JSON.stringify({ type: "state_update", payload: { seq: 2 } }),
      }),
    );
    assert.equal(result.current.state?.seq, 1);
    act(() =>
      Socket.instance.onmessage?.({
        data: JSON.stringify({
          type: "state_update",
          payload: { ...initial, seq: 2, position: 10 },
        }),
      }),
    );
    await waitFor(() => assert.equal(result.current.state?.position, 10));
    act(() => Socket.instance.onclose?.());
    assert.equal(result.current.connectionStatus, "closed");
    unmount();
  } finally {
    globalThis.WebSocket = originalWebSocket;
    queryClient.clear();
  }
});

test("command-menu modified Enter retains opening a result in a new tab", async () => {
  const queryClient = client(),
    originalOpen = window.open;
  const opened: string[] = [];
  window.open = (url) => {
    opened.push(String(url));
    return null;
  };
  useGlobalSearchStore.setState({
    isOpen: true,
    query: "",
    enabledCategories: [],
    recentSearches: [],
  });
  try {
    render(<GlobalSearchModal />, { wrapper: wrapper(queryClient) });
    const input = screen.getByRole("combobox");
    await waitFor(() =>
      assert(
        screen
          .getByRole("option", { name: /Browse All Community Profiles/ })
          .getAttribute("aria-selected") === "true",
      ),
    );
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    assert.deepEqual(opened, ["/community"]);
  } finally {
    window.open = originalOpen;
    useGlobalSearchStore.setState({ isOpen: false });
    queryClient.clear();
  }
});
