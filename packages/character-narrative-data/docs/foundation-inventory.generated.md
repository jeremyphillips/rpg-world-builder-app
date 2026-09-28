# Foundation collection inventory

Generated from collection revision `foundation-3`. Do not edit
this file directly. Regenerate it with:

```bash
pnpm --filter @rpg/character-narrative-data review:inventory
```

Counts are editorial signals, not symmetry requirements. Hook shapes are inferred
from slot and prose markers, so reviewers must confirm the classification.

## Total and slot coverage

```json
{
  "total": 134,
  "bySlot": {
    "personalityTraits": 18,
    "ideals": 15,
    "bonds": 27,
    "flaws": 20,
    "experience": 26,
    "choice": 14,
    "motivation": 14
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
    "duty": 13,
    "belonging": 11,
    "ambition": 11
  },
  "bonds": {
    "duty": 23,
    "belonging": 20,
    "ambition": 14
  },
  "flaws": {
    "duty": 16,
    "belonging": 16,
    "ambition": 16
  },
  "experience": {
    "duty": 20,
    "belonging": 22,
    "ambition": 18
  },
  "choice": {
    "duty": 12,
    "belonging": 11,
    "ambition": 11
  },
  "motivation": {
    "duty": 12,
    "belonging": 11,
    "ambition": 12
  }
}
```

## Slot × alignment eligibility

Unrestricted fragments count as eligible for every alignment.

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
    "lg": 12,
    "ng": 12,
    "cg": 12,
    "ln": 12,
    "n": 12,
    "cn": 12,
    "le": 12,
    "ne": 12,
    "ce": 12
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
    "lg": 6,
    "ng": 6,
    "cg": 6,
    "ln": 6,
    "n": 6,
    "cn": 6,
    "le": 6,
    "ne": 6,
    "ce": 6
  },
  "motivation": {
    "lg": 6,
    "ng": 6,
    "cg": 6,
    "ln": 6,
    "n": 6,
    "cn": 6,
    "le": 6,
    "ne": 6,
    "ce": 6
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
  "direct": 41,
  "pressure": 54,
  "tension": 39
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
