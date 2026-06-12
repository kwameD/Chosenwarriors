import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Newsletter } from "./Newsletter";

describe("Newsletter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the email signup to the subscribe API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ ok: true, delivery: "sent" }),
      ok: true,
    });

    render(<Newsletter />);

    await user.type(screen.getByLabelText("Email address"), "subscriber@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", {
      body: JSON.stringify({ email: "subscriber@example.com" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("signed up");
  });
});
