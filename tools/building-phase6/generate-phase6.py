#!/usr/bin/env python3
"""Generate Phase 6 building corpus disposition + archetype registry shards.

Historical one-shot generator. Live corpus disposition is
`tools/building-refactor/src/building-archetype-refactor-inventory.ts`.
Current planning: `docs/roadmap/building-taxonomy.md`.
The `building-corpus-disposition.ts` output path below is discovery-era and is
not a runtime SSOT.
"""

from __future__ import annotations

import re
import textwrap
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DISCOVERY = ROOT / "docs/roadmap/building-taxonomy-discovery.md"
OUT_DISPOSITION = (
    ROOT / "packages/contracts/src/rpg/vocab/location/building-corpus-disposition.ts"
)
OUT_SHARDS = ROOT / "packages/contracts/src/rpg/vocab/location/building-archetypes"

# Preserve Phase 1 seed registry entries exactly.
SEED_ENTRIES: dict[str, dict] = {
    "house": {
        "label": "House",
        "description": "A private dwelling.",
        "functions": ["dwelling"],
    },
    "inn": {
        "label": "Inn",
        "description": "A lodging house that also serves food and drink.",
        "functions": ["lodging", "food_drink_social"],
        "searchTerms": ["traveler"],
    },
    "tavern": {
        "label": "Tavern",
        "description": "A venue for food, drink, and social gathering.",
        "functions": ["food_drink_social"],
    },
    "warehouse": {
        "label": "Warehouse",
        "description": "A storage or logistics structure.",
        "functions": ["storage"],
    },
    "guildhall": {
        "label": "Guildhall",
        "description": "The headquarters of a craft or trade guild.",
        "functions": ["assembly", "governance"],
    },
    "temple": {
        "label": "Temple",
        "description": "A religious or ceremonial structure.",
        "functions": ["worship"],
    },
    "stable": {
        "label": "Stable",
        "description": "A building for housing and caring for mounts.",
        "functions": ["service"],
        "searchTerms": ["horses"],
    },
    "palace": {
        "label": "Palace",
        "description": "A grand residence of a ruler or noble house.",
        "functions": ["dwelling", "governance"],
    },
    "blacksmith": {
        "label": "Blacksmith",
        "description": "A smithy or metalworking shop.",
        "functions": ["service"],
    },
    "library": {
        "label": "Library",
        "description": "A building for study and curated records.",
        "functions": ["knowledge"],
        "searchTerms": ["books"],
    },
    "caravanserai": {
        "label": "Caravanserai",
        "description": "A roadside inn for merchants and caravan travelers.",
        "functions": ["lodging", "retail"],
        "manifestationOf": "inn",
        "searchTerms": ["caravan"],
    },
}

FUNCTION_OVERRIDES: dict[str, list[str]] = {
    "feast_hall": ["food_drink_social", "assembly"],
    "wizard_tower": ["dwelling", "knowledge"],
    "gladiator_school": ["spectacle", "lodging"],
    "coaching_inn": ["lodging", "transport_support"],
    "manor": ["dwelling", "governance"],
    "town_hall": ["governance", "assembly"],
    "courthouse": ["governance"],
    "prison": ["governance"],
    "barracks": ["defense_watch", "dwelling"],
    "armory": ["storage", "defense_watch"],
    "monastery": ["cloistered_community"],
    "shrine": ["worship"],
    "market": ["retail"],
    "apothecary": ["retail", "care"],
    "bank": ["finance"],
    "auction_house": ["retail", "assembly"],
    "exchange": ["finance", "assembly"],
    "bathhouse": ["care"],
    "hospital": ["care"],
    "almshouse": ["care"],
    "hospice": ["lodging", "care"],
    "theater": ["spectacle"],
    "arena": ["spectacle"],
    "mill": ["production"],
    "forge": ["production"],
    "factory": ["production"],
    "slaughterhouse": ["production"],
    "printing_press": ["production"],
    "archive": ["knowledge"],
    "academy": ["knowledge"],
    "university_college": ["knowledge", "cloistered_community"],
    "mausoleum": ["funerary"],
    "charnel_house": ["funerary"],
    "memorial_hall": ["funerary", "assembly"],
    "audience_hall": ["assembly", "governance"],
    "kiva": ["worship"],
    "guard_post": ["defense_watch"],
    "watchtower": ["defense_watch"],
    "mint": ["finance", "production"],
    "general_store": ["retail"],
    "shop": ["retail"],
    "machiya": ["dwelling", "retail"],
    "longhouse": ["dwelling", "assembly"],
    "broch": ["dwelling", "defense_watch"],
    "ribat": ["defense_watch", "worship"],
    "hammam": ["care"],
    "ryokan": ["lodging", "care"],
    "mosque": ["worship", "assembly"],
    "synagogue": ["worship", "knowledge"],
    "madrasa": ["knowledge", "worship"],
    "teahouse": ["food_drink_social"],
    "godown": ["storage"],
    "granary_on_stilts": ["storage"],
    "tolbooth": ["governance"],
    "basilica": ["worship", "assembly"],
    "pagoda": ["worship"],
    "moot_hall": ["assembly", "governance"],
    "trading_post": ["retail", "lodging"],
    "trading_factory": ["retail", "dwelling"],
    "tenement": ["dwelling"],
    "apartment_building": ["dwelling"],
    "boarding_house": ["lodging"],
    "hunting_lodge": ["dwelling"],
    "lazaretto": ["care"],
    "paladin_chapterhouse": ["defense_watch", "worship"],
    "adventurers_guild": ["assembly", "governance"],
    "menagerie": ["spectacle", "service"],
    "arsenal": ["storage", "defense_watch"],
    "brickworks": ["production"],
    "salt_works": ["production"],
    "shipyard": ["production", "transport_support"],
    "harbourmaster_office": ["governance"],
    "customs_house": ["governance", "retail"],
    "powder_magazine": ["storage", "defense_watch"],
    "lazaretto": ["care"],
}

CULT_PARENT: dict[str, str] = {
    "longhouse": "house",
    "roundhouse": "house",
    "broch": "house",
    "crannog": "house",
    "insula": "apartment_building",
    "domus": "house",
    "machiya": "house",
    "siheyuan": "house",
    "trading_factory": "warehouse",
    "moot_hall": "town_hall",
    "tolbooth": "courthouse",
    "drum_tower": "watchtower",
    "basilica": "temple",
    "mosque": "temple",
    "synagogue": "temple",
    "pagoda": "temple",
    "stave_church": "temple",
    "hof": "temple",
    "mithraeum": "temple",
    "ribat": "monastery",
    "godown": "warehouse",
    "granary_on_stilts": "warehouse",
    "madrasa": "academy",
    "teahouse": "tavern",
    "hammam": "bathhouse",
    "caravanserai": "inn",
    "ryokan": "inn",
    "mastaba": "mausoleum",
    "tholos": "mausoleum",
    "shinto_shrine": "shrine",
    "lamasery": "monastery",
    "wat": "monastery",
    "yamen": "town_hall",
    "souk": "market",
    "thermae": "bathhouse",
    "gymnasium": "academy",
    "kiva": "temple",
}

MANUAL_DISPOSITION: dict[str, tuple[str, dict]] = {
    "open_air_shrine": ("site", {}),
    "camp": ("site", {}),
    "war_camp": ("site", {}),
    "marae": ("site", {}),
    "walled_town": ("site", {}),
    "pa": ("site", {}),
    "wall_segment": ("form_only", {"structureType": "fortification"}),
    "ship": ("form_only", {"structureType": "vessel"}),
    "airship": ("form_only", {"structureType": "vessel"}),
    "aqueduct": ("form_only", {"structureType": "infrastructure"}),
    "bridge": ("form_only", {"structureType": "infrastructure"}),
    "fountain": ("form_only", {"structureType": "infrastructure"}),
    "drydock": ("form_only", {"structureType": "infrastructure"}),
    "staithe": ("form_only", {"structureType": "infrastructure"}),
    "stupa": ("form_only", {"structureType": "monument"}),
    "obelisk": ("form_only", {"structureType": "monument"}),
    "statue": ("form_only", {"structureType": "monument"}),
    "sphinx": ("form_only", {"structureType": "monument"}),
    "moai": ("form_only", {"structureType": "monument"}),
    "triumphal_arch": ("form_only", {"structureType": "monument"}),
    "barrow": ("form_only", {"structureType": "monument"}),
    "cairn": ("form_only", {"structureType": "monument"}),
    "throne_room": ("interior", {}),
    "crypt": ("interior", {}),
    "catacombs": ("interior", {}),
    "cloister": ("interior", {}),
    "ritual_chamber": ("interior", {}),
    "undercroft": ("interior", {}),
    "gallows": ("not_building", {}),
    "market_stall": ("not_building", {}),
    "sheepfold": ("not_building", {}),
    "siege_tower": ("not_building", {}),
    "vardo_wagon": ("not_building", {}),
    "mimic_building": ("not_building", {}),
    "safe_house": ("overlay", {}),
    "thieves_den": ("overlay", {}),
    "smugglers_den": ("overlay", {}),
    "dragon_roost": ("overlay", {}),
    "haunted_manor": ("overlay", {}),
    "hollowed_colossus": ("overlay", {}),
    "cathedral": ("specialization", {"of": "temple"}),
    "caravanserai": ("manifestation", {"of": "inn"}),
    "audience_hall": ("archetype", {}),
    "memorial_hall": ("archetype", {}),
    "kiva": ("archetype", {}),
    "cave_dwelling": ("specialization", {"of": "house"}),
    "palace": ("composite", {}),
    "monastery": ("composite", {}),
    "shipyard": ("composite", {}),
    "castle": ("composite", {}),
    "citadel": ("composite", {}),
    "fortress": ("composite", {}),
    "farmstead": ("composite", {}),
    "palace_complex": ("composite", {}),
    "abbey": ("composite", {}),
    "leprosarium": ("composite", {}),
    "mage_college": ("composite", {}),
    "university_college": ("composite", {}),
    "dwarven_forgehold": ("composite", {}),
    "dzong": ("composite", {}),
    "kasbah": ("composite", {}),
    "ksar": ("composite", {}),
    "royal_mews": ("composite", {}),
    "feast_hall": ("interior", {}),
    "sanctum": ("interior", {}),
    "laboratory": ("interior", {}),
    "tomb": ("interior", {}),
    "workshop": ("interior", {}),
    "kiln": ("interior", {}),
    "forge": ("interior", {}),
    "dormitory": ("interior", {}),
    "scriptorium": ("interior", {}),
    "root_cellar": ("interior", {}),
    "sail_loft": ("interior", {}),
    "warded_vault": ("interior", {}),
    "ossuary": ("interior", {}),
    "hobbit_burrow": ("interior", {}),
    "mithraeum": ("interior", {}),
    "chantry": ("interior", {}),
    "chapel": ("interior", {}),
    "sacristy": ("interior", {}),
    "vestry": ("interior", {}),
    "refectory": ("interior", {}),
    "infirmary": ("interior", {}),
    "farmhouse": ("specialization", {"of": "house"}),
    "dower_house": ("specialization", {"of": "manor"}),
    "gamekeepers_cottage": ("specialization", {"of": "cottage"}),
    "rectory": ("specialization", {"of": "house"}),
    "counting_house": ("specialization", {"of": "bank"}),
    "pigsty": ("not_building", {}),
    "apiary": ("not_building", {}),
    "anchorhold": ("interior", {}),
    "bridge_house": ("interior", {}),
    "city_gate": ("interior", {}),
    "covered_bridge": ("interior", {}),
    "water_tower": ("form_only", {"structureType": "infrastructure"}),
    "airship_dock": ("form_only", {"structureType": "infrastructure"}),
    "houseboat": ("specialization", {"of": "house"}),
    "shipwreck_dwelling": ("specialization", {"of": "house"}),
    "yurt": ("specialization", {"of": "house"}),
    "tipi": ("specialization", {"of": "house"}),
    "igloo": ("specialization", {"of": "house"}),
    "tent_pavilion": ("specialization", {"of": "house"}),
    "sweat_lodge": ("manifestation", {"of": "bathhouse"}),
    "elven_tree_dwelling": ("specialization", {"of": "house"}),
    "palaestra": ("form_only", {"structureType": "infrastructure"}),
    "stoa": ("form_only", {"structureType": "infrastructure"}),
    "hippodrome": ("form_only", {"structureType": "infrastructure"}),
    "nuraghe": ("archetype", {}),
    "ziggurat": ("form_only", {"structureType": "monument"}),
    "pyramid": ("form_only", {"structureType": "monument"}),
    "memorial": ("form_only", {"structureType": "monument"}),
    "blockhouse": ("archetype", {}),
    "martello_tower": ("archetype", {}),
    "gatehouse": ("archetype", {}),
    "beacon_tower": ("archetype", {}),
    "keep": ("archetype", {}),
    "tower": ("archetype", {}),
    "checkpoint": ("archetype", {}),
}

INTERIOR_ARCH_CTX = {
    "feast_hall",
    "sanctum",
    "laboratory",
    "tomb",
    "workshop",
    "kiln",
    "dormitory",
    "shrine",
}

FUNCTION_KEYWORDS: list[tuple[list[str], str]] = [
    (["dwelling", "residence", "residential", "domestic"], "dwelling"),
    (["lodging", "guest", "traveler", "hospitality", " boarding"], "lodging"),
    (["food", "drink", "social", "feast", "banquet", "brew", "tavern"], "food_drink_social"),
    (["retail", "shop", "merchant", "sold", "market stall", "trade counter"], "retail"),
    (["craft", "service", "smith", "stable", "livery", "kennel", "animal", "mount", "boarding service"], "service"),
    (["production", "processing", "manufacturing", "print", "mill", "works", "slaughter", "forge production"], "production"),
    (["storage", "warehouse", "granary", "logistics", "hold goods", "magazine", "depot"], "storage"),
    (["finance", "bank", "mint", "exchange", "treasury", "lend", "pawn", "accounting"], "finance"),
    (["governance", "administration", "court", "adjudication", "custody", "jail", "prison", "magistrate", "civic", "toll", "customs"], "governance"),
    (["worship", "devotion", "religious", "church", "temple", "shrine", "mosque", "synagogue", "rite", "ceremony", "sacred", "veneration"], "worship"),
    (["cloister", "monastic", "monastery", "abbey", "enclosed communal"], "cloistered_community"),
    (["assembly", "meeting", "convocation", "gathering", "audience", "deliberative"], "assembly"),
    (["education", "knowledge", "study", "library", "archive", "academy", "school", " teaching", "records"], "knowledge"),
    (["care", "healing", "hospital", "welfare", "bath", "almshouse", "hospice", "infirmary", "quarantine", "laundry"], "care"),
    (["defense", "military", "garrison", "barracks", "fort", "watch", "armory", "arsenal", "guard", "signal"], "defense_watch"),
    (["spectacle", "performance", "theater", "arena", "games", "entertainment", "display", "racing", "combat training"], "spectacle"),
    (["transport", "travel", "caravan", "waystation", "relay", "coach", "stabling", "dock cargo", "port admin"], "transport_support"),
    (["funerary", "burial", "mortuary", "tomb", "ossuary", "commemoration", "charnel", "mausoleum", "interment"], "funerary"),
]

VALID_FUNCTIONS = {
    "dwelling",
    "lodging",
    "food_drink_social",
    "retail",
    "service",
    "production",
    "storage",
    "finance",
    "governance",
    "worship",
    "cloistered_community",
    "assembly",
    "knowledge",
    "care",
    "defense_watch",
    "spectacle",
    "transport_support",
    "funerary",
}


def parse_concepts() -> dict[str, dict[str, str]]:
    text = DISCOVERY.read_text()
    start = text.find("## Coded matrix — v0.2 (300 concepts)")
    end = text.find("## Phase 2 observations")
    matrix = text[start:end]
    concepts: dict[str, dict[str, str]] = {}
    for line in matrix.splitlines():
        if not line.startswith("|"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 8:
            continue
        cid = parts[1]
        if not re.match(r"^[a-z][a-z0-9_]*$", cid):
            continue
        concepts[cid] = {
            "src": parts[2],
            "lvl": parts[3],
            "bnd": parts[4],
            "cmp": parts[5],
            "function": parts[6],
            "form": parts[7],
            "ambiguous": parts[13] if len(parts) > 13 else "",
            "notes": parts[14] if len(parts) > 14 else "",
        }

    gaps = {
        "audience_hall": dict(
            src="gap",
            lvl="arch",
            bnd="ctx",
            cmp="n",
            function="assembly + governance",
            form="—",
            ambiguous="",
            notes="",
        ),
        "memorial_hall": dict(
            src="gap",
            lvl="spec",
            bnd="yes",
            cmp="n",
            function="commemoration + assembly",
            form="—",
            ambiguous="memorial",
            notes="",
        ),
        "kiva": dict(
            src="gap",
            lvl="cult",
            bnd="ctx",
            cmp="n",
            function="worship (rite)",
            form="—",
            ambiguous="temple",
            notes="",
        ),
        "hollowed_colossus": dict(
            src="gap",
            lvl="—",
            bnd="ctx",
            cmp="n",
            function="(by current use)",
            form="—",
            ambiguous="",
            notes="",
        ),
        "mimic_building": dict(
            src="gap",
            lvl="—",
            bnd="no",
            cmp="n",
            function="predation",
            form="—",
            ambiguous="",
            notes="",
        ),
        "undercroft": dict(
            src="gap",
            lvl="—",
            bnd="no",
            cmp="n",
            function="storage",
            form="—",
            ambiguous="root_cellar",
            notes="",
        ),
        "staithe": dict(
            src="gap",
            lvl="—",
            bnd="no",
            cmp="n",
            function="cargo landing",
            form="—",
            ambiguous="wharf",
            notes="",
        ),
        "cave_dwelling": dict(
            src="gap",
            lvl="—",
            bnd="ctx",
            cmp="n",
            function="dwelling",
            form="—",
            ambiguous="house",
            notes="",
        ),
    }
    concepts.update(gaps)
    return concepts


def first_ambiguous(ambiguous: str) -> str | None:
    if not ambiguous or ambiguous == "—":
        return None
    first = ambiguous.split(",")[0].strip()
    if re.match(r"^[a-z][a-z0-9_]*$", first):
        return first
    return None


def assign_disposition(cid: str, c: dict[str, str]) -> dict:
    if cid in MANUAL_DISPOSITION:
        kind, extra = MANUAL_DISPOSITION[cid]
        return {"kind": kind, **extra}

    lvl, bnd, cmp = c["lvl"], c["bnd"], c.get("cmp", "n")
    notes = c.get("notes", "").lower()

    if bnd == "no":
        return {"kind": "not_building"}

    if "overlay" in notes or "role overlay" in notes:
        return {"kind": "overlay"}

    if cmp == "semi" and lvl == "spec" and bnd == "yes":
        return {"kind": "archetype"}

    if lvl == "cult" and bnd == "yes":
        parent = CULT_PARENT.get(cid) or first_ambiguous(c["ambiguous"]) or "house"
        return {"kind": "manifestation", "of": parent}

    if lvl == "arch" and bnd == "yes":
        return {"kind": "archetype"}

    if lvl == "arch" and bnd == "comp":
        return {"kind": "composite"}

    if lvl == "arch" and bnd == "ctx":
        if cid in INTERIOR_ARCH_CTX:
            return {"kind": "interior"}
        return {"kind": "archetype"}

    if lvl == "spec" and bnd == "yes":
        parent = first_ambiguous(c["ambiguous"]) or "house"
        return {"kind": "specialization", "of": parent}

    if lvl == "spec" and bnd == "ctx":
        parent = first_ambiguous(c["ambiguous"])
        if parent:
            return {"kind": "specialization", "of": parent}
        return {"kind": "interior"}

    if lvl == "spec" and bnd == "comp":
        return {"kind": "composite"}

    if lvl == "cult" and bnd == "ctx":
        return {"kind": "interior"}

    if lvl == "cult" and bnd == "comp":
        return {"kind": "composite"}

    if lvl == "comp" and bnd == "comp":
        return {"kind": "composite"}

    if bnd == "ctx":
        return {"kind": "interior"}

    return {"kind": "not_building"}


def infer_functions(cid: str, function_text: str) -> list[str]:
    if cid in FUNCTION_OVERRIDES:
        return FUNCTION_OVERRIDES[cid][:2]
    if cid in SEED_ENTRIES:
        return list(SEED_ENTRIES[cid]["functions"])

    text = function_text.lower()
    scored: list[tuple[int, str]] = []
    for keywords, fn in FUNCTION_KEYWORDS:
        score = sum(1 for kw in keywords if kw in text)
        if score:
            scored.append((score, fn))
    scored.sort(key=lambda x: (-x[0], x[1]))
    picked: list[str] = []
    for _, fn in scored:
        if fn not in picked:
            picked.append(fn)
        if len(picked) == 2:
            break
    if not picked:
        picked = ["service"]
    return picked[:2]


def label_for(cid: str) -> str:
    if cid in SEED_ENTRIES:
        return SEED_ENTRIES[cid]["label"]
    special = {
        "caravanserai": "Caravanserai",
        "guildhall": "Guildhall",
        "blacksmith": "Blacksmith",
        "macgyver": "MacGyver",
    }
    if cid in special:
        return special[cid]
    return " ".join(word.capitalize() for word in cid.split("_"))


def description_for(cid: str, c: dict[str, str], functions: list[str]) -> str:
    if cid in SEED_ENTRIES:
        return SEED_ENTRIES[cid]["description"]
    fn = c.get("function", "").strip()
    if fn and fn != "—":
        base = fn.split("+")[0].strip().rstrip("?")
        return f"A building primarily serving {base}."
    return f"A {label_for(cid).lower()} structure."


def registry_entry_for(cid: str, c: dict[str, str], disposition: dict) -> dict | None:
    kind = disposition["kind"]
    include = kind in ("archetype", "manifestation") or (
        kind == "composite" and c.get("lvl") == "arch"
    )
    if not include:
        return None

    if cid in SEED_ENTRIES:
        entry = dict(SEED_ENTRIES[cid])
        if disposition.get("of"):
            entry["manifestationOf"] = disposition["of"]
        return entry

    functions = infer_functions(cid, c.get("function", ""))
    entry: dict = {
        "label": label_for(cid),
        "description": description_for(cid, c, functions),
        "functions": functions,
    }
    if kind == "manifestation" or disposition.get("of"):
        entry["manifestationOf"] = disposition.get("of") or CULT_PARENT.get(cid)
    return entry


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
    if entry.get("searchTerms"):
        terms = ", ".join(f"'{t}'" for t in entry["searchTerms"])
        lines.append(f"    searchTerms: [{terms}],")
    lines.append("  },")
    return "\n".join(lines)


def render_disposition_value(d: dict) -> str:
    kind = d["kind"]
    if kind in ("manifestation", "specialization"):
        return f"{{ kind: '{kind}', of: '{d['of']}' }}"
    if kind == "form_only":
        st = d.get("structureType", "infrastructure")
        return f"{{ kind: '{kind}', structureType: '{st}' }}"
    return f"{{ kind: '{kind}' }}"


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


def main() -> None:
    concepts = parse_concepts()
    assert len(concepts) == 308, len(concepts)

    dispositions = {cid: assign_disposition(cid, c) for cid, c in concepts.items()}
    corpus_ids = sorted(concepts.keys())
    assert len(corpus_ids) == 308

    registry: dict[str, dict] = {}
    for cid in corpus_ids:
        entry = registry_entry_for(cid, concepts[cid], dispositions[cid])
        if entry:
            registry[cid] = entry

    # Ensure seed ids present
    for seed in SEED_ENTRIES:
        assert seed in registry, seed

    counts = Counter(d["kind"] for d in dispositions.values())

    # Write disposition module
    disp_lines = [
        "/**",
        " * Machine-checkable corpus disposition for Model E Phase 6 (2026-08-03).",
        " * Every BUILDING_CORPUS_IDS entry maps to exactly one disposition.",
        " */",
        "",
        "export type BuildingCorpusDispositionKind =",
        "  | 'archetype'",
        "  | 'manifestation'",
        "  | 'specialization'",
        "  | 'form_only'",
        "  | 'interior'",
        "  | 'site'",
        "  | 'composite'",
        "  | 'overlay'",
        "  | 'not_building'",
        "",
        "export type BuildingCorpusDisposition =",
        "  | { readonly kind: 'archetype' }",
        "  | { readonly kind: 'manifestation'; readonly of: string }",
        "  | { readonly kind: 'specialization'; readonly of: string }",
        "  | { readonly kind: 'form_only'; readonly structureType?: string }",
        "  | { readonly kind: 'interior' }",
        "  | { readonly kind: 'site' }",
        "  | { readonly kind: 'composite' }",
        "  | { readonly kind: 'overlay' }",
        "  | { readonly kind: 'not_building' }",
        "",
        "export const BUILDING_CORPUS_IDS = [",
    ]
    for cid in corpus_ids:
        disp_lines.append(f"  '{cid}',")
    disp_lines.append("] as const")
    disp_lines.append("")
    disp_lines.append("export type BuildingCorpusId = (typeof BUILDING_CORPUS_IDS)[number]")
    disp_lines.append("")
    disp_lines.append("export const BUILDING_CORPUS_DISPOSITIONS = {")
    for cid in corpus_ids:
        disp_lines.append(f"  {cid}: {render_disposition_value(dispositions[cid])},")
    disp_lines.append("} as const satisfies Record<BuildingCorpusId, BuildingCorpusDisposition>")
    disp_lines.append("")
    OUT_DISPOSITION.write_text("\n".join(disp_lines) + "\n")

    # Write shards
    shards: dict[str, dict[str, dict]] = {s: {} for s in ["a-c", "d-g", "h-l", "m-p", "q-t", "u-z"]}
    for cid in sorted(registry.keys()):
        shards[shard_for(cid)][cid] = registry[cid]

    OUT_SHARDS.mkdir(parents=True, exist_ok=True)
    shard_names: list[str] = []
    for shard, entries in shards.items():
        if not entries:
            continue
        shard_names.append(shard)
        body = "\n".join(render_entry(cid, entry) for cid, entry in sorted(entries.items()))
        content = (
            "import type { BuildingArchetypeShardEntry } from './types'\n\n"
            f"export const BUILDING_ARCHETYPE_ENTRIES_{shard.replace('-', '_').upper()} = {{\n"
            f"{body}\n"
            "} as const satisfies Record<string, BuildingArchetypeShardEntry>\n"
        )
        (OUT_SHARDS / f"{shard}.ts").write_text(content)

    index_imports = "\n".join(
        f"import {{ BUILDING_ARCHETYPE_ENTRIES_{s.replace('-', '_').upper()} }} from './{s}'"
        for s in shard_names
    )
    index_spreads = "\n".join(
        f"  ...BUILDING_ARCHETYPE_ENTRIES_{s.replace('-', '_').upper()}," for s in shard_names
    )
    index_content = (
        "/**\n"
        " * Neutral alphabetical shards composing BUILDING_ARCHETYPE_ENTRIES.\n"
        " * File placement carries zero semantic meaning.\n"
        " */\n"
        "import type { BuildingArchetypeShardEntry } from './types'\n\n"
        f"{index_imports}\n\n"
        "export const BUILDING_ARCHETYPE_SHARD_ENTRIES = {\n"
        f"{index_spreads}\n"
        "} as const satisfies Record<string, BuildingArchetypeShardEntry>\n"
    )
    (OUT_SHARDS / "index.ts").write_text(index_content)

    types_content = textwrap.dedent(
        """\
        import type { BuildingFunctionFamily } from '../building-function-family'

        export type BuildingArchetypeShardEntry = {
          readonly label: string
          readonly description: string
          readonly functions: readonly [BuildingFunctionFamily, BuildingFunctionFamily?]
          readonly manifestationOf?: string
          readonly searchTerms?: readonly string[]
        }
        """
    )
    (OUT_SHARDS / "types.ts").write_text(types_content)

    print("Registry count:", len(registry))
    print("Disposition counts:", dict(counts))
    print("Shards:", {k: len(v) for k, v in shards.items() if v})


if __name__ == "__main__":
    main()
