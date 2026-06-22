/** Encode a string to Base64 (UTF-8 safe) */
export function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const binary = Array.from(bytes, (b) => String.fromCodePoint(b)).join('')
  return btoa(binary)
}

/** Decode a Base64 string (UTF-8 safe) */
export function fromBase64(base64: string): string {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.codePointAt(0)!)
  return new TextDecoder().decode(bytes)
}

/** Convert Base64 string to ArrayBuffer (for WebAuthn) */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/** Convert ArrayBuffer to Base64 string (for WebAuthn) */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
