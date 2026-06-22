// Shared keyboard handlers for the WAI-ARIA tree pattern.
// https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
//
// All treeitems live inside a single role="tree" container. Navigation is
// done by walking the rendered DOM rather than threading focus state through
// React, because (a) only visible items are rendered (collapsed nodes have
// no children in the tree), and (b) this keeps each TreeNode self-contained.

const TREE_SELECTOR = '[role="tree"]'
const TREEITEM_SELECTOR = '[role="treeitem"]'

export function getVisibleTreeItems(from: HTMLElement): HTMLElement[] {
  const tree = from.closest(TREE_SELECTOR)
  if (!tree) return []
  return Array.from(tree.querySelectorAll<HTMLElement>(TREEITEM_SELECTOR))
}

export function focusItem(el: HTMLElement | undefined | null): void {
  el?.focus()
}

/** Navigate to the previous item with smaller aria-level (the parent). */
export function findParent(items: HTMLElement[], idx: number): HTMLElement | null {
  const current = items[idx]
  if (!current) return null
  const level = Number(current.getAttribute('aria-level') ?? '1')
  for (let i = idx - 1; i >= 0; i--) {
    const lv = Number(items[i].getAttribute('aria-level') ?? '0')
    if (lv < level) return items[i]
  }
  return null
}
