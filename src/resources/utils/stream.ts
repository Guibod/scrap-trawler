import { createReadStream } from "fs"

/**
 * @deprecated use streamToIterable from 'json-stream-es' instead
 */
export async function* toAsyncIterable(stream: ReadableStream<any>) {
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}

export function createFileStream(path: string): ReadableStream<Uint8Array> {
  const nodeStream = createReadStream(path);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of nodeStream) {
        controller.enqueue(new Uint8Array(chunk));
      }
      controller.close();
    }
  });
}
