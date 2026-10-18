import { test } from "node:test";
import { strict as assert } from "node:assert";
import { changedMatchingText } from "../src/services/matching.js";
import { parsePage } from "../src/services/scrape.js";
import { searchConfigured } from "../src/services/search-config.js";
import { acceptedPushTickets } from "../src/services/notify.js";

test("detects a new edital even when the course keyword already existed", () => {
  const before = "Desenvolvimento web: edital 2026 encerrado";
  const after = before + "\nDesenvolvimento web: inscrições abertas para 2027";
  assert.equal(
    changedMatchingText(after, before, ["desenvolvimento web"]),
    "Desenvolvimento web: inscrições abertas para 2027",
  );
});

test("ignores unrelated block edits and case/accent-only changes", () => {
  assert.equal(
    changedMatchingText(
      "Pós-graduação web\nContato novo",
      "POS-GRADUACAO WEB\nContato antigo",
      ["web"],
    ),
    "",
  );
});

test("HTML extraction preserves edital blocks and removes navigation", () => {
  const page = parsePage(
    "<html><head><title>Editais</title></head><body><nav>web menu</nav><main><p>Desenvolvimento web 2026</p><p>Desenvolvimento web 2027</p></main></body></html>",
    "https://example.com",
  );
  assert.equal(page.text, "Desenvolvimento web 2026\nDesenvolvimento web 2027");
});

test("a CAPTCHA page is a collection error, never an edital baseline", () => {
  assert.throws(
    () =>
      parsePage(
        "<html><title>Radware Captcha Page</title><body>Check</body></html>",
        "https://example.com",
      ),
    /CAPTCHA/,
  );
});

test("search is available only with the credentials required by its provider", () => {
  assert.equal(searchConfigured({ SEARCH_PROVIDER: "brave" }), false);
  assert.equal(
    searchConfigured({
      SEARCH_PROVIDER: "brave",
      BRAVE_SEARCH_API_KEY: "test-only",
    }),
    true,
  );
  assert.equal(
    searchConfigured({
      SEARCH_PROVIDER: "google",
      GOOGLE_SEARCH_API_KEY: "test-only",
    }),
    false,
  );
  assert.equal(
    searchConfigured({
      SEARCH_PROVIDER: "google",
      GOOGLE_SEARCH_API_KEY: "test-only",
      GOOGLE_SEARCH_ENGINE_ID: "test-only",
    }),
    true,
  );
  assert.equal(searchConfigured({ SEARCH_PROVIDER: "unknown" }), false);
});

test("push requires every delivery ticket, not just a successful HTTP response", () => {
  assert.equal(acceptedPushTickets({}, 1), false);
  assert.equal(acceptedPushTickets({ data: [] }, 1), false);
  assert.equal(acceptedPushTickets({ data: [{ status: "ok" }] }, 1), false);
  assert.equal(
    acceptedPushTickets(
      { data: [{ status: "error", message: "invalid token" }] },
      1,
    ),
    false,
  );
  assert.equal(
    acceptedPushTickets({ data: [{ status: "ok", id: "ticket-test" }] }, 1),
    true,
  );
  assert.equal(
    acceptedPushTickets({ data: [{ status: "ok", id: "ticket-test" }] }, 2),
    false,
  );
});
