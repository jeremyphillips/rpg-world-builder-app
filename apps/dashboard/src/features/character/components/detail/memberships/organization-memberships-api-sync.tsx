import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { OrganizationReferenceResolution } from '@rpg/contracts'

import type { OrganizationMembershipSelection } from '../../connections/picker/organization-picker-drawer.types'
import {
  areOrganizationMembershipListsEqual,
  organizationMembershipsToFormValues,
  type OrganizationMembershipsFormValues,
} from '../../../lib/relationship/character-organization-memberships-form-fields'

type OrganizationMembershipsApiSyncProps = {
  serverMemberships: readonly OrganizationReferenceResolution[]
  onAdd: (selection: OrganizationMembershipSelection) => void | Promise<void>
}

/** Commits organization membership picker adds from RHF to the API sheet handlers. */
export function OrganizationMembershipsApiSync({
  serverMemberships,
  onAdd,
}: OrganizationMembershipsApiSyncProps) {
  const { control, reset } = useFormContext<OrganizationMembershipsFormValues>()
  const formOrganizations = useWatch({ control, name: 'organizations' })
  const onAddRef = useRef(onAdd)
  const priorServerRef = useRef(serverMemberships)
  const inflightAddIdsRef = useRef(new Set<string>())

  useEffect(() => {
    onAddRef.current = onAdd
  })

  useEffect(() => {
    const serverChanged = !areOrganizationMembershipListsEqual(
      priorServerRef.current,
      serverMemberships,
    )
    const serverIds = new Set(serverMemberships.map((membership) => membership.organizationId))

    for (const organizationId of inflightAddIdsRef.current) {
      if (serverIds.has(organizationId)) {
        inflightAddIdsRef.current.delete(organizationId)
      }
    }

    if (serverChanged) {
      priorServerRef.current = serverMemberships
      reset(organizationMembershipsToFormValues(serverMemberships))
      return
    }

    const formValues: OrganizationMembershipsFormValues = {
      organizations: formOrganizations ?? [],
    }
    const serverSnapshot = organizationMembershipsToFormValues(serverMemberships)
    if (JSON.stringify(formValues.organizations) === JSON.stringify(serverSnapshot.organizations)) {
      return
    }

    for (const membership of formValues.organizations) {
      if (serverIds.has(membership.organizationId)) continue
      if (inflightAddIdsRef.current.has(membership.organizationId)) continue

      inflightAddIdsRef.current.add(membership.organizationId)
      void Promise.resolve(onAddRef.current(membership)).catch(() => {
        inflightAddIdsRef.current.delete(membership.organizationId)
        reset(organizationMembershipsToFormValues(serverMemberships))
      })
    }
  }, [formOrganizations, reset, serverMemberships])

  return null
}
