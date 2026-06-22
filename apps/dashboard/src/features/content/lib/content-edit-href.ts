import { CONTENT_ROUTES } from '@/app/content-routes'

type ContentRouteSection = keyof typeof CONTENT_ROUTES

/** Resolves an edit URL for a content type, or `undefined` when no edit route exists. */
export function contentEditHref(
  section: ContentRouteSection,
  campaignId: string,
  entityId: string,
): string | undefined {
  const routes = CONTENT_ROUTES[section]
  if (!('edit' in routes) || typeof routes.edit !== 'function') {
    return undefined
  }
  return routes.edit(campaignId, entityId)
}
