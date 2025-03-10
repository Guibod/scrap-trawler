import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react"
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Providers, { RoutedProvider } from "~/resources/ui/providers"

// ✅ Mock HeroUIProvider and ToastProvider
vi.mock("@heroui/react", () => ({
  HeroUIProvider: ({ children }) => <div data-testid="hero-ui">{children}</div>,
  ToastProvider: ({ children, ...props }) => (
    <div data-testid="toast-provider" data-props={JSON.stringify(props)}>{children}</div>
  ),
}));

// ✅ Mock SettingsProvider
vi.mock("~/resources/ui/providers/settings", () => ({
  SettingsProvider: ({ children }) => <div data-testid="settings-provider">{children}</div>,
}));

describe("Providers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Providers correctly", () => {
    render(
      <Providers>
        <p>Test Content</p>
      </Providers>
    );

    // ✅ Ensure content is rendered inside Providers
    expect(screen.getByText("Test Content")).toBeInTheDocument();

    // ✅ Ensure RoutedProvider is inside the Router
    expect(screen.getByTestId("hero-ui")).toBeInTheDocument();
    expect(screen.getByTestId("settings-provider")).toBeInTheDocument();
  });

  it("renders RoutedProvider with correct providers", () => {
    render(
      <MemoryRouter>
        <RoutedProvider>
          <p>Test Routed Content</p>
        </RoutedProvider>
      </MemoryRouter>
    );

    // ✅ Ensure RoutedProvider renders children
    expect(screen.getByText("Test Routed Content")).toBeInTheDocument();

    // ✅ Check ToastProvider props
    const toastProvider = screen.getByTestId("toast-provider");
    const toastProps = JSON.parse(toastProvider.getAttribute("data-props"));

    expect(toastProps.disableAnimation).toBe(true);
    expect(toastProps.placement).toBe("bottom-right");
    expect(toastProps.toastProps).toMatchObject({
      radius: "sm",
      severity: "success",
      variant: "bordered",
      timeout: 5000,
      shouldShowTimeoutProgess: true,
    });
  });
});
