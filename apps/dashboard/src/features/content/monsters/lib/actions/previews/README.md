# Monster action previews

`MonsterActionDetail` mounts `MonsterActionRulesPreviewShell` above action composer fields for every section/kind pair. Rules text comes from `resolveActionStatBlockRulesFacingForForm` → `resolveActionStatBlockRulesFacing`; attack metadata uses the draft profile retained on `DerivedDraftAttack`.

Legacy preview slot components and builder entry points in this folder remain for metadata helpers (`buildMonsterActionAttackPreview`) and tests until follow-up cleanup removes unused exports.
