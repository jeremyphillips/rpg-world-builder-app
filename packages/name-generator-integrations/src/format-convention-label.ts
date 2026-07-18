import type { NamingConventionKey } from '@rpg/contracts/name-generator'
import type { NameSubjectKind } from '@rpg/contracts/name-generator'

const KEY_LABEL_SUFFIX: Record<NamingConventionKey, string> = {
  personal: 'personal names',
  settlement: 'settlement names',
  clan: 'clan names',
}

export function formatConventionLabel(cultureLabel: string, key: NamingConventionKey): string {
  return `${cultureLabel} ${KEY_LABEL_SUFFIX[key]}`
}

export function formatConventionDescription(
  cultureLabel: string,
  subjectKinds: readonly NameSubjectKind[],
): string {
  if (subjectKinds.includes('person')) {
    return `Given and family names for ${cultureLabel.toLowerCase()} characters.`
  }

  if (subjectKinds.includes('settlement') || subjectKinds.includes('landmark')) {
    return `Settlement names for ${cultureLabel.toLowerCase()} communities.`
  }

  if (subjectKinds.includes('clan')) {
    return `Clan names for ${cultureLabel.toLowerCase()} kin groups.`
  }

  return `Names for ${cultureLabel.toLowerCase()} subjects.`
}
