import type { ContentTypeKey } from '@rpg/contracts'

import {
  CONTENT_TYPE_INTEGRATION_MANIFEST,
  type ContentTypeIntegrationManifestEntry,
} from './content-type-integration-manifest'

export function integrationManifestEntries(): [
  ContentTypeKey,
  ContentTypeIntegrationManifestEntry,
][] {
  return Object.entries(CONTENT_TYPE_INTEGRATION_MANIFEST) as [
    ContentTypeKey,
    ContentTypeIntegrationManifestEntry,
  ][]
}

export function contentTypeKeysWithFormDefinition(): ContentTypeKey[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.dashboard?.formDefinitionPath)
    .map(([key]) => key)
    .sort()
}

export function contentTypeKeysWithApiRegistration(): ContentTypeKey[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.api)
    .map(([key]) => key)
    .sort()
}

export function contentTypeKeysWithVisibleInSidebar(): ContentTypeKey[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.dashboard?.visibleInSidebar === true)
    .map(([key]) => key)
    .sort()
}

export function contentTypeKeysWithRouteSection(): Array<{
  key: ContentTypeKey
  routeSection: string
}> {
  return integrationManifestEntries()
    .flatMap(([key, entry]) => {
      const routeSection = entry.dashboard?.routeSection
      return routeSection ? [{ key, routeSection }] : []
    })
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function contentTypeKeysWithRequiredCapabilities(): ContentTypeKey[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.capabilities.required)
    .map(([key]) => key)
    .sort()
}

export function contentTypeKeysWithCatalogPackage(): Array<{
  key: ContentTypeKey
  packageName: string
}> {
  return integrationManifestEntries()
    .flatMap(([key, entry]) => {
      return entry.catalog.bundledContent === 'bundled'
        ? [{ key, packageName: entry.catalog.packageName }]
        : []
    })
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function contentTypeKeysWithoutBundledContent(): ContentTypeKey[] {
  return integrationManifestEntries()
    .filter(([, entry]) => entry.catalog.bundledContent === 'none')
    .map(([key]) => key)
    .sort()
}

/** Maps `@rpg/catalog/<segment>` to `packages/catalog/src/<segment>`. */
export function catalogPackageNameToSrcPath(packageName: string): string {
  const prefix = '@rpg/catalog/'
  if (!packageName.startsWith(prefix)) {
    throw new Error(`Expected catalog package name to start with ${prefix}: ${packageName}`)
  }
  return `packages/catalog/src/${packageName.slice(prefix.length)}`
}
