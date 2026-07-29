/**
 * Test-only side-effect imports — loads every content form def into
 * `contentFormRegistry` for drift and validation suites.
 *
 * Production create/edit routes keep route-local imports for code splitting.
 * Do not import this module from runtime app code.
 */
import '../../classes/lib/class-form-def'
import '../../equipment/lib/equipment-form-def'
import '../../feats/lib/feat-form-def'
import '../../organizations/lib/organization-form-def'
import '../../skill-proficiencies/lib/skill-proficiency-form-def'
import '../../species/lib/species-form-def'
import '../../spells/lib/spell-form-def'
