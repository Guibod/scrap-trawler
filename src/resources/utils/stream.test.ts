import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import { createFileStream, toAsyncIterable } from './stream';

/** ✅ Properly Mock FS ReadStream */
vi.mock('fs', async () => {
  const actualFs = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actualFs,
    createReadStream: vi.fn(() => {
      const { PassThrough } = require('stream');
      const mockStream = new PassThrough();
      process.nextTick(() => {
        mockStream.write(Buffer.from('chunk1'));
        mockStream.write(Buffer.from('chunk2'));
        mockStream.end();
      });
      return mockStream;
    })
  };
});

describe('Stream Utilities', () => {
  it('should convert ReadableStream to async iterable', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(Buffer.from('test')));
        controller.close();
      }
    });

    const chunks = [];
    for await (const chunk of toAsyncIterable(mockStream)) {
      chunks.push(Buffer.from(chunk).toString());
    }

    expect(chunks).toEqual(['test']);
  });

  it('should create a Web ReadableStream from a file path', async () => {
    const filePath = path.resolve(__dirname, '../../resources/integrations/mtg-json/data/AtomicCards_subset.json.gz');
    const webStream = createFileStream(filePath);

    expect(webStream).toBeInstanceOf(ReadableStream);

    const chunks = [];
    for await (const chunk of toAsyncIterable(webStream)) {
      chunks.push(Buffer.from(chunk).toString());
    }

    expect(chunks.length).toBeGreaterThan(0); // Ensures it reads something
  });
});