import { createContext, useContext } from 'react'

type PublishRequest = () => void | Promise<void>

type ContentEditPublishContextValue = {
  requestPublish: () => void
  setPublishRequest: (handler: PublishRequest | null) => void
}

export const ContentEditPublishContext = createContext<ContentEditPublishContextValue | null>(null)

export function useContentEditPublishRequest(): ContentEditPublishContextValue | null {
  return useContext(ContentEditPublishContext)
}

export type { PublishRequest }
