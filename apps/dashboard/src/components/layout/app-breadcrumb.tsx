import { Fragment } from 'react'
import { Link, useMatches } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@rpg/ui'

import { useCampaigns } from '@/features/campaign'
import { hasCrumb, type BreadcrumbData, type CrumbItem } from '@/app/breadcrumbs'
import { useBreadcrumbEntityLabel } from './use-breadcrumb-label'

/** Reads all matched routes, resolves crumb labels, and renders the breadcrumb nav. */
export function AppBreadcrumb() {
  const matches = useMatches()
  const { data: campaigns = [] } = useCampaigns()
  const entityLabel = useBreadcrumbEntityLabel()

  const campaignId = matches.find((m) => 'campaignId' in m.params)?.params.campaignId
  const campaign = campaigns.find((c) => c.id === campaignId)

  const data: BreadcrumbData = {
    campaignName: campaign?.identity.name,
    entityLabel,
  }

  const crumbs: CrumbItem[] = matches
    .filter((m) => hasCrumb(m.handle))
    .map((m) => hasCrumb(m.handle) && m.handle.crumb(m.params, data))
    .filter((c): c is CrumbItem => Boolean(c))

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
