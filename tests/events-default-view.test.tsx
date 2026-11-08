import "./dom";
import React from "react";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { I18nProvider } from "@/components/i18n-provider";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import EventsPage from "@/app/events/page";
import { client } from "@/lib/sanity";
const originalFetch = client.fetch;
afterEach(() => {
  cleanup();
  client.fetch = originalFetch;
});
function Wrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
  );
  const Adapter = React.useMemo(() => withNuqsTestingAdapter({ hasMemory: true }), []);
  return (
    <Adapter>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ImageConfigContext.Provider value={{ ...imageConfigDefault, unoptimized: true }}>
            {children}
          </ImageConfigContext.Provider>
        </I18nProvider>
      </QueryClientProvider>
    </Adapter>
  );
}
test("default event view retains historical records, while Upcoming explicitly explains an empty result", async () => {
  client.fetch = (async (_query: string, params: { period?: string }) => ({
    items:
      params.period === "upcoming"
        ? []
        : [
            {
              _id: "old-event",
              title: "Archived Anime Event",
              date: "2024-11-02",
              attendees: [],
              attendeeCount: 0,
              _sort: "2024-11-02",
            },
          ],
    total: params.period === "upcoming" ? 0 : 1,
  })) as typeof client.fetch;
  render(<EventsPage />, { wrapper: Wrapper });
  assert(await screen.findByText("Archived Anime Event"));
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Upcoming" }), { button: 0, ctrlKey: false });
  assert(await screen.findByText("No upcoming events scheduled"));
  assert(screen.getByRole("button", { name: "Show all events" }));
  fireEvent.click(screen.getByRole("button", { name: "Show all events" }));
  assert(await screen.findByText("Archived Anime Event"));
});

test("event request failures show a retryable error rather than an empty list", async () => {
  client.fetch = (async () => {
    throw new Error("Sanity unavailable");
  }) as typeof client.fetch;
  render(<EventsPage />, { wrapper: Wrapper });
  assert(await screen.findByRole("alert"));
  assert(screen.getByRole("button", { name: "Try again" }));
  assert.equal(screen.queryByText("No events in this view yet"), null);
});
