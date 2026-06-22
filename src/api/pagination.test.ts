import { describe, it, expect } from 'vitest'
import { fetchAllPages, PAGE_SIZE } from './pagination'

interface TestPage {
  data: number[]
  total: number
  offset: number
  limit: number
  /** Extra metadata that should be preserved from the first page only. */
  marker?: string
}

function makePage(start: number, count: number, total: number, marker?: string): TestPage {
  return {
    data: Array.from({ length: count }, (_, i) => start + i),
    total,
    offset: start,
    limit: count,
    marker,
  }
}

describe('fetchAllPages', () => {
  it('returns the first page unchanged when total fits in one page', async () => {
    const result = await fetchAllPages<number, TestPage>(async () =>
      makePage(0, 50, 50, 'first-page-meta'),
    )
    expect(result.data).toEqual(Array.from({ length: 50 }, (_, i) => i))
    expect(result.total).toBe(50)
    expect(result.marker).toBe('first-page-meta')
  })

  it('fetches and concatenates all pages when total exceeds page size', async () => {
    const total = PAGE_SIZE * 3 + 17
    const result = await fetchAllPages<number, TestPage>(async (offset, limit) => {
      const remaining = Math.max(0, total - offset)
      const count = Math.min(limit, remaining)
      return makePage(offset, count, total, offset === 0 ? 'first' : undefined)
    })
    expect(result.data).toHaveLength(total)
    expect(result.data[0]).toBe(0)
    expect(result.data[total - 1]).toBe(total - 1)
    // Metadata from first page is preserved.
    expect(result.marker).toBe('first')
  })

  it('preserves data ordering even when later pages resolve out of order', async () => {
    const total = PAGE_SIZE * 3
    const result = await fetchAllPages<number, TestPage>((offset, limit) => {
      const count = Math.min(limit, total - offset)
      // Make later offsets resolve faster than earlier ones to provoke a
      // race; concatenation must still happen in offset order.
      const delay = offset === PAGE_SIZE ? 30 : offset === PAGE_SIZE * 2 ? 0 : 15
      return new Promise((resolve) =>
        setTimeout(() => resolve(makePage(offset, count, total)), delay),
      )
    })
    expect(result.data).toHaveLength(total)
    // Verify strict ascending order (i.e. correct concatenation order).
    for (let i = 0; i < total; i++) expect(result.data[i]).toBe(i)
  })

  it('caps fetched data at MAX_ITEMS even if server reports a larger total', async () => {
    // Server claims 100k items — client should stop at the safety ceiling.
    const advertisedTotal = 100_000
    let pagesFetched = 0
    const result = await fetchAllPages<number, TestPage>(async (offset, limit) => {
      pagesFetched++
      return makePage(offset, limit, advertisedTotal)
    })
    // 25 pages * 200 = 5000 items max
    expect(result.data.length).toBeLessThanOrEqual(5000)
    expect(pagesFetched).toBeLessThanOrEqual(25)
  })

  it('handles a server that returns fewer items than its advertised total', async () => {
    // Server says 1000 but actually has 350 (e.g. concurrent deletions).
    const advertised = 1000
    const actual = 350
    const result = await fetchAllPages<number, TestPage>(async (offset, limit) => {
      const count = Math.max(0, Math.min(limit, actual - offset))
      return makePage(offset, count, advertised)
    })
    expect(result.data).toHaveLength(actual)
  })
})
