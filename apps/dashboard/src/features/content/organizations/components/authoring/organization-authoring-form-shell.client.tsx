'use client'

import type { ReactNode } from 'react'

import { OrganizationAuthoringProvider } from './organization-authoring-context.client'
import { OrganizationAuthoringPresetBridge } from './organization-authoring-preset-bridge.client'

export function OrganizationAuthoringFormShell({ children }: { children: ReactNode }) {
  return <OrganizationAuthoringProvider>{children}</OrganizationAuthoringProvider>
}

export { OrganizationAuthoringPresetBridge }
