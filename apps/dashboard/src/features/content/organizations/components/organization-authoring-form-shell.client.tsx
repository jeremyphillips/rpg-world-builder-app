'use client'

import type { ReactNode } from 'react'

import { OrganizationAuthoringProvider } from '../lib/organization-authoring-context.client'
import { OrganizationAuthoringPresetBridge } from '../lib/organization-authoring-preset-bridge.client'

export function OrganizationAuthoringFormShell({ children }: { children: ReactNode }) {
  return <OrganizationAuthoringProvider>{children}</OrganizationAuthoringProvider>
}

export { OrganizationAuthoringPresetBridge }
