import { useCallback, useMemo, useRef, type ReactNode } from 'react'

import { ContentEditPublishContext, type PublishRequest } from './use-content-edit-publish-request'

export function ContentEditPublishProvider({ children }: { children: ReactNode }) {
  const publishRequestRef = useRef<PublishRequest | null>(null)

  const setPublishRequest = useCallback((handler: PublishRequest | null) => {
    publishRequestRef.current = handler
  }, [])

  const requestPublish = useCallback(() => {
    void publishRequestRef.current?.()
  }, [])

  const value = useMemo(
    () => ({
      requestPublish,
      setPublishRequest,
    }),
    [requestPublish, setPublishRequest],
  )

  return (
    <ContentEditPublishContext.Provider value={value}>
      {children}
    </ContentEditPublishContext.Provider>
  )
}
