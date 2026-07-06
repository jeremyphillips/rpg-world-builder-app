import { describe, expect, it } from 'vitest'

import {
  abilityModifier,
  baseArmorClass,
  hasSavingThrowProficiency,
  levelOneMaxHp,
  resolveLevelOneMaxHp,
  resolveUnarmoredAc,
  savingThrowBonus,
  skillModifier,
  spellAttackBonus,
  spellSaveDc,
  unarmoredAc,
  unarmoredAcFromDexModifier,
} from './index'

// ---------------------------------------------------------------------------
// abilityModifier
// ---------------------------------------------------------------------------

describe('abilityModifier', () => {
  it('returns 0 for a score of 10', () => {
    expect(abilityModifier(10)).toBe(0)
  })

  it('returns 0 for a score of 11', () => {
    expect(abilityModifier(11)).toBe(0)
  })

  it('returns +1 for a score of 12', () => {
    expect(abilityModifier(12)).toBe(1)
  })

  it('returns +3 for a score of 16', () => {
    expect(abilityModifier(16)).toBe(3)
  })

  it('returns +5 for a score of 20', () => {
    expect(abilityModifier(20)).toBe(5)
  })

  it('returns -1 for a score of 9', () => {
    expect(abilityModifier(9)).toBe(-1)
  })

  it('returns -5 for a score of 1 (minimum)', () => {
    expect(abilityModifier(1)).toBe(-5)
  })

  it('floors the result (score 13 → +1, not +1.5)', () => {
    expect(abilityModifier(13)).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// levelOneMaxHp
// ---------------------------------------------------------------------------

describe('levelOneMaxHp', () => {
  it('fighter d10 with CON 14 → 12 (10 + 2)', () => {
    expect(levelOneMaxHp(10, 14)).toBe(12)
  })

  it('wizard d6 with CON 10 → 6 (6 + 0)', () => {
    expect(levelOneMaxHp(6, 10)).toBe(6)
  })

  it('barbarian d12 with CON 16 → 15 (12 + 3)', () => {
    expect(levelOneMaxHp(12, 16)).toBe(15)
  })

  it('negative CON modifier reduces HP (rogue d8, CON 7 → 6)', () => {
    expect(levelOneMaxHp(8, 7)).toBe(6) // 8 + abilityModifier(7) = 8 + (-2) = 6
  })

  it('uses the hit die max, not average', () => {
    // d8 max = 8, not average 4.5
    expect(levelOneMaxHp(8, 10)).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// hasSavingThrowProficiency
// ---------------------------------------------------------------------------

describe('hasSavingThrowProficiency', () => {
  const fighterSaves = ['str', 'con'] as const

  it('returns true when ability is in the list', () => {
    expect(hasSavingThrowProficiency('str', fighterSaves)).toBe(true)
    expect(hasSavingThrowProficiency('con', fighterSaves)).toBe(true)
  })

  it('returns false when ability is not in the list', () => {
    expect(hasSavingThrowProficiency('dex', fighterSaves)).toBe(false)
    expect(hasSavingThrowProficiency('int', fighterSaves)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// savingThrowBonus
// ---------------------------------------------------------------------------

describe('savingThrowBonus', () => {
  it('adds proficiency bonus when proficient (STR 16, profBonus 2 → +5)', () => {
    expect(savingThrowBonus(16, true, 2)).toBe(5) // +3 (mod) + 2 (prof)
  })

  it('omits proficiency bonus when not proficient (INT 10, profBonus 2 → +0)', () => {
    expect(savingThrowBonus(10, false, 2)).toBe(0)
  })

  it('handles negative modifier (CHA 8, not proficient → -1)', () => {
    expect(savingThrowBonus(8, false, 2)).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// skillModifier
// ---------------------------------------------------------------------------

describe('skillModifier', () => {
  it('returns base ability modifier when rank is undefined (no proficiency)', () => {
    expect(skillModifier(10, undefined, 2)).toBe(0)
    expect(skillModifier(14, undefined, 2)).toBe(2)
  })

  it('adds proficiency bonus once for "proficient" rank', () => {
    expect(skillModifier(10, 'proficient', 2)).toBe(2) // 0 + 2
    expect(skillModifier(14, 'proficient', 2)).toBe(4) // 2 + 2
  })

  it('adds proficiency bonus twice for "expertise" rank', () => {
    expect(skillModifier(10, 'expertise', 2)).toBe(4) // 0 + 4
    expect(skillModifier(16, 'expertise', 4)).toBe(11) // 3 + 8
  })
})

// ---------------------------------------------------------------------------
// spellSaveDc
// ---------------------------------------------------------------------------

describe('spellSaveDc', () => {
  it('computes 8 + profBonus + spellcasting ability mod', () => {
    // Wizard INT 18 (+4), profBonus 2 → DC 14
    expect(spellSaveDc(18, 2)).toBe(14)
  })

  it('scales with proficiency bonus at higher levels', () => {
    // Cleric WIS 16 (+3), profBonus 4 (L9) → DC 15
    expect(spellSaveDc(16, 4)).toBe(15)
  })
})

// ---------------------------------------------------------------------------
// spellAttackBonus
// ---------------------------------------------------------------------------

describe('spellAttackBonus', () => {
  it('computes profBonus + spellcasting ability mod', () => {
    // Wizard INT 18 (+4), profBonus 2 → +6
    expect(spellAttackBonus(18, 2)).toBe(6)
  })

  it('scales with proficiency bonus', () => {
    // Sorcerer CHA 20 (+5), profBonus 5 → +10
    expect(spellAttackBonus(20, 5)).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// baseArmorClass / unarmoredAcFromDexModifier / unarmoredAc / resolveUnarmoredAc
// ---------------------------------------------------------------------------

describe('baseArmorClass', () => {
  it('returns the ruleset base unchanged', () => {
    expect(baseArmorClass(10)).toBe(10)
    expect(baseArmorClass(9)).toBe(9)
  })
})

describe('unarmoredAcFromDexModifier', () => {
  it('adds the DEX modifier to the ruleset base', () => {
    expect(unarmoredAcFromDexModifier(10, 0)).toBe(10)
    expect(unarmoredAcFromDexModifier(10, 2)).toBe(12)
    expect(unarmoredAcFromDexModifier(9, -1)).toBe(8)
  })
})

describe('unarmoredAc', () => {
  it('returns ruleset base + DEX modifier', () => {
    expect(unarmoredAc(10)).toBe(10) // DEX 10, mod 0
    expect(unarmoredAc(14)).toBe(12) // DEX 14, mod +2
    expect(unarmoredAc(16)).toBe(13) // DEX 16, mod +3
  })

  it('handles low DEX (DEX 8 → AC 9)', () => {
    expect(unarmoredAc(8)).toBe(9)
  })

  it('respects a non-default ruleset base', () => {
    expect(unarmoredAc(10, 9)).toBe(9)
    expect(unarmoredAc(14, 9)).toBe(11)
  })
})

describe('resolveLevelOneMaxHp', () => {
  it('uses a neutral CON modifier when conScore is unset', () => {
    expect(resolveLevelOneMaxHp({ hitDie: 10, conScore: undefined })).toBe(10)
    expect(resolveLevelOneMaxHp({ hitDie: 8, conScore: undefined, defaultConModifier: 0 })).toBe(8)
  })

  it('derives the modifier from conScore when set', () => {
    expect(resolveLevelOneMaxHp({ hitDie: 10, conScore: 14 })).toBe(12)
  })
})

describe('resolveUnarmoredAc', () => {
  it('uses a neutral DEX modifier when dexScore is unset', () => {
    expect(resolveUnarmoredAc({ acBase: 10, dexScore: undefined })).toBe(10)
    expect(resolveUnarmoredAc({ acBase: 9, dexScore: undefined, defaultDexModifier: 0 })).toBe(9)
  })

  it('derives the modifier from dexScore when set', () => {
    expect(resolveUnarmoredAc({ acBase: 10, dexScore: 14 })).toBe(12)
  })
})
