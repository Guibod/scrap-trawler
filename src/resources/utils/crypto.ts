export async function hashStringSHA1(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashStringSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert to byte array
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("").substring(0, 16); // Shorten to 16 chars
}
