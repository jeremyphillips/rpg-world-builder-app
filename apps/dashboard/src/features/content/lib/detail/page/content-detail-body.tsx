import type { ReactNode } from 'react'

import { ContentDetailNavProvider } from './content-detail-nav-context'
import {
  CONTENT_DETAIL_DESCRIPTION_HEADING_ID,
  CONTENT_DETAIL_DESCRIPTION_LABEL,
} from './content-detail-nav.constants'
import { ContentDetailSection } from './content-detail-section'
import { ContentDetailSectionNav } from './content-detail-section-nav'
import {
  contentDetailBodyColumnClasses,
  contentDetailBodyShellClasses,
} from './content-detail-layout.variants'

export type ContentDetailBodyProps = {
  descriptionContent?: ReactNode
  children?: ReactNode
}

export function ContentDetailBody({ descriptionContent, children }: ContentDetailBodyProps) {
  return (
    <ContentDetailNavProvider>
      <div className={contentDetailBodyShellClasses}>
        <ContentDetailSectionNav />
        <div className={contentDetailBodyColumnClasses}>
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
