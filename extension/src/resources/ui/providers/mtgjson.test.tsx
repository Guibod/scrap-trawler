import { vi, expect, describe, it } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { MtgJsonProvider, useMtgJson } from "~/resources/ui/providers/mtgjson";
import React from "react";

vi.mock("~/resources/integrations/mtg-json/service", () => {
  return {
    default: {
      getInstance: vi.fn(() => ({
        count: vi.fn().mockResolvedValue(1000),
        importFromWebsite: vi.fn().mockResolvedValue({ version: "1.2.3", count: 1000 }),
        getRemoteVersion: vi.fn().mockResolvedValue("1.2.3"),
        getLocalVersion: vi.fn().mockResolvedValue("1.2.3"),
        estimateImportSize: vi.fn().mockResolvedValue(500000), // Mock this as well
        onImportStart: vi.fn(),
        onImportProgress: vi.fn(),
        onImportComplete: vi.fn(),
      }))
    }
  };
});

const TestComponent = () => {
  const { importProgress, localVersion, startImport } = useMtgJson();

  return (
    <div>
      <p data-testid="version">Version: {localVersion}</p>
      <p data-testid="progress">Progress: {importProgress}</p>
      <button onClick={startImport}>Start Import</button>
    </div>
  );
};

describe("MtgJsonProvider", () => {
  it("provides initial values and fetches the current version", async () => {
    await act(async () => {
      render(
        <MtgJsonProvider>
          <TestComponent />
        </MtgJsonProvider>
      );
    });
    expect(await screen.findByTestId("version")).toHaveTextContent("Version: 1.2.3");
  });
});