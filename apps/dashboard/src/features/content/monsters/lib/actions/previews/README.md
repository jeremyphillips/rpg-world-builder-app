# Monster action previews

`MonsterActionDetail` mounts `MonsterActionRulesPreviewShell` above action composer fields for every section/kind pair. Rules text comes from `resolveActionStatBlockRulesFacingForForm` → `resolveActionStatBlockRulesFacing`; attack metadata uses the draft profile retained on `DerivedDraftAttack`.

Summary builders here (`buildMonsterAction*Preview`, `resolveMonsterAction*PreviewGuidance`) are production entry points for `MonsterActionRulesPreviewShell` and stat-block facing. Per-kind preview **slots** under `components/form/actions/**` remain registered form escape hatches; do not delete them when trimming label/constants debt in `monster-form-labels.ts` (see `tools/fallow/phase7-monster-form-labels.json`).
