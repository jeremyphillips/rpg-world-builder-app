import type { ContentTypeKey } from '@rpg/contracts'

/**
 * Metadata-only integration surface for a registered top-level catalog type.
 *
 * Documents required wiring for drift tests and future scaffolding. Runtime
 * registries remain authoritative — do not import executable config here.
 */
export type ContentTypeIntegrationManifestEntry = {
  /** Whether this type ships system records from an @rpg/catalog package. */
  catalog:
    | {
        bundledContent: 'bundled'
        packageName: string
      }
    | {
        bundledContent: 'none'
      }
  /** Present once this contract type is wired into the API runtime registry. */
  api?: {
    registrationPath: string
  }
  /** Present when a dashboard sub-area exists. */
  dashboard?: {
    folder: string
    /** Key on `CONTENT_ROUTES` (camelCase when multi-word). */
    routeSection?: string
    formDefinitionPath?: string
    visibleInSidebar?: boolean
  }
  capabilities: {
    /** When true, drift tests expect `CONTENT_TYPE_CAPABILITIES[key]`. */
    required: boolean
  }
}

/**
 * Read-only integration index for top-level `ContentTypeKey` values only.
 *
 * Nested resources (e.g. subclasses) are intentionally excluded until a separate
 * nested-resource manifest exists.
 */
export const CONTENT_TYPE_INTEGRATION_MANIFEST = {
  classes: {
    catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/classes' },
    api: {
      registrationPath: 'apps/api/src/features/content/classes/classes.config.ts',
    },
    dashboard: {
      folder: 'classes',
      routeSection: 'classes',
      formDefinitionPath: 'apps/dashboard/src/features/content/classes/lib/class-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  spells: {
    catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/spells' },
    api: {
      registrationPath: 'apps/api/src/features/content/spells/spells.config.ts',
    },
    dashboard: {
      folder: 'spells',
      routeSection: 'spells',
      formDefinitionPath: 'apps/dashboard/src/features/content/spells/lib/spell-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  species: {
    catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/species' },
    api: {
      registrationPath: 'apps/api/src/features/content/species/species.config.ts',
    },
    dashboard: {
      folder: 'species',
      routeSection: 'species',
      formDefinitionPath: 'apps/dashboard/src/features/content/species/lib/species-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  feats: {
    catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/feats' },
    api: {
      registrationPath: 'apps/api/src/features/content/feats/feats.config.ts',
    },
    dashboard: {
      folder: 'feats',
      routeSection: 'feats',
      formDefinitionPath: 'apps/dashboard/src/features/content/feats/lib/feat-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  equipment: {
    catalog: { bundledContent: 'bundled', packageName: '@rpg/catalog/equipment' },
    api: {
      registrationPath: 'apps/api/src/features/content/equipment/equipment.config.ts',
    },
    dashboard: {
      folder: 'equipment',
      routeSection: 'equipment',
      formDefinitionPath: 'apps/dashboard/src/features/content/equipment/lib/equipment-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  'skill-proficiencies': {
    catalog: {
      bundledContent: 'bundled',
      packageName: '@rpg/catalog/skill-proficiencies',
    },
    api: {
      registrationPath:
        'apps/api/src/features/content/skill-proficiencies/skill-proficiencies.config.ts',
    },
    dashboard: {
      folder: 'skill-proficiencies',
      routeSection: 'skillProficiencies',
      formDefinitionPath:
        'apps/dashboard/src/features/content/skill-proficiencies/lib/skill-proficiency-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  organizations: {
    catalog: { bundledContent: 'none' },
    api: {
      registrationPath: 'apps/api/src/features/content/organizations/organizations.config.ts',
    },
    dashboard: {
      folder: 'organizations',
      routeSection: 'organizations',
      formDefinitionPath:
        'apps/dashboard/src/features/content/organizations/lib/organization-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
  locations: {
    catalog: { bundledContent: 'none' },
    api: {
      registrationPath: 'apps/api/src/features/content/locations/locations.config.ts',
    },
    dashboard: {
      folder: 'locations',
      routeSection: 'locations',
      formDefinitionPath: 'apps/dashboard/src/features/content/locations/lib/location-form-def.ts',
      visibleInSidebar: true,
    },
    capabilities: { required: true },
  },
} satisfies Record<ContentTypeKey, ContentTypeIntegrationManifestEntry>

export type ContentTypeIntegrationManifest = typeof CONTENT_TYPE_INTEGRATION_MANIFEST
