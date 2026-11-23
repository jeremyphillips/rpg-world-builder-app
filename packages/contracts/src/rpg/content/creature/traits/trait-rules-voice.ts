export type TraitRulesVoice = { agreement: 'player' } | { agreement: 'stat-block'; subject: string }

function capitalizedSubject(subject: string): string {
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

export function traitHasForVoice(voice: TraitRulesVoice): 'have' | 'has' {
  return voice.agreement === 'player' ? 'have' : 'has'
}

export function traitPossessiveForVoice(voice: TraitRulesVoice): 'your' | 'its' {
  return voice.agreement === 'player' ? 'your' : 'its'
}

export function traitSubjectCap(voice: TraitRulesVoice): string {
  if (voice.agreement === 'player') return 'You'
  return capitalizedSubject(voice.subject)
}

export function traitLegendaryResistanceRulesProse(voice: TraitRulesVoice): string {
  if (voice.agreement === 'player') {
    return 'If you fail a saving throw, you can choose to succeed instead.'
  }
  return `If ${voice.subject} fails a saving throw, it can choose to succeed instead.`
}
