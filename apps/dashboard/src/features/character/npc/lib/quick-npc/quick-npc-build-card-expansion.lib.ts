import * as React from 'react'

export type QuickNpcBuildExpandedAttribute = 'role' | 'class' | null

type QuickNpcBuildCardExpansionSync = {
  classProgressionApplicable: boolean
  classId: string
  roleRowEnabled: boolean
  npcTemplateId: string
}

function collapseRoleWhenRowDisabled(
  expanded: QuickNpcBuildExpandedAttribute,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute | undefined {
  if (expanded !== 'role' || current.roleRowEnabled) return undefined
  return current.classProgressionApplicable && current.classId === '' ? 'class' : null
}

function resolveWhenClassProgressionDisabled(
  expanded: QuickNpcBuildExpandedAttribute,
  classProgressionApplicable: boolean,
): QuickNpcBuildExpandedAttribute | undefined {
  if (classProgressionApplicable) return undefined
  return expanded === 'class' ? null : expanded
}

function resolveWhenRoleRowUnset(
  expanded: QuickNpcBuildExpandedAttribute,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute | undefined {
  if (!current.roleRowEnabled || current.npcTemplateId !== '') return undefined
  return expanded === 'class' ? expanded : 'role'
}

function resolveWhenTemplateSelectedWithEmptyClass(
  previous: QuickNpcBuildCardExpansionSync,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute | undefined {
  const templateJustSelected =
    current.roleRowEnabled &&
    previous.npcTemplateId === '' &&
    current.npcTemplateId !== '' &&
    current.classId === ''
  return templateJustSelected ? 'class' : undefined
}

function resolveWhenClassUnset(
  expanded: QuickNpcBuildExpandedAttribute,
  previous: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute {
  const becameApplicable = previous.classProgressionApplicable === false
  const classIdBecameEmpty = previous.classId !== ''
  if (becameApplicable || classIdBecameEmpty) {
    return 'class'
  }
  return expanded
}

function resolveQuickNpcBuildCardExpandedSync(
  expanded: QuickNpcBuildExpandedAttribute,
  previous: QuickNpcBuildCardExpansionSync,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute {
  const roleCollapsed = collapseRoleWhenRowDisabled(expanded, current)
  if (roleCollapsed !== undefined) return roleCollapsed

  const withoutClassProgression = resolveWhenClassProgressionDisabled(
    expanded,
    current.classProgressionApplicable,
  )
  if (withoutClassProgression !== undefined) return withoutClassProgression

  const roleRowUnset = resolveWhenRoleRowUnset(expanded, current)
  if (roleRowUnset !== undefined) return roleRowUnset

  const templateSelected = resolveWhenTemplateSelectedWithEmptyClass(previous, current)
  if (templateSelected !== undefined) return templateSelected

  if (current.classId !== '') return expanded

  return resolveWhenClassUnset(expanded, previous)
}

export function useQuickNpcBuildCardExpandedAttribute(args: {
  classProgressionApplicable: boolean
  classId: string
  roleRowEnabled: boolean
  npcTemplateId: string
}): [
  QuickNpcBuildExpandedAttribute,
  React.Dispatch<React.SetStateAction<QuickNpcBuildExpandedAttribute>>,
] {
  const { classProgressionApplicable, classId, roleRowEnabled, npcTemplateId } = args
  const [expanded, setExpanded] = React.useState<QuickNpcBuildExpandedAttribute>(() => {
    if (roleRowEnabled && npcTemplateId === '') return 'role'
    return classProgressionApplicable && classId === '' ? 'class' : null
  })
  const [syncState, setSyncState] = React.useState<QuickNpcBuildCardExpansionSync>(() => ({
    classProgressionApplicable,
    classId,
    roleRowEnabled,
    npcTemplateId,
  }))

  if (
    classProgressionApplicable !== syncState.classProgressionApplicable ||
    classId !== syncState.classId ||
    roleRowEnabled !== syncState.roleRowEnabled ||
    npcTemplateId !== syncState.npcTemplateId
  ) {
    const nextExpanded = resolveQuickNpcBuildCardExpandedSync(expanded, syncState, {
      classProgressionApplicable,
      classId,
      roleRowEnabled,
      npcTemplateId,
    })
    const nextSync = { classProgressionApplicable, classId, roleRowEnabled, npcTemplateId }

    setSyncState(nextSync)
    if (nextExpanded !== expanded) {
      setExpanded(nextExpanded)
    }
  }

  return [expanded, setExpanded]
}
