import { afterEach, describe, expect, it, vi } from "vitest";
import { loginAdmin, saveEditableContentToServer } from "./editableContent";

describe("editableContent admin persistence", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sends the admin token when saving content", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        json: async () => ({ ok: true, adminToken: "signed-token" }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true, content: { settings: { featuredEventSlug: "revival-night" } } }),
        ok: true,
      });

    await loginAdmin("admin-password");
    await saveEditableContentToServer({ settings: { featuredEventSlug: "revival-night" } });

    const [, saveOptions] = fetchMock.mock.calls[1];
    const savedBody = JSON.parse(saveOptions.body);

    expect(fetchMock).toHaveBeenLastCalledWith("/api/content", {
      body: saveOptions.body,
      credentials: "include",
      headers: expect.objectContaining({
        Authorization: "Bearer signed-token",
        "Content-Type": "application/json",
      }),
      method: "PUT",
    });
    expect(savedBody.content.settings.featuredEventSlug).toBe("revival-night");
  });
});
