import { createContext, useContext, useMemo, useRef, useCallback, type ReactNode } from 'react'

type PublishRequest = () => void | Promise<void>

type ContentEditPublishContextValue = {
  requestPublish: () => void
  setPublishRequest: (handler: PublishRequest | null) => void
}

const ContentEditPublishContext = createContext<ContentEditPublishContextValue | null>(null)

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

export function useContentEditPublishRequest(): ContentEditPublishContextValue | null {
  return useContext(ContentEditPublishContext)
}
