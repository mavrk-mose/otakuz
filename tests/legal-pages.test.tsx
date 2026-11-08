import "./dom";
import React from "react";
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { I18nProvider, useI18n } from "@/components/i18n-provider";
import { LegalDocument } from "@/components/legal/legal-document";
import { LegalLinks } from "@/components/legal/legal-links";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
function LanguageToggle() {
  const { toggleLocale } = useI18n();
  return <button onClick={toggleLocale}>Change language</button>;
}
test("privacy page discloses actual services and marks the sample address as non-working", () => {
  const { container } = render(
    <I18nProvider>
      <LegalDocument kind="privacy" />
      <LegalLinks />
    </I18nProvider>,
  );
  assert(screen.getByRole("heading", { level: 1, name: "Privacy Policy" }));
  assert.match(screen.getByRole("note").textContent || "", /illustrative address/);
  assert.equal(container.querySelector('a[href^="mailto:"]'), null);
  for (const provider of [
    "Firebase",
    "Sanity",
    "PostHog",
    "Vercel",
    "WhatsApp",
    "YouTube",
    "AdSense",
  ])
    assert.match(container.textContent || "", new RegExp(provider));
  for (const link of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    assert(container.querySelector(link.getAttribute("href")!));
  assert(container.querySelector('a[href="/terms"]'));
  assert(container.querySelector('a[href="/privacy"]'));
});
test("terms page and section navigation switch to Japanese", () => {
  render(
    <I18nProvider>
      <LanguageToggle />
      <LegalDocument kind="terms" />
    </I18nProvider>,
  );
  assert(screen.getByRole("heading", { level: 1, name: "Terms of Use" }));
  fireEvent.click(screen.getByRole("button", { name: "Change language" }));
  assert(screen.getByRole("heading", { level: 1, name: "利用規約" }));
  assert(screen.getByRole("navigation", { name: "このページの内容" }));
  assert.match(screen.getByRole("note").textContent || "", /実際の受信箱ではなく/);
});
