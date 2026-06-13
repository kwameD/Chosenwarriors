import { afterEach, describe, expect, it, vi } from "vitest";
import { loginAdmin, saveEditableContent, saveEditableContentToServer } from "./editableContent";

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

  it("preserves added and deleted events when content is normalized", () => {
    const normalizedContent = saveEditableContent({
      ministryEvents: [
        {
          date: "July 12, 2026",
          description: "A new gathering added from the admin page.",
          image: "/founder-davina-bonsu.jpg",
          link: "https://example.com/join",
          location: "Online",
          slug: "new-gathering",
          time: "7:00 PM EST",
          title: "New Gathering",
        },
      ],
      settings: { featuredEventSlug: "revival-night" },
    });

    expect(normalizedContent.ministryEvents).toHaveLength(1);
    expect(normalizedContent.ministryEvents[0]).toMatchObject({
      slug: "new-gathering",
      title: "New Gathering",
    });
    expect(normalizedContent.settings.featuredEventSlug).toBe("new-gathering");
  });

  it("allows all events to be deleted", () => {
    const normalizedContent = saveEditableContent({
      ministryEvents: [],
      settings: { featuredEventSlug: "revival-night" },
    });

    expect(normalizedContent.ministryEvents).toEqual([]);
    expect(normalizedContent.settings.featuredEventSlug).toBe("");
  });
});
