import { describe, expect, it, vi } from 'vitest'

import type { AnyContentFormDef } from '@/features/content/lib/forms/registry/content-form-registry'
import { OrganizationAuthoringProvider } from '@/features/content/organizations/components/authoring/organization-authoring-context'
import { makeTestQueryClient, renderWithProviders } from '@/test/render'

import { contentFormRouteLoaders } from './lazy-routes'

const shells = vi.hoisted(() => ({
  create: vi.fn(),
  edit: vi.fn(),
}))

vi.mock('@/features/content/lib/forms/shells/create/content-create-shell', () => ({
  ContentCreateShell: ({ def }: { def: AnyContentFormDef }) => {
    shells.create(def)
    return null
  },
}))

vi.mock('@/features/content/lib/forms/shells/edit/content-edit-shell', () => ({
  ContentEditShell: ({ def }: { def: AnyContentFormDef }) => {
    shells.edit(def)
    return null
  },
}))

type FormRouteKey = keyof typeof contentFormRouteLoaders

async function loadFormRouteElements(key: FormRouteKey) {
  if (key === 'equipment') {
    const loaders = contentFormRouteLoaders.equipment
    const [{ default: Create }, { default: Edit }] = await Promise.all([
      loaders.create(),
      loaders.edit(),
    ])
    return [<Create family="weapons" key="create" />, <Edit family="weapons" key="edit" />]
  }

  const loaders = contentFormRouteLoaders[key]
  const [{ default: Create }, { default: Edit }] = await Promise.all([
    loaders.create(),
    loaders.edit(),
  ])
  return [<Create key="create" />, <Edit key="edit" />]
}

describe('production content form routes', () => {
  it.each(Object.keys(contentFormRouteLoaders) as FormRouteKey[])(
    'passes the owning form definition to the create and edit shells for %s',
    async (key) => {
      const routes = await loadFormRouteElements(key)
      shells.create.mockClear()
      shells.edit.mockClear()

      const queryClient = makeTestQueryClient()
      queryClient.setDefaultOptions({ queries: { enabled: false } })
      renderWithProviders(<OrganizationAuthoringProvider>{routes}</OrganizationAuthoringProvider>, {
        queryClient,
      })

      expect(shells.create).toHaveBeenCalledOnce()
      expect(shells.edit).toHaveBeenCalledOnce()
      const formDefinition: AnyContentFormDef = shells.create.mock.calls[0]![0]
      expect(formDefinition.routeKey).toBe(key)
      expect(formDefinition.schema.safeParse).toBeTypeOf('function')
      expect(shells.edit).toHaveBeenLastCalledWith(formDefinition)
    },
    15_000, // The first lazy loader initializes the shared form module graph.
  )
})
