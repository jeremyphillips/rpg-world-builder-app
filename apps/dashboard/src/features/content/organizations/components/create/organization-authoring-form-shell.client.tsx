'use client'

import type { ReactNode } from 'react'

import { OrganizationAuthoringProvider } from './organization-authoring-context.client'

/** Named create-time provider boundary for org create route, modal, and embedded building create. */
export function OrganizationAuthoringFormShell({ children }: { children: ReactNode }) {
  return <OrganizationAuthoringProvider>{children}</OrganizationAuthoringProvider>
}
