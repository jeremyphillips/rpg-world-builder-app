import * as React from 'react'
import { SquarePen } from 'lucide-react'

import { Alert, Button } from '@rpg/ui'

import {
  CrossContentRelationshipRow,
  DetailCollectionPanel,
  RelationshipList,
  detailCollectionRecordSeparatorVariants,
} from '@/features/content'

import { useCharacterConnectionsSheet } from '../../../hooks/use-character-connections-sheet'
import type { CharacterRelationshipSubjectKind } from '../../../lib/invalidate-character-relationship-queries'
import {
  CONNECTION_SECTION_CATALOG,
  CONNECTION_TOP_LEVEL_SECTION_IDS,
  filterProjectionsBySection,
  type ConnectionTopLevelSectionId,
} from '../../../lib/relationship/connection-section-catalog'
import { resolveProjectionRowPresentation } from '../../../lib/relationship/connection-projection-row-presentation.lib'
import { resolveConnectionSheetEditCopy } from '../../../lib/relationship/connection-sheet-edit-copy.lib'
import { CharacterConnectionAddModal } from './character-connection-add-modal'
import { CharacterConnectionEditModal } from './character-connection-edit-modal'
import { CharacterConnectionsAddMenu } from './character-connections-add-menu'

export type CharacterConnectionsSectionProps = {
  campaignId: string
  characterId: string
  canEdit: boolean
  subjectKind: CharacterRelationshipSubjectKind
}

const CONNECTIONS_EMPTY_LABEL = 'No connections added yet.'

export function CharacterConnectionsSection({
  campaignId,
  characterId,
  canEdit,
  subjectKind,
}: CharacterConnectionsSectionProps) {
  const sheet = useCharacterConnectionsSheet({
    campaignId,
    characterId,
    canEdit,
    subjectKind,
  })
  const [addSectionId, setAddSectionId] = React.useState<ConnectionTopLevelSectionId | null>(null)

  const existingTargetIds = React.useMemo(
    () =>
      new Set(
        sheet.projections
          .map((row) => row.target?.id)
          .filter((targetId): targetId is string => Boolean(targetId)),
      ),
    [sheet.projections],
  )

  if (sheet.isBootstrapping) return null

  const hasRows = sheet.projections.length > 0

  return (
    <>
      <DetailCollectionPanel
        heading="Connections"
        headingId="character-connections"
        headerAlign="center"
        headerSurface="subtle"
        bodySurface="transparent"
        action={
          canEdit && !sheet.isRelationshipsError ? (
            <CharacterConnectionsAddMenu
              disabled={sheet.isMutating}
              onSelectSection={setAddSectionId}
            />
          ) : undefined
        }
      >
        {sheet.isRelationshipsError ? (
          <div className="px-4">
            <Alert variant="destructive" title="Could not load connections" role="alert">
              {sheet.relationshipsErrorLabel}
            </Alert>
          </div>
        ) : (
          <RelationshipList.Root
            itemCount={sheet.projections.length}
            emptyLabel={CONNECTIONS_EMPTY_LABEL}
          >
            {hasRows ? (
              <div className="px-4">
                {CONNECTION_TOP_LEVEL_SECTION_IDS.map((sectionId) => {
                  const sectionRows = filterProjectionsBySection(sheet.projections, sectionId)
                  if (sectionRows.length === 0) return null

                  const section = CONNECTION_SECTION_CATALOG[sectionId]
                  const editCopy = resolveConnectionSheetEditCopy(sectionId)

                  return (
                    <RelationshipList.Group
                      key={sectionId}
                      label={section.heading}
                      itemCount={sectionRows.length}
                    >
                      <ul className={detailCollectionRecordSeparatorVariants()}>
                        {sectionRows.map((row) => {
                          const presentation = resolveProjectionRowPresentation(row, campaignId)

                          return (
                            <li key={row.relationshipId}>
                              <CrossContentRelationshipRow
                                heading={presentation.heading}
                                href={presentation.headingHref}
                                description={presentation.description}
                                trailing={
                                  canEdit && row.capabilities.canUpdateDetails
                                    ? {
                                        kind: 'action',
                                        content: (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`${editCopy.editLabel} for ${presentation.heading}`}
                                            onClick={() => sheet.setEditingRow(row)}
                                          >
                                            <SquarePen aria-hidden className="size-4" />
                                          </Button>
                                        ),
                                      }
                                    : null
                                }
                              />
                            </li>
                          )
                        })}
                      </ul>
                    </RelationshipList.Group>
                  )
                })}
              </div>
            ) : null}
          </RelationshipList.Root>
        )}
      </DetailCollectionPanel>

      {canEdit ? (
        <>
          <CharacterConnectionAddModal
            key={addSectionId ?? 'add-closed'}
            open={addSectionId !== null}
            sectionId={addSectionId}
            sheetData={sheet.sheetData}
            existingProjectionKinds={existingTargetIds}
            onOpenChange={(open) => {
              if (!open) setAddSectionId(null)
            }}
            onAddPerson={sheet.handleAddPerson}
            onAddOrganization={sheet.handleAddOrganization}
            onAddPlace={sheet.handleAddPlace}
            onAddProperty={sheet.handleAddProperty}
          />

          <CharacterConnectionEditModal
            key={sheet.editingRow?.relationshipId ?? 'edit-closed'}
            open={sheet.editingRow !== null}
            row={sheet.editingRow}
            sheetData={sheet.sheetData}
            onOpenChange={(open) => {
              if (!open) sheet.setEditingRow(null)
            }}
            onSave={async (row, input) => {
              await sheet.handleSaveRow(row, input)
            }}
            onRemove={sheet.handleRemoveRow}
          />
        </>
      ) : null}
    </>
  )
}
