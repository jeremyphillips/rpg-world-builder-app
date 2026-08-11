import type { ReactNode } from 'react'

export type EntityItemTrailing =
  | { kind: 'action'; content: ReactNode }
  | { kind: 'indicator'; content: ReactNode }
  | { kind: 'group'; primary: ReactNode; secondary?: ReactNode }
