import { createContext } from 'react'

export type ContentFormWriteGateScope = 'strict' | 'draft'

type Block = { scope: ContentFormWriteGateScope; reason: string }

export type ContentFormWriteGateValue = {
  report: (scope: ContentFormWriteGateScope, reporterId: string, reason: string | null) => void
  reasonForScope: (scope: ContentFormWriteGateScope) => string | null
}

export const ContentFormWriteGateContext = createContext<ContentFormWriteGateValue>({
  report: () => undefined,
  reasonForScope: () => null,
})

export type ContentFormWriteGateBlock = Block
