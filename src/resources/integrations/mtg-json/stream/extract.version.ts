export class ExtractVersionTransform extends TransformStream<string, string> {
  constructor() {
    super({
      start(controller) {
        this.buffer = ""; // ✅ Buffer to handle split chunks
        this.done = false;
      },
      transform(chunk, controller) {
        if (this.done) return; // ✅ Stop processing once the version is found

        this.buffer += chunk; // Append chunk to buffer

        // ✅ Match `"version": "x.y.z+date"`
        const match = this.buffer.match(/"version"\s*:\s*"([^"]+)"/);
        if (match) {
          controller.enqueue(match[1]); // ✅ Extract only the version
          this.done = true;
          controller.terminate(); // ✅ Stop further processing
        }
      }
    });
  }
}
