import { describe, it, expect } from 'vitest'
import { getSafeHref } from './url'

describe('getSafeHref', () => {
  describe('rejects dangerous schemes', () => {
    it.each([
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'JaVaScRiPt:alert(document.cookie)',
      '  javascript:alert(1)  ',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'about:blank',
      'blob:https://evil.com/uuid',
      'mailto:victim@example.com',
      'tel:+1234567890',
    ])('%s → null', (input) => {
      expect(getSafeHref(input)).toBeNull()
    })
  })

  describe('accepts safe schemes', () => {
    it('passes through https URLs', () => {
      expect(getSafeHref('https://example.com')).toBe('https://example.com/')
    })
    it('passes through http URLs', () => {
      expect(getSafeHref('http://example.com')).toBe('http://example.com/')
    })
    it('passes through ftp URLs', () => {
      expect(getSafeHref('ftp://files.example.com/path')).toBe('ftp://files.example.com/path')
    })
    it('passes through ftps URLs', () => {
      expect(getSafeHref('ftps://files.example.com/path')).toBe('ftps://files.example.com/path')
    })
    it('preserves path / query / hash', () => {
      expect(getSafeHref('https://example.com/a/b?q=1#x')).toBe('https://example.com/a/b?q=1#x')
    })
  })

  describe('scheme-less input is treated as https', () => {
    it('upgrades example.com to https://example.com/', () => {
      expect(getSafeHref('example.com')).toBe('https://example.com/')
    })
    it('upgrades example.com/path?q=1 to https', () => {
      expect(getSafeHref('example.com/path?q=1')).toBe('https://example.com/path?q=1')
    })
    it('does not upgrade a string starting with a colon-bearing token', () => {
      // "javascript:alert(1)" matches the scheme regex and is rejected — not silently upgraded.
      expect(getSafeHref('javascript:alert(1)')).toBeNull()
    })
  })

  describe('scheme-less host:port input is treated as https', () => {
    it.each([
      ['intranet:8714', 'https://intranet:8714/'],
      ['localhost:3000/admin', 'https://localhost:3000/admin'],
      ['example.com:8080/path', 'https://example.com:8080/path'],
      ['192.168.1.1:8080', 'https://192.168.1.1:8080/'],
    ])('%s → %s', (input, expected) => {
      expect(getSafeHref(input)).toBe(expected)
    })
    it('still rejects dangerous pseudo-schemes that carry a colon', () => {
      // These have a colon but are not host:port, so they are not upgraded and
      // remain rejected by the protocol allow-list.
      expect(getSafeHref('javascript:alert(1)')).toBeNull()
      expect(getSafeHref('data:text/html,<script>alert(1)</script>')).toBeNull()
    })
  })

  describe('null / empty input', () => {
    it.each([null, undefined, '', '   '])('%s → null', (input) => {
      expect(getSafeHref(input)).toBeNull()
    })
  })

  describe('malformed input', () => {
    it('returns null for unparseable input', () => {
      // "https://" alone is not a valid URL — URL constructor throws.
      // The bare string would be upgraded to "https://https://" which is also invalid.
      expect(getSafeHref('https://')).toBeNull()
    })
  })
})
