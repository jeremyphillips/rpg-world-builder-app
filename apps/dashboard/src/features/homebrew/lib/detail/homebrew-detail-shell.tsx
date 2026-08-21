import type { ReactNode } from 'react'

import { WidePage } from '@/components/layout/page/wide-page'

export type HomebrewDetailShellProps = {
  nav: ReactNode
  children: ReactNode
}

/**
 * Homebrew hub detail layout — side nav rail plus a narrow main column.
 *
 * Registry guard abstraction (`HomebrewDetailGuard` or similar) belongs here
 * only after a **third** hub detail route repeats the same orchestration:
 * lookup → unknown fallback → disabled-with-nav → ready content. Until then,
 * routes compose this shell with {@link HomebrewDetailMain} and
 * {@link HomebrewDetailFallback}, and keep parsing, registry lookup, canonical
 * IDs, and breadcrumb labels in the route.
 *
 * Do not move `useSetBreadcrumbLabel` into a shared guard — label nesting is a
 * route concern. Do not add policy flags such as `showNavWhenDisabled`; known
 * but disabled entries always render nav via this shell.
 */
export function HomebrewDetailShell({ nav, children }: HomebrewDetailShellProps) {
  return (
    <WidePage spacing="list">
      <div className="flex flex-col gap-6 lg:flex-row">
        {nav}
        <div className="mx-auto min-w-0 w-full max-w-xl flex-1">{children}</div>
      </div>
    </WidePage>
  )
}
