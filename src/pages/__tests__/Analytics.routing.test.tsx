import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Analytics from "@/pages/Analytics";

// Stub destination pages so we can assert which route was reached
// without booting up the full hub trees / Supabase queries.
const Stub = ({ label }: { label: string }) => <div>STUB::{label}</div>;

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/analytics/:role" element={<Analytics />} />
          <Route path="/hub/kid" element={<Stub label="kid-hub" />} />
          <Route path="/hub/parent" element={<Stub label="parent-hub" />} />
          <Route path="/hub/teacher" element={<Stub label="teacher-hub" />} />
          <Route
            path="/therapist-analytics"
            element={<Stub label="therapist-analytics" />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("/analytics/:role routing", () => {
  it("shows skeleton while resolving", () => {
    renderAt("/analytics/kid");
    expect(screen.getByText(/loading kid analytics/i)).toBeInTheDocument();
  });

  it.each([
    ["kid", "kid-hub"],
    ["parent", "parent-hub"],
    ["teacher", "teacher-hub"],
    ["therapist", "therapist-analytics"],
  ])("redirects /analytics/%s to the correct analytics page", async (role, label) => {
    renderAt(`/analytics/${role}`);
    await waitFor(
      () => expect(screen.getByText(`STUB::${label}`)).toBeInTheDocument(),
      { timeout: 1500 }
    );
  });

  it("renders fallback for unknown roles", () => {
    renderAt("/analytics/wizard");
    expect(screen.getByText(/unknown analytics role/i)).toBeInTheDocument();
    // Offers links to all valid roles
    expect(screen.getByRole("link", { name: /kid/i })).toHaveAttribute("href", "/hub/kid");
    expect(screen.getByRole("link", { name: /parent/i })).toHaveAttribute("href", "/hub/parent");
    expect(screen.getByRole("link", { name: /teacher/i })).toHaveAttribute("href", "/hub/teacher");
    expect(screen.getByRole("link", { name: /therapist/i })).toHaveAttribute(
      "href",
      "/therapist-analytics"
    );
  });
});
