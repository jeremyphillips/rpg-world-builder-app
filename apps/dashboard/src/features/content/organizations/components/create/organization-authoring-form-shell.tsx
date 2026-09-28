import type { ReactNode } from 'react'

import type { OrganizationFormPresentation } from '../../lib/organization-form-presentation.lib'
import { OrganizationAuthoringProvider } from './organization-authoring-context'

/** Named create-time provider boundary for org create route, modal, and embedded building create. */
export function OrganizationAuthoringFormShell({
  children,
  presentation = 'full',
}: {
  children: ReactNode
  presentation?: OrganizationFormPresentation
}) {
  return (
    <OrganizationAuthoringProvider presentation={presentation}>
      {children}
    </OrganizationAuthoringProvider>
  )
}
