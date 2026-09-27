export type {
  NavScrollSpyAnchor,
  NavScrollSpyEntry,
} from '@/lib/in-page-nav/in-page-nav-scroll-spy.lib'
export {
  buildInPageNavObserverRootMargin as buildRulesConfigNavObserverRootMargin,
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
  resolveInPageNavScrollOffsetPx as resolveRulesConfigNavScrollOffsetPx,
  resolveStickyChromeBlockSizePx,
} from '@/lib/in-page-nav/in-page-nav-scroll-spy.lib'
