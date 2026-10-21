import { useContext, useEffect, useId } from 'react'

import {
  ContentFormWriteGateContext,
  type ContentFormWriteGateScope,
} from './content-form-write-gate.context'

export function useContentFormWriteGateReason(
  scope: ContentFormWriteGateScope = 'strict',
): string | null {
  const { reasonForScope } = useContext(ContentFormWriteGateContext)
  return reasonForScope(scope)
}

/** Registers a scoped gate reason for the lifetime of the caller (typically one form section). */
export function useReportContentFormWriteGate(
  scope: ContentFormWriteGateScope,
  reason: string | null,
) {
  const reporterId = useId()
  const { report } = useContext(ContentFormWriteGateContext)
  useEffect(() => {
    report(scope, reporterId, reason)
    return () => report(scope, reporterId, null)
  }, [scope, reporterId, reason, report])
}
