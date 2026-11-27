'use client'

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import {
  createEmptyFormValidationProducerSession,
  type FormUiContextValue,
  type FormValidationProducerSession,
} from '@rpg/ui/form'

export type ContentFormSubmitProducerBinding = {
  producerSession: FormValidationProducerSession
  setProducerSession: Dispatch<SetStateAction<FormValidationProducerSession>>
  stampRef: React.MutableRefObject<number>
  snapshotStamp: number
  setSnapshotStamp: Dispatch<SetStateAction<number>>
  persistingRef: React.MutableRefObject<number>
  uiRef: React.MutableRefObject<Pick<
    FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>
}

/** One producer session and stamp for multiple submit hooks on the same form. */
export function useContentFormSubmitProducerBinding(): ContentFormSubmitProducerBinding {
  const [producerSession, setProducerSession] = useState<FormValidationProducerSession>(() =>
    createEmptyFormValidationProducerSession(),
  )
  const stampRef = useRef(0)
  const [snapshotStamp, setSnapshotStamp] = useState(0)
  const persistingRef = useRef(0)
  const uiRef = useRef<ContentFormSubmitProducerBinding['uiRef']['current']>(null)

  return useMemo(
    () => ({
      producerSession,
      setProducerSession,
      stampRef,
      snapshotStamp,
      setSnapshotStamp,
      persistingRef,
      uiRef,
    }),
    [producerSession, snapshotStamp],
  )
}
