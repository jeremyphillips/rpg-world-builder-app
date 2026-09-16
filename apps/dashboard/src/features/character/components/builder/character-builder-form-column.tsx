import type { ReactNode } from 'react'

import { FormStickyScrollBody, formStickyScrollShellWithDockedFooterClasses } from '@rpg/ui/form'

import {
  characterBuilderFormCompactPreviewSlotClasses,
  characterBuilderFormScrollViewportClasses,
  characterBuilderShellFormColumnClasses,
} from './character-builder-shell.variants'

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
    <div className={characterBuilderShellFormColumnClasses}>
      <div className={formStickyScrollShellWithDockedFooterClasses}>
        <FormStickyScrollBody
          boundedScroll
          scrollViewportClassName={characterBuilderFormScrollViewportClasses}
        >
          {compactPreview ? (
            <div className={characterBuilderFormCompactPreviewSlotClasses}>{compactPreview}</div>
          ) : null}
          {scrollContent}
        </FormStickyScrollBody>
        {footer}
      </div>
    </div>
  )
}
