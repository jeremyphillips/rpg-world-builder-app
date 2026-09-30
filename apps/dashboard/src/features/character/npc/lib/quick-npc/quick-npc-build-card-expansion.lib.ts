import * as React from 'react'

export type QuickNpcBuildExpandedAttribute = 'role' | 'class' | 'level' | null

type QuickNpcBuildCardExpansionSync = {
  classProgressionApplicable: boolean
  classId: string
  roleRowEnabled: boolean
  npcTemplateId: string
}

function resolveQuickNpcBuildCardExpandedSync(
  expanded: QuickNpcBuildExpandedAttribute,
  previous: QuickNpcBuildCardExpansionSync,
  current: QuickNpcBuildCardExpansionSync,
): QuickNpcBuildExpandedAttribute {
  const { classProgressionApplicable, classId } = current
  const { classProgressionApplicable: wasApplicable, classId: wasClassId } = previous

  if (expanded === 'role' && !current.roleRowEnabled) {
    return null
  }

  if (!classProgressionApplicable) {
    return expanded === 'class' ? null : expanded
  }

  if (current.roleRowEnabled && current.npcTemplateId === '') {
    return expanded === 'class' || expanded === 'level' ? expanded : 'role'
  }

  if (
    current.roleRowEnabled &&
    previous.npcTemplateId === '' &&
    current.npcTemplateId !== '' &&
    classId === ''
  ) {
    return 'class'
  }

  if (classId !== '') {
    return expanded
  }

  const becameApplicable = wasApplicable === false
  const classIdBecameEmpty = wasClassId !== ''

  if (becameApplicable || classIdBecameEmpty) {
    return 'class'
  }

  return expanded
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
