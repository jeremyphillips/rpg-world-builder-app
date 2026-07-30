import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { buildGlobalSidebarSections } from './build-global-sidebar-sections'

describe('buildGlobalSidebarSections', () => {
  it('includes Main, Personal, and Tools destinations', () => {
    const sections = buildGlobalSidebarSections({ isElevatedPlatformRole: false })

    expect(sections.map((section) => section.id)).toEqual(['main', 'personal', 'tools'])

    const mainItems = sections.find((section) => section.id === 'main')!.items
    expect(mainItems.map((item) => item.label)).toEqual(['Dashboard', 'Campaigns'])
    expect(mainItems[0]).toMatchObject({ href: ROUTES.home, end: true })
    expect(mainItems[1]).toMatchObject({ href: ROUTES.campaign.list })

    const personalItems = sections.find((section) => section.id === 'personal')!.items
    expect(personalItems.map((item) => item.label)).toEqual(['Characters'])
    expect(personalItems[0]).toMatchObject({ href: ROUTES.characters.list })

    const toolsItems = sections.find((section) => section.id === 'tools')!.items
    expect(toolsItems.map((item) => item.label)).toEqual(['Name Generator'])
  })

  it('includes Admin only for elevated platform roles', () => {
    expect(
      buildGlobalSidebarSections({ isElevatedPlatformRole: false }).some(
        (section) => section.id === 'admin',
      ),
    ).toBe(false)

    const elevated = buildGlobalSidebarSections({ isElevatedPlatformRole: true })
    const admin = elevated.find((section) => section.id === 'admin')
    expect(admin?.items.map((item) => item.label)).toEqual(['Users', 'Admin Settings'])
  })
})
