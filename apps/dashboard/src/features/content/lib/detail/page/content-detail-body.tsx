import type { ReactNode } from 'react'

import { ContentDetailNavProvider } from './content-detail-nav-context'
import {
  CONTENT_DETAIL_DESCRIPTION_HEADING_ID,
  CONTENT_DETAIL_DESCRIPTION_LABEL,
} from './content-detail-nav.constants'
import { ContentDetailSection } from './content-detail-section'
import { ContentDetailSectionNav } from './content-detail-section-nav'

export type ContentDetailBodyProps = {
  descriptionContent?: ReactNode
  children?: ReactNode
}

export function ContentDetailBody({ descriptionContent, children }: ContentDetailBodyProps) {
  return (
    <ContentDetailNavProvider>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        <ContentDetailSectionNav />
        <div className="min-w-0 w-full flex-1 space-y-6">
          {descriptionContent ? (
            <ContentDetailSection
              heading={CONTENT_DETAIL_DESCRIPTION_LABEL}
              headingId={CONTENT_DETAIL_DESCRIPTION_HEADING_ID}
            >
              {descriptionContent}
            </ContentDetailSection>
          ) : null}
          {children}
        </div>
      </div>
    </ContentDetailNavProvider>
  )
}
