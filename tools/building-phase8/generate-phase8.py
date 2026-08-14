#!/usr/bin/env python3
"""Apply Phase 8 specialization-term curation to building archetype registry shards.

Historical one-shot generator. Live corpus disposition is
`tools/building-refactor/src/building-archetype-refactor-inventory.ts`.
Current planning: `docs/roadmap/building-taxonomy.md`.
The `building-corpus-disposition.ts` path below is discovery-era and is not a
runtime SSOT.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SHARDS_DIR = ROOT / "packages/contracts/src/rpg/vocab/location/building-archetypes"
DISPOSITION_PATH = (
    ROOT / "packages/contracts/src/rpg/vocab/location/building-corpus-disposition.ts"
)

# Admission rejects: conditions, quality axes, and non-refinement concepts.
REJECT_SPECIALIZATIONS = frozenset(
    {
        "hovel",  # quality axis masquerading as type
        "shipwreck_dwelling",  # condition overlay on a base building
    }
)

# Curated parent archetype for corpus concepts dispositioned with placeholder `of: 'n'`.
SPECIALIZATION_PARENT: dict[str, str] = {
    "amphitheater": "arena",
    "artificer_atelier": "blacksmith",
    "bakery": "shop",
    "banqueting_house": "festhall",
    "baptistery": "temple",
    "barber_surgeon": "apothecary",
    "bardic_college": "academy",
    "beast_stable": "stable",
    "boathouse": "barn",
    "bounty_office": "guildhall",
    "butcher": "shop",
    "byre": "barn",
    "chandler": "shop",
    "clinic": "hospital",
    "clock_tower": "tower",
    "coach_house": "stable",
    "cobbler": "shop",
    "cooperage": "factory",
    "cottage": "house",
    "distillery": "brewery",
    "divination_parlor": "wizard_tower",
    "dovecote": "barn",
    "dyeworks": "factory",
    "enchanting_hall": "wizard_tower",
    "ferry_house": "inn",
    "fighting_pit": "arena",
    "flophouse": "boarding_house",
    "foundry": "factory",
    "fulling_mill": "mill",
    "general_store": "shop",
    "golem_workshop": "factory",
    "griffon_aerie": "stable",
    "harbourmaster_office": "customs_house",
    "icehouse": "warehouse",
    "jeweler": "shop",
    "kennel": "stable",
    "livery": "stable",
    "mage_prison": "prison",
    "magic_shop": "shop",
    "malt_house": "brewery",
    "moneylender": "bank",
    "oast_house": "brewery",
    "odeon": "theater",
    "opium_den": "brothel",
    "oracle_shrine": "temple",
    "orangery": "greenhouse",
    "pawnshop": "shop",
    "planar_embassy": "embassy",
    "portal_chamber": "wizard_tower",
    "potion_shop": "apothecary",
    "powder_magazine": "armory",
    "ranger_station": "guard_post",
    "ropewalk": "factory",
    "schoolhouse": "academy",
    "shearing_shed": "barn",
    "silo": "warehouse",
    "smokehouse": "slaughterhouse",
    "summoning_hall": "wizard_tower",
    "tailor": "shop",
    "temple_infirmary": "temple",
    "threshing_barn": "barn",
    "tithe_barn": "barn",
    "tollhouse": "customs_house",
    "townhouse": "house",
    "watermill": "mill",
    "well_house": "barn",
    "wheelwright": "blacksmith",
    "windmill": "mill",
    "workhouse": "prison",
    # Dwelling-form refinements (cultural form stays manifestation; these are instance refinements)
    "cave_dwelling": "house",
    "elven_tree_dwelling": "house",
    "houseboat": "house",
    "igloo": "house",
    "tent_pavilion": "house",
    "tipi": "house",
    "yurt": "house",
    # Fix disposition placeholder parent
    "gamekeepers_cottage": "house",
}

# Plan exemplars and corpus gaps not covered by disposition ids alone.
EXTRA_SPECIALIZATION_TERMS: dict[str, list[str]] = {
    "inn": ["roadside inn"],
    "palace": ["summer palace", "winter palace"],
    "warehouse": ["bonded warehouse"],
    "temple": ["sea temple", "funerary temple"],
    "manor": ["hunting lodge wing"],
    "boarding_house": ["residential lodging house"],
}


def normalize_terms(terms: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for term in terms:
        value = term.strip().lower()
        if not value or value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def id_to_label(concept_id: str) -> str:
    return concept_id.replace("_", " ").strip().lower()


def parse_dispositions() -> dict[str, dict[str, str]]:
    text = DISPOSITION_PATH.read_text()
    entries: dict[str, dict[str, str]] = {}
    for match in re.finditer(
        r"(\w+): \{ kind: 'specialization', of: '(\w+)' \}",
        text,
    ):
        entries[match.group(1)] = {"of": match.group(2)}
    return entries


def parse_shard_entries(path: Path) -> dict[str, dict]:
    text = path.read_text()
    entries: dict[str, dict] = {}
    pattern = re.compile(
        r"^\s+(?P<id>\w+):\s*\{(?P<body>.*?)^\s+\},",
        re.MULTILINE | re.DOTALL,
    )
    for match in pattern.finditer(text):
        cid = match.group("id")
        body = match.group("body")
        label = re.search(r"label: '([^']*)'", body)
        description = re.search(r"description: '([^']*)'", body)
        functions = re.findall(
            r"'(\w+)'",
            re.search(r"functions: \[(.*?)\]", body, re.DOTALL).group(1),  # type: ignore[union-attr]
        )
        manifestation = re.search(r"manifestationOf: '(\w+)'", body)
        aliases = re.findall(r"aliases: \[(.*?)\]", body, re.DOTALL)
        search_terms = re.findall(r"searchTerms: \[(.*?)\]", body, re.DOTALL)
        spec_terms = re.findall(r"specializationTerms: \[(.*?)\]", body, re.DOTALL)
        entry: dict = {
            "label": label.group(1) if label else "",
            "description": description.group(1) if description else "",
            "functions": functions,
        }
        if manifestation:
            entry["manifestationOf"] = manifestation.group(1)
        if aliases:
            entry["aliases"] = [
                t.strip().strip("'")
                for t in aliases[0].split(",")
                if t.strip()
            ]
        if search_terms:
            entry["searchTerms"] = [
                t.strip().strip("'")
                for t in search_terms[0].split(",")
                if t.strip()
            ]
        if spec_terms:
            entry["specializationTerms"] = [
                t.strip().strip("'")
                for t in spec_terms[0].split(",")
                if t.strip()
            ]
        entries[cid] = entry
    return entries


def resolve_parent(concept_id: str, disposition_of: str) -> str | None:
    if concept_id in REJECT_SPECIALIZATIONS:
        return None
    if concept_id in SPECIALIZATION_PARENT:
        return SPECIALIZATION_PARENT[concept_id]
    if disposition_of != "n":
        if disposition_of == "cottage":
            return "house"
        return disposition_of
    return None


def build_specialization_index(
    entries: dict[str, dict],
    dispositions: dict[str, dict[str, str]],
) -> dict[str, list[str]]:
    by_parent: dict[str, list[str]] = {}

    for concept_id, disposition in dispositions.items():
        parent = resolve_parent(concept_id, disposition["of"])
        if not parent or parent not in entries:
            continue
        if concept_id in entries:
            continue
        label = id_to_label(concept_id)
        parent_entry = entries[parent]
        parent_label = parent_entry["label"].strip().lower()
        blocked = {parent_label}
        blocked.update(parent_entry.get("aliases", []))
        blocked.update(parent_entry.get("searchTerms", []))
        if label in blocked:
            continue
        by_parent.setdefault(parent, []).append(label)

    for parent, extras in EXTRA_SPECIALIZATION_TERMS.items():
        if parent not in entries:
            continue
        parent_entry = entries[parent]
        blocked = {parent_entry["label"].strip().lower()}
        blocked.update(parent_entry.get("aliases", []))
        blocked.update(parent_entry.get("searchTerms", []))
        filtered = [term for term in extras if term.strip().lower() not in blocked]
        by_parent.setdefault(parent, []).extend(filtered)

    return {parent: normalize_terms(terms) for parent, terms in by_parent.items()}


def ts_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def render_entry(cid: str, entry: dict) -> str:
    lines = [f"  {cid}: {{"]
    lines.append(f"    label: '{ts_string(entry['label'])}',")
    lines.append(f"    description: '{ts_string(entry['description'])}',")
    fn = entry["functions"]
    if len(fn) == 1:
        lines.append(f"    functions: ['{fn[0]}'],")
    else:
        lines.append(f"    functions: ['{fn[0]}', '{fn[1]}'],")
    if entry.get("manifestationOf"):
        lines.append(f"    manifestationOf: '{entry['manifestationOf']}',")
    if entry.get("aliases"):
        terms = ", ".join(f"'{t}'" for t in entry["aliases"])
        lines.append(f"    aliases: [{terms}],")
    if entry.get("searchTerms"):
        terms = ", ".join(f"'{t}'" for t in entry["searchTerms"])
        lines.append(f"    searchTerms: [{terms}],")
    if entry.get("specializationTerms"):
        terms = ", ".join(f"'{t}'" for t in entry["specializationTerms"])
        lines.append(f"    specializationTerms: [{terms}],")
    lines.append("  },")
    return "\n".join(lines)


def shard_for(cid: str) -> str:
    first = cid[0]
    if first <= "c":
        return "a-c"
    if first <= "g":
        return "d-g"
    if first <= "l":
        return "h-l"
    if first <= "p":
        return "m-p"
    if first <= "t":
        return "q-t"
    return "u-z"


def validate(entries: dict[str, dict], spec_index: dict[str, list[str]]) -> None:
    assert len(entries) == 129, len(entries)

    for cid, entry in entries.items():
        label = entry["label"].strip().lower()
        spec_terms = normalize_terms(entry.get("specializationTerms", []))
        assert spec_terms == entry.get("specializationTerms", []), (
            f"{cid} specializationTerms not normalized"
        )
        for term in spec_terms:
            assert term == term.strip().lower()
            assert term != label, f"{cid} specialization equals label"
        aliases = normalize_terms(entry.get("aliases", []))
        search_terms = normalize_terms(entry.get("searchTerms", []))
        overlap = set(spec_terms) & (set(aliases) | set(search_terms))
        assert not overlap, f"{cid} specialization overlaps alias/search: {overlap}"

    for parent, terms in spec_index.items():
        assert entries[parent]["specializationTerms"] == terms


def apply_curation(
    entries: dict[str, dict],
    spec_index: dict[str, list[str]],
) -> dict[str, dict]:
    curated: dict[str, dict] = {}
    for cid, entry in entries.items():
        updated = dict(entry)
        if cid in spec_index:
            updated["specializationTerms"] = spec_index[cid]
        elif "specializationTerms" in updated:
            del updated["specializationTerms"]
        curated[cid] = updated
    return curated


def write_shards(entries: dict[str, dict]) -> None:
    shards: dict[str, dict[str, dict]] = {
        shard: {} for shard in ["a-c", "d-g", "h-l", "m-p", "q-t", "u-z"]
    }
    for cid in sorted(entries.keys()):
        shards[shard_for(cid)][cid] = entries[cid]

    for shard, shard_entries in shards.items():
        const = shard.upper().replace("-", "_")
        lines = [
            "import type { BuildingArchetypeShardEntry } from './types'",
            "",
            f"export const BUILDING_ARCHETYPE_ENTRIES_{const} = {{",
        ]
        for cid in sorted(shard_entries.keys()):
            lines.append(render_entry(cid, shard_entries[cid]))
        lines.append(
            f"}} as const satisfies Record<string, BuildingArchetypeShardEntry>",
        )
        lines.append("")
        out = SHARDS_DIR / f"{shard}.ts"
        out.write_text("\n".join(lines))


def main() -> None:
    entries: dict[str, dict] = {}
    for path in sorted(SHARDS_DIR.glob("*.ts")):
        if path.name in ("types.ts", "index.ts"):
            continue
        entries.update(parse_shard_entries(path))

    dispositions = parse_dispositions()
    spec_index = build_specialization_index(entries, dispositions)
    curated = apply_curation(entries, spec_index)
    validate(curated, spec_index)
    write_shards(curated)

    with_terms = sum(1 for e in curated.values() if e.get("specializationTerms"))
    total_terms = sum(len(e.get("specializationTerms", [])) for e in curated.values())
    print(
        f"Updated {len(curated)} entries: {with_terms} with specializationTerms "
        f"({total_terms} total suggestions)",
    )


if __name__ == "__main__":
    main()
