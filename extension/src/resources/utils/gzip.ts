import { Gunzip, gunzipSync, Gzip, gzipSync } from "fflate"

export class GzipUtils {
  /**
   * Creates a TransformStream that compresses incoming data into GZIP format.
   */
  static createGzipStream(): TransformStream {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(gzipSync(chunk));
      }
    });
  }

  /**
   * Creates a TransformStream that decompresses incoming GZIP data.
   */
  static createGunzipStream(): TransformStream {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(gunzipSync(chunk));
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
    const writer = targetStream.getWriter();
    const gzip = new Gzip();

    gzip.ondata = async (chunk, final) => {
      await writer.write(chunk);
      if (final) await writer.close();
    };

    return new WritableStream({
      async write(chunk) {
        gzip.push(chunk, false); // 🔥 Push chunk into Gzip stream
      },
      async close() {
        gzip.push(new Uint8Array(0), true); // 🔥 Finalize stream
      }
    });
  }

  /**
   * Takes a WritableStream and returns a decompressed WritableStream.
   */
  static gunzipWritableStream(targetStream: WritableStream): WritableStream {
    const writer = targetStream.getWriter();
    const gunzip = new Gunzip();

    gunzip.ondata = async (chunk, final) => {
      await writer.write(chunk);
      if (final) await writer.close();
    };

    return new WritableStream({
      async write(chunk) {
        gunzip.push(chunk, false);
      },
      async close() {
        gunzip.push(new Uint8Array(0), true);
      }
    });
  }

}
