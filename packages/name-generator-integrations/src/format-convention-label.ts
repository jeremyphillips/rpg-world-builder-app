import type { NamingConventionKey } from '@rpg/contracts/name-generator'
import type { NameSubjectKind } from '@rpg/contracts/name-generator'

const KEY_LABEL_SUFFIX: Record<NamingConventionKey, string> = {
  personal: 'personal names',
  family: 'family names',
  clan: 'clan names',
  settlement: 'settlement names',
  landmark: 'landmark names',
  faction: 'faction names',
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

  if (subjectKinds.includes('landmark') && !subjectKinds.includes('settlement')) {
    return `Landmark names for ${cultureLabel.toLowerCase()} lands.`
  }

  if (subjectKinds.includes('settlement') || subjectKinds.includes('landmark')) {
    return `Settlement names for ${cultureLabel.toLowerCase()} communities.`
  }

  if (subjectKinds.includes('clan')) {
    return `Clan names for ${cultureLabel.toLowerCase()} kin groups.`
  }

  if (subjectKinds.includes('family')) {
    return `Family names for ${cultureLabel.toLowerCase()} households.`
  }

  if (subjectKinds.includes('faction') || subjectKinds.includes('organization')) {
    return `Faction and organization names for ${cultureLabel.toLowerCase()} groups.`
  }

  return `Names for ${cultureLabel.toLowerCase()} subjects.`
}
