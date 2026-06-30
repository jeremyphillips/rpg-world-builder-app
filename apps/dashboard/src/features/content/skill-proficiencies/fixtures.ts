import { pickSkillProficiency } from '../lib/fixtures/pick'

export const ATHLETICS = pickSkillProficiency('athletics')
export const STEALTH = pickSkillProficiency('stealth')
export const ACROBATICS = pickSkillProficiency('acrobatics')
export const ARCANA = pickSkillProficiency('arcana')
export const PERCEPTION = pickSkillProficiency('perception')

export const SKILLS_LIST = [ATHLETICS, ACROBATICS, ARCANA, PERCEPTION] as const
