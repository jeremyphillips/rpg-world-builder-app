import type { ReactNode } from 'react'

import { FormStickyScrollBody, formStickyScrollShellWithDockedFooterClasses } from '@rpg/ui/form'

const characterBuilderFormScrollViewportClasses =
  'h-full min-h-0 overflow-y-auto scrollbar-slim pe-0 ps-0 pb-6'

export type CharacterBuilderFormColumnProps = {
  scrollContent: ReactNode
  footer: ReactNode
  compactPreview?: ReactNode
}

/** Middle builder column — bounded scroll body with docked footer below the step form. */
export function CharacterBuilderFormColumn({
  scrollContent,
  footer,
  compactPreview,
}: CharacterBuilderFormColumnProps) {
  return (
    <div className="dash-character-builder__form">
      <div className={formStickyScrollShellWithDockedFooterClasses}>
        <FormStickyScrollBody
          boundedScroll
          scrollViewportClassName={characterBuilderFormScrollViewportClasses}
        >
          {compactPreview ? (
            <div className="dash-character-builder__compact-preview">{compactPreview}</div>
          ) : null}
          {scrollContent}
        </FormStickyScrollBody>
        {footer}
      </div>
    </div>
  )
}
