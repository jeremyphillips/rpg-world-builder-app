import type { ReactNode } from 'react'

export type HomebrewDetailMainProps = {
  children: ReactNode
}

/** Vertical rhythm stack for hub detail main-column content beneath {@link PageHeader}. */
export function HomebrewDetailMain({ children }: HomebrewDetailMainProps) {
  return <div className="flex flex-col gap-3">{children}</div>
}
