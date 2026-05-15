import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Mock heavy AdminHub deps so we can mount it in isolation.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    }),
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
  },
}));

vi.mock("@/components/HubNavigation", () => ({
  HubNavigation: () => <nav data-testid="hub-nav" />,
}));

vi.mock("@/components/PageBackground", () => ({
  default: () => <div data-testid="page-bg" />,
}));

import AdminHub from "@/pages/AdminHub";

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
};

const Home = () => (
  <div>
    <h1>Home page</h1>
    <LocationProbe />
  </div>
);

const renderAt = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dev" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={
            <>
              <AdminHub />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("Admin routing", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("/dev redirects to /admin", async () => {
    renderAt("/dev");
    await waitFor(() => {
      expect(screen.getByTestId("pathname").textContent).toBe("/admin");
    });
  });

  it("AdminHub Back button navigates to /", async () => {
    renderAt("/admin");

    const backBtn = await screen.findByRole("button", { name: /back/i });
    fireEvent.click(backBtn);

    await waitFor(() => {
      expect(screen.getByText("Home page")).toBeInTheDocument();
      expect(screen.getByTestId("pathname").textContent).toBe("/");
    });
  });

  it("Back button still returns to / when entering /admin via the /dev redirect", async () => {
    renderAt("/dev");

    const backBtn = await screen.findByRole("button", { name: /back/i });
    fireEvent.click(backBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pathname").textContent).toBe("/");
    });
  });
});
