# Foundation collection inventory

Generated from collection revision `foundation-4`. Do not edit
this file directly. Regenerate it with:

```bash
pnpm --filter @rpg/character-narrative-data review:inventory
```

Counts are editorial signals, not symmetry requirements. Hook shapes are inferred
from slot and prose markers, so reviewers must confirm the classification.

## Total and slot coverage

```json
{
  "total": 170,
  "bySlot": {
    "personalityTraits": 18,
    "ideals": 24,
    "bonds": 27,
    "flaws": 29,
    "experience": 26,
    "choice": 23,
    "motivation": 23
  }
}
```

## Slot × theme

```json
{
  "personalityTraits": {
    "duty": 13,
    "belonging": 14,
    "ambition": 13
  },
  "ideals": {
    "duty": 22,
    "belonging": 20,
    "ambition": 20
  },
  "bonds": {
    "duty": 23,
    "belonging": 20,
    "ambition": 14
  },
  "flaws": {
    "duty": 25,
    "belonging": 25,
    "ambition": 25
  },
  "experience": {
    "duty": 20,
    "belonging": 22,
    "ambition": 18
  },
  "choice": {
    "duty": 21,
    "belonging": 20,
    "ambition": 20
  },
  "motivation": {
    "duty": 21,
    "belonging": 20,
    "ambition": 21
  }
}
```

## Alignment eligibility

Generic fragments plus fragments explicitly tagged for the alignment.

```json
{
  "personalityTraits": {
    "lg": 18,
    "ng": 18,
    "cg": 18,
    "ln": 18,
    "n": 18,
    "cn": 18,
    "le": 18,
    "ne": 18,
    "ce": 18
  },
  "ideals": {
    "lg": 9,
    "ng": 8,
    "cg": 8,
    "ln": 8,
    "n": 8,
    "cn": 8,
    "le": 8,
    "ne": 8,
    "ce": 8
  },
  "bonds": {
    "lg": 27,
    "ng": 27,
    "cg": 27,
    "ln": 27,
    "n": 27,
    "cn": 27,
    "le": 27,
    "ne": 27,
    "ce": 27
  },
  "flaws": {
    "lg": 13,
    "ng": 13,
    "cg": 13,
    "ln": 13,
    "n": 13,
    "cn": 14,
    "le": 13,
    "ne": 13,
    "ce": 13
  },
  "experience": {
    "lg": 26,
    "ng": 26,
    "cg": 26,
    "ln": 26,
    "n": 26,
    "cn": 26,
    "le": 26,
    "ne": 26,
    "ce": 26
  },
  "choice": {
    "lg": 7,
    "ng": 7,
    "cg": 7,
    "ln": 7,
    "n": 7,
    "cn": 7,
    "le": 7,
    "ne": 7,
    "ce": 7
  },
  "motivation": {
    "lg": 7,
    "ng": 7,
    "cg": 7,
    "ln": 7,
    "n": 7,
    "cn": 7,
    "le": 7,
    "ne": 7,
    "ce": 7
  }
}
```

## Alignment-specific coverage

Only fragments whose `alignmentIds` include the alignment.

```json
{
  "personalityTraits": {
    "lg": 0,
    "ng": 0,
    "cg": 0,
    "ln": 0,
    "n": 0,
    "cn": 0,
    "le": 0,
    "ne": 0,
    "ce": 0
  },
  "ideals": {
    "lg": 3,
    "ng": 2,
    "cg": 2,
    "ln": 2,
    "n": 2,
    "cn": 2,
    "le": 2,
    "ne": 2,
    "ce": 2
  },
  "bonds": {
    "lg": 0,
    "ng": 0,
    "cg": 0,
    "ln": 0,
    "n": 0,
    "cn": 0,
    "le": 0,
    "ne": 0,
    "ce": 0
  },
  "flaws": {
    "lg": 2,
    "ng": 2,
    "cg": 2,
    "ln": 2,
    "n": 2,
    "cn": 3,
    "le": 2,
    "ne": 2,
    "ce": 2
  },
  "experience": {
    "lg": 0,
    "ng": 0,
    "cg": 0,
    "ln": 0,
    "n": 0,
    "cn": 0,
    "le": 0,
    "ne": 0,
    "ce": 0
  },
  "choice": {
    "lg": 2,
    "ng": 2,
    "cg": 2,
    "ln": 2,
    "n": 2,
    "cn": 2,
    "le": 2,
    "ne": 2,
    "ce": 2
  },
  "motivation": {
    "lg": 2,
    "ng": 2,
    "cg": 2,
    "ln": 2,
    "n": 2,
    "cn": 2,
    "le": 2,
    "ne": 2,
    "ce": 2
  }
}
```

## Relationship and context conditions

```json
{
  "organizationMembership.current": 9,
  "placeRole.residence": 4,
  "placeRole.hometown": 3,
  "personRole.mentor": 3,
  "personRole.child": 3,
  "personRole.rival": 3,
  "organizationMembership.former": 1,
  "personRole.partner": 1,
  "personRole.parent": 1,
  "placeRole.birthplace": 1,
  "placeRole.property": 1
}
```

## Inferred hook shapes

```json
{
  "direct": 58,
  "pressure": 67,
  "tension": 45
}
```

## Repeated four-word openings for review

```json
[]
```

## Text-overlap clusters for review

The automated test fails only at a high-confidence threshold. This broader list
surfaces possible shared skeletons for editorial review.

```json
[]
```
