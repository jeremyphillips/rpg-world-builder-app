import { SlotProgressionsField } from './slot-progressions-field'
import { SpellcastingProfilesField } from './spellcasting-profiles-field'
import { spellcastingSubsectionClasses } from './spellcasting-progression-field.variants'

export function SpellcastingProgressionField() {
  return (
    <div className={spellcastingSubsectionClasses}>
      <SlotProgressionsField />
      <SpellcastingProfilesField />
    </div>
  )
}
