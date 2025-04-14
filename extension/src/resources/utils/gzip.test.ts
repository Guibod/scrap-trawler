import { describe, it, expect } from "vitest";
import { GzipUtils } from "~/resources/utils/gzip";
import { gzipSync, gunzipSync } from "fflate";

const text = "Hello, Gzip! This is a test string for compression.";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function streamFromString(input: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(input));
      controller.close();
    },
  });
}

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let result = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += value;
  }

  return result;
}

function mergeUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const mergedArray = new Uint8Array(totalLength);

  let offset = 0;
  for (const chunk of chunks) {
    mergedArray.set(chunk, offset);
    offset += chunk.length;
  }

  return mergedArray;
}

describe("GzipUtils", () => {
  it("should compress a ReadableStream correctly", async () => {
    const inputStream = streamFromString(text);
    const compressedStream = GzipUtils.gzipStream(inputStream);
    const compressedBuffer = await new Response(compressedStream).arrayBuffer();

    expect(compressedBuffer.byteLength).toBeGreaterThan(0);

    const decompressed = decoder.decode(gunzipSync(new Uint8Array(compressedBuffer)));
    expect(decompressed).toBe(text);
  });

  it("should decompress a ReadableStream correctly", async () => {
    const compressedData = gzipSync(encoder.encode(text));
    const inputStream = new ReadableStream({
      start(controller) {
        controller.enqueue(compressedData);
        controller.close();
      }
    });

    const decompressedStream = GzipUtils.gunzipStream(inputStream);
    const result = await streamToString(decompressedStream);

    expect(result).toBe(text);
  });

  it("should compress a WritableStream correctly", async () => {
    const compressedChunks: Uint8Array[] = [];

    const outputStream = new WritableStream({
      write(chunk) {
        compressedChunks.push(chunk);
      },
    });

    const gzipStream = GzipUtils.gzipWritableStream(outputStream);
    const writer = gzipStream.getWriter();
    await writer.write(encoder.encode(text));
    await writer.close();

    expect(compressedChunks.length).toBeGreaterThan(0);

    const decompressed = decoder.decode(gunzipSync(mergeUint8Arrays(compressedChunks)));
    expect(decompressed).toBe(text);
  });

  it("should decompress a WritableStream correctly", async () => {
    const compressedData = gzipSync(encoder.encode(text));

    const decompressedChunks: Uint8Array[] = [];

    const outputStream = new WritableStream({
      write(chunk) {
        decompressedChunks.push(chunk);
      },
    });

    const gunzipStream = GzipUtils.gunzipWritableStream(outputStream);
    const writer = gunzipStream.getWriter();
    await writer.write(compressedData);
    await writer.close();

    const decompressed = decoder.decode(mergeUint8Arrays(decompressedChunks));
    expect(decompressed).toBe(text);
  });

  it("should maintain integrity after compression and decompression using WritableStreams", async () => {
    const compressedChunks: Uint8Array[] = [];

    const compressedOutputStream = new WritableStream({
      write(chunk) {
        compressedChunks.push(chunk);
      },
    });

    const gzipStream = GzipUtils.gzipWritableStream(compressedOutputStream);
    const gzipWriter = gzipStream.getWriter();
    await gzipWriter.write(encoder.encode(text));
    await gzipWriter.close();

    const decompressedChunks: Uint8Array[] = [];

    const decompressedOutputStream = new WritableStream({
      write(chunk) {
        decompressedChunks.push(chunk);
      },
    });

    const gunzipStream = GzipUtils.gunzipWritableStream(decompressedOutputStream);
    const gunzipWriter = gunzipStream.getWriter();
    await gunzipWriter.write(mergeUint8Arrays(compressedChunks));
    await gunzipWriter.close();

    const finalText = decoder.decode(mergeUint8Arrays(decompressedChunks));
    expect(finalText).toBe(text);
  });
});
