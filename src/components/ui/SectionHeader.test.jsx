import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders the title, eyebrow, and subtitle when provided", () => {
    render(<SectionHeader eyebrow="Connection" title="A clear section" subtitle="Helpful supporting copy." />);

    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A clear section", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Helpful supporting copy.")).toBeInTheDocument();
  });

  it("renders only the title when optional content is omitted", () => {
    render(<SectionHeader title="Title only" />);

    expect(screen.getByRole("heading", { name: "Title only", level: 2 })).toBeInTheDocument();
    expect(screen.queryByText("Connection")).not.toBeInTheDocument();
  });
});

