import pako from "pako";

export class GzipUtils {
  /**
   * Creates a TransformStream that compresses incoming data into GZIP format.
   */
  static createGzipStream(): TransformStream {
    return new TransformStream({
      transform(chunk, controller) {
        const compressed = pako.deflate(chunk, { gzip: true });
        controller.enqueue(new Uint8Array(compressed));
      }
    });
  }

  /**
   * Creates a TransformStream that decompresses incoming GZIP data.
   */
  static createGunzipStream(): TransformStream {
    return new TransformStream({
      transform(chunk, controller) {
        const decompressed = pako.inflate(chunk);
        controller.enqueue(new Uint8Array(decompressed));
      }
    });
  }

  /**
   * Takes a ReadableStream and returns a GZIP-compressed ReadableStream.
   */
  static gzipStream(inputStream: ReadableStream): ReadableStream {
    return inputStream.pipeThrough(GzipUtils.createGzipStream());
  }

  /**
   * Takes a ReadableStream and returns a decompressed ReadableStream.
   */
  static gunzipStream(inputStream: ReadableStream): ReadableStream {
    return inputStream.pipeThrough(GzipUtils.createGunzipStream());
  }

  /**
   * Takes a WritableStream and returns a compressed WritableStream.
   */
  static gzipWritableStream(targetStream: WritableStream): WritableStream {
    const gzip = new pako.Deflate({ gzip: true });
    const writer = targetStream.getWriter();

    return new WritableStream({
      async write(chunk) {
        gzip.push(chunk, false); // ✅ Compress chunk
        if (gzip.result) {
          await writer.write(new Uint8Array(gzip.result));
        }
      },
      async close() {
        gzip.push(new Uint8Array(0), true); // ✅ Finalize compression
        if (gzip.result) {
          await writer.write(new Uint8Array(gzip.result));
        }
        await writer.close();
      }
    });
  }

  /**
   * Takes a WritableStream and returns a decompressed WritableStream.
   */
  static gunzipWritableStream(targetStream: WritableStream): WritableStream {
    const inflate = new pako.Inflate();
    const writer = targetStream.getWriter();

    return new WritableStream({
      async write(chunk) {
        inflate.push(chunk, false); // ✅ Process chunk normally
        if (inflate.result) {
          await writer.write(new Uint8Array(inflate.result));
          inflate.result = null; // ✅ Clear result to prevent duplicates
        }
      },
      async close() {
        inflate.push(new Uint8Array(0), true); // ✅ Finalize decompression
        if (inflate.result) {
          await writer.write(new Uint8Array(inflate.result));
        }
        await writer.close();
      }
    });
  }
}
