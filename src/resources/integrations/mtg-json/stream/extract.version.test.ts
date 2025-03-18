import { describe, expect, it } from "vitest";
import { ExtractVersionTransform } from "~/resources/integrations/mtg-json/stream/extract.version"

async function testTransform(input: string): Promise<string | null> {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input)); // Encode string as Uint8Array
      controller.close();
    }
  });

  const transformedStream = readable
    .pipeThrough(new TextDecoderStream()) // Convert Uint8Array to text
    .pipeThrough(new ExtractVersionTransform());

  const reader = transformedStream.getReader();
  const { value, done } = await reader.read();

  return done ? null : value;
}

describe("ExtractVersionTransform", () => {
  it("should extract the correct version string", async () => {
    const input = `{"meta": {"date": "2025-03-17", "version": "5.2.2+20250317"}, "data": {}}`;
    const result = await testTransform(input);
    expect(result).toBe("5.2.2+20250317");
  });

  it("should return null if no version is found", async () => {
    const input = `{"meta": {"date": "2025-03-17"}, "data": {}}`;
    const result = await testTransform(input);
    expect(result).toBeNull();
  });

  it("should handle extra spaces and newlines", async () => {
    const input = `{
      "meta": {
        "date": "2025-03-17",
        "version": "1.0.0-beta"
      },
      "data": {}
    }`;
    const result = await testTransform(input);
    expect(result).toBe("1.0.0-beta");
  });

  it("should terminate the stream after finding version", async () => {
    const input = `{"meta": {"version": "3.5.7"}, "data": {"someData": "value"}}`;
    const result = await testTransform(input);
    expect(result).toBe("3.5.7");
  });

  it("should handle missing meta field gracefully", async () => {
    const input = `{"data": {"someData": "value"}}`;
    const result = await testTransform(input);
    expect(result).toBeNull();
  });
});
