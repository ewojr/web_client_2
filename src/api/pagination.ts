// Page size and safety ceiling for list endpoints. The PD Server caps each
// `limit` at its own configured maximum (currently 1000), but most folders
// are small — fetching in chunks of PAGE_SIZE keeps individual responses
// predictable and lets us parallelize the remainder.
//
// MAX_ITEMS is a client-side ceiling. Past it we stop fetching to keep the
// browser responsive. A 25-page * 200-item ceiling is well above realistic
// folder sizes for a password manager; if it's ever hit, the user should
// be using search instead of browsing.
export const PAGE_SIZE = 200
const MAX_PAGES = 25
const MAX_ITEMS = PAGE_SIZE * MAX_PAGES

export interface PageLike<T> {
  data: T[]
  total: number
  offset: number
  limit: number
  /**
   * Set when the server reported more items than the client ceiling
   * (MAX_ITEMS) allows, so the returned `data` is a truncated prefix. Views
   * can surface a "showing N of M" notice instead of silently hiding items.
   */
  truncated?: boolean
}

/**
 * Fetches every page of a list endpoint and returns a single merged response.
 * The first page is fetched eagerly to learn `total`; remaining pages are
 * fired in parallel. Extra metadata on the response (breadcrumbs, parent,
 * etc.) is preserved from the first page via the spread.
 */
export async function fetchAllPages<T, R extends PageLike<T>>(
  fetchPage: (offset: number, limit: number) => Promise<R>,
): Promise<R> {
  const first = await fetchPage(0, PAGE_SIZE)

  if (first.data.length >= first.total) return first

  const targetTotal = Math.min(first.total, MAX_ITEMS)
  const offsets: number[] = []
  for (let off = PAGE_SIZE; off < targetTotal; off += PAGE_SIZE) {
    offsets.push(off)
  }

  const restPages = await Promise.all(
    offsets.map((off) => fetchPage(off, PAGE_SIZE)),
  )

  const merged: T[] = first.data.slice()
  for (const page of restPages) merged.push(...page.data)

  const data = merged.slice(0, MAX_ITEMS)
  return {
    ...first,
    data,
    offset: 0,
    limit: data.length,
    truncated: first.total > data.length,
  }
}
