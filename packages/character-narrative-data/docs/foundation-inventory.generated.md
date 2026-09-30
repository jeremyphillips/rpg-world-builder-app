# Foundation collection inventory

Generated from collection revision `foundation-6`. Do not edit
this file directly. Regenerate it with:

```bash
pnpm --filter @rpg/character-narrative-data review:inventory
```

Counts are editorial signals, not symmetry requirements. Hook shapes are inferred
from slot and prose markers, so reviewers must confirm the classification.

## Total and slot coverage

```json
{
  "total": 182,
  "bySlot": {
    "personalityTraits": 20,
    "ideals": 26,
    "bonds": 29,
    "flaws": 31,
    "experience": 27,
    "choice": 24,
    "motivation": 25
  }
}
```

## Slot × theme

```json
{
  "personalityTraits": {
    "duty": 14,
    "belonging": 16,
    "ambition": 14
  },
  "ideals": {
    "duty": 23,
    "belonging": 22,
    "ambition": 21
  },
  "bonds": {
    "duty": 25,
    "belonging": 21,
    "ambition": 15
  },
  "flaws": {
    "duty": 26,
    "belonging": 26,
    "ambition": 27
  },
  "experience": {
    "duty": 21,
    "belonging": 23,
    "ambition": 18
  },
  "choice": {
    "duty": 21,
    "belonging": 21,
    "ambition": 21
  },
  "motivation": {
    "duty": 22,
    "belonging": 22,
    "ambition": 22
  }
}
```

## Alignment eligibility

Generic fragments plus fragments explicitly tagged for the alignment.

```json
{
  "personalityTraits": {
    "lg": 20,
    "ng": 20,
    "cg": 20,
    "ln": 20,
    "n": 20,
    "cn": 20,
    "le": 20,
    "ne": 20,
    "ce": 20
  },
  "ideals": {
    "lg": 11,
    "ng": 10,
    "cg": 10,
    "ln": 10,
    "n": 10,
    "cn": 10,
    "le": 10,
    "ne": 10,
    "ce": 10
  },
  "bonds": {
    "lg": 29,
    "ng": 29,
    "cg": 29,
    "ln": 29,
    "n": 29,
    "cn": 29,
    "le": 29,
    "ne": 29,
    "ce": 29
  },
  "flaws": {
    "lg": 15,
    "ng": 15,
    "cg": 15,
    "ln": 15,
    "n": 15,
    "cn": 16,
    "le": 15,
    "ne": 15,
    "ce": 15
  },
  "experience": {
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
  "choice": {
    "lg": 8,
    "ng": 8,
    "cg": 8,
    "ln": 8,
    "n": 8,
    "cn": 8,
    "le": 8,
    "ne": 8,
    "ce": 8
  },
  "motivation": {
    "lg": 9,
    "ng": 9,
    "cg": 9,
    "ln": 9,
    "n": 9,
    "cn": 9,
    "le": 9,
    "ne": 9,
    "ce": 9
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
  "direct": 91,
  "pressure": 71,
  "tension": 20
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
