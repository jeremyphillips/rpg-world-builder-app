'use client'

import type { CharacterBuildContext } from '@rpg/contracts'

import {
  mapContentCreateContextToQuickNpcCreateContext,
  QuickNpcCreateModal,
} from '@/features/character'

import { LocationCreateModal } from '../../locations/components/location-create-modal.client'
import { OrganizationCreateModal } from '../../organizations/components/organization-create-modal.client'
import type { OnContentCreated, ContentCreateContext } from '@/lib/create-flow'
import type { ActiveNestedCreateIntent } from './relationship-picker-nested-create.types'

export type RelationshipPickerNestedCreateModalsProps = {
  campaignId: string
  activeIntent: ActiveNestedCreateIntent | null
  createContext: ContentCreateContext
  organizationCreateOpen: boolean
  locationCreateOpen: boolean
  npcCreateOpen: boolean
  npcBuildContext?: CharacterBuildContext | null
  onCreateModalOpenChange: (open: boolean) => void
  onCreated: OnContentCreated
  onNpcCancel: () => void
}

export function RelationshipPickerNestedCreateModals({
  campaignId,
  activeIntent,
  createContext,
  organizationCreateOpen,
  locationCreateOpen,
  npcCreateOpen,
  npcBuildContext,
  onCreateModalOpenChange,
  onCreated,
  onNpcCancel,
}: RelationshipPickerNestedCreateModalsProps) {
  return (
    <>
      <OrganizationCreateModal
        open={organizationCreateOpen}
        onOpenChange={onCreateModalOpenChange}
        campaignId={campaignId}
        onCreated={onCreated}
      />
      {activeIntent?.target === 'location' ? (
        <LocationCreateModal
          open={locationCreateOpen}
          onOpenChange={onCreateModalOpenChange}
          campaignId={campaignId}
          intent={{ authoringType: activeIntent.authoringType }}
          createContext={createContext}
          onCreated={onCreated}
        />
      ) : null}
      {npcBuildContext && activeIntent?.target === 'character' ? (
        <QuickNpcCreateModal
          open={npcCreateOpen}
          onOpenChange={onCreateModalOpenChange}
          campaignId={campaignId}
          buildContext={npcBuildContext}
          context={mapContentCreateContextToQuickNpcCreateContext(createContext)}
          onCancel={onNpcCancel}
          onCreated={onCreated}
        />
      ) : null}
    </>
  )
}
