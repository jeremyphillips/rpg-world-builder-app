import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'

/**
 * Level 0 campaign baseline grants are fixed proficiencies assembled directly from
 * `levelZeroNpcs` rules — no builder ChoiceSets. Registered here so the source
 * pipeline documents campaign baseline alongside species, class, and future templates.
 */
export const resolveLevelZeroBaselineGrantChoices: ChoiceSourceResolver = () => []
