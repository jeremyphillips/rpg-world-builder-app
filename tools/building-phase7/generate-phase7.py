#!/usr/bin/env python3
"""Apply Phase 7 alias and search-term curation to building archetype registry shards.

Historical one-shot generator. Current Building planning:
`docs/roadmap/building-taxonomy.md`.
"""

from __future__ import annotations

import re
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SHARDS_DIR = ROOT / "packages/contracts/src/rpg/vocab/location/building-archetypes"

# Aliases = true synonyms only. Never alias a distinct archetype identity.
ALIASES: dict[str, list[str]] = {
    "apartment_building": ["flats"],
    "apothecary": ["pharmacy"],
    "blacksmith": ["smithy", "forge"],
    "festhall": ["feast hall"],
    "prison": ["jail", "gaol"],
    "tavern": ["pub", "alehouse"],
    "warehouse": ["storehouse"],
}

# searchTerms = broader discovery vocabulary (1–3 per entry where sensible).
SEARCH_TERMS: dict[str, list[str]] = {
    "academy": ["education", "school", "learning"],
    "adventurers_guild": ["quest", "guild", "party"],
    "almshouse": ["charity", "poor", "housing"],
    "apartment_building": ["dwelling", "residential", "multi-family"],
    "apothecary": ["remedies", "potions", "medicine"],
    "archive": ["documents", "records", "custody"],
    "arena": ["combat", "games", "spectacle"],
    "armory": ["weapons", "arms", "armor"],
    "arsenal": ["weapons", "arms", "munitions"],
    "asylum": ["mental", "custodial", "care"],
    "auction_house": ["auction", "bidding", "sale"],
    "audience_hall": ["assembly", "audience", "court"],
    "bank": ["finance", "money", "deposit"],
    "barn": ["farm", "livestock", "storage"],
    "barracks": ["garrison", "soldiers", "military"],
    "basilica": ["church", "christian", "basilica"],
    "bathhouse": ["bathing", "baths", "hygiene"],
    "beacon_tower": ["signal", "fire", "warning"],
    "bell_tower": ["bells", "signal", "campanile"],
    "blacksmith": ["metal", "ironwork", "smithing"],
    "blockhouse": ["fortification", "strongpoint", "defense"],
    "boarding_house": ["lodging", "roomers", "residential"],
    "brewery": ["beer", "ale", "brewing"],
    "brickworks": ["bricks", "kiln", "construction"],
    "broch": ["celtic", "tower", "fortified"],
    "brothel": ["pleasure", "courtesan", "entertainment"],
    "caravanserai": ["caravan", "merchant", "roadside"],
    "charnel_house": ["bones", "corpses", "dead"],
    "checkpoint": ["border", "control", "inspection"],
    "coaching_inn": ["relay", "stagecoach", "travel"],
    "coffeehouse": ["coffee", "social", "gathering"],
    "command_post": ["military", "command", "headquarters"],
    "courthouse": ["law", "trial", "justice"],
    "crannog": ["lake", "island", "celtic"],
    "crematorium": ["cremation", "funeral", "ashes"],
    "customs_house": ["trade", "tariff", "inspection"],
    "domus": ["roman", "villa", "domus"],
    "drum_tower": ["timekeeping", "clock", "signal"],
    "embassy": ["diplomatic", "ambassador", "mission"],
    "exchange": ["trading", "brokerage", "finance"],
    "factory": ["manufacturing", "industry", "production"],
    "festhall": ["feasting", "revelry", "banquet"],
    "folly": ["ornament", "decorative", "garden"],
    "gambling_hall": ["gaming", "cards", "dice"],
    "gatehouse": ["gate", "entry", "fortification"],
    "gladiator_school": ["gladiator", "combat", "training"],
    "glassworks": ["glass", "blowing", "craft"],
    "godown": ["trade", "port", "godown"],
    "granary": ["grain", "food", "storage"],
    "granary_on_stilts": ["raised", "grain", "stilts"],
    "greenhouse": ["plants", "cultivation", "garden"],
    "guard_post": ["guard", "watch", "patrol"],
    "guildhall": ["guild", "craft", "trade"],
    "hammam": ["steam", "bath", "islamic"],
    "healers_house": ["healer", "medicine", "clinic"],
    "hermitage": ["solitary", "monk", "retreat"],
    "hof": ["norse", "hall", "feasting"],
    "hospice": ["palliative", "traveler", "care"],
    "hospital": ["medical", "patients", "healing"],
    "house": ["dwelling", "home", "residence"],
    "hunting_lodge": ["hunting", "seasonal", "wilderness"],
    "inn": ["traveler", "lodging", "guest"],
    "insula": ["roman", "apartment", "urban"],
    "keep": ["stronghold", "castle", "refuge"],
    "kiva": ["pueblo", "ceremony", "ritual"],
    "lazaretto": ["quarantine", "plague", "isolation"],
    "library": ["books", "study", "scholarship"],
    "lighthouse": ["navigation", "coast", "beacon"],
    "longhouse": ["communal", "viking", "hall"],
    "machiya": ["japanese", "townhouse", "merchant"],
    "madrasa": ["islamic", "quran", "religious"],
    "manor": ["estate", "landowner", "gentry"],
    "market": ["merchant", "vendors", "bazaar"],
    "martello_tower": ["coastal", "cannon", "coast"],
    "mastaba": ["egyptian", "mastaba", "superstructure"],
    "mausoleum": ["tomb", "burial", "monument"],
    "meeting_hall": ["assembly", "gathering", "civic"],
    "memorial_hall": ["memorial", "commemoration", "honor"],
    "menagerie": ["animals", "exotic", "collection"],
    "mill": ["grinding", "flour", "waterwheel"],
    "mint": ["coins", "currency", "money"],
    "monastery": ["monks", "cloister", "religious"],
    "moot_hall": ["deliberation", "council", "moot"],
    "mortuary": ["embalming", "funeral", "body"],
    "mosque": ["islamic", "congregation", "minaret"],
    "museum": ["collection", "artifacts", "exhibits"],
    "nuraghe": ["sardinian", "tower", "prehistoric"],
    "observatory": ["astronomy", "stars", "sky"],
    "orphanage": ["children", "orphans", "custodial"],
    "pagoda": ["buddhist", "tiered", "relic"],
    "palace": ["royal", "ruler", "noble"],
    "paladin_chapterhouse": ["paladin", "order", "knights"],
    "poorhouse": ["pauper", "relief", "workhouse"],
    "post_house": ["courier", "relay", "mail"],
    "printing_press": ["printing", "books", "press"],
    "prison": ["detention", "incarceration", "cells"],
    "records_hall": ["records", "archives", "state"],
    "ribat": ["frontier", "fortified", "islamic"],
    "roundhouse": ["celtic", "circular", "iron age"],
    "ryokan": ["japanese", "onsen", "ritual"],
    "salt_works": ["salt", "evaporation", "extraction"],
    "shipyard": ["ships", "boatbuilding", "harbor"],
    "shop": ["merchant", "retail", "store"],
    "siheyuan": ["courtyard", "chinese", "compound"],
    "slaughterhouse": ["butchery", "meat", "processing"],
    "stable": ["horses", "mounts", "livery"],
    "stave_church": ["norse", "wooden", "christian"],
    "sweat_lodge": ["ceremonial", "indigenous", "purification"],
    "synagogue": ["jewish", "congregation", "torah"],
    "tannery": ["leather", "hides", "tanning"],
    "tavern": ["drink", "ale", "social"],
    "teahouse": ["tea", "japanese", "ceremony"],
    "temple": ["worship", "prayer", "sacred"],
    "tenement": ["crowded", "urban", "workers"],
    "theater": ["performance", "stage", "drama"],
    "tholos": ["vaulted", "greek", "tholos"],
    "tolbooth": ["scottish", "administration", "tax"],
    "tower": ["tall", "fortified", "observation"],
    "town_hall": ["civic", "municipal", "administration"],
    "trading_factory": ["colonial", "merchant", "station"],
    "trading_post": ["frontier", "exchange", "fur"],
    "training_hall": ["martial", "drill", "combat"],
    "treasury": ["wealth", "gold", "state"],
    "warehouse": ["storage", "goods", "cargo"],
    "washhouse": ["laundry", "washing", "cleaning"],
    "watchtower": ["observation", "sentry", "lookout"],
    "waystation": ["rest", "resupply", "route"],
    "weigh_house": ["weighing", "trade", "verification"],
    "wizard_tower": ["magic", "wizard", "arcane"],
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
        functions = re.findall(r"'(\w+)'", re.search(r"functions: \[(.*?)\]", body, re.DOTALL).group(1))  # type: ignore[union-attr]
        manifestation = re.search(r"manifestationOf: '(\w+)'", body)
        entry: dict = {
            "label": label.group(1) if label else "",
            "description": description.group(1) if description else "",
            "functions": functions,
        }
        if manifestation:
            entry["manifestationOf"] = manifestation.group(1)
        entries[cid] = entry
    return entries


def inherited_terms(entries: dict[str, dict], cid: str) -> set[str]:
    entry = entries[cid]
    terms: set[str] = set()
    label = entry["label"].strip().lower()
    if label:
        terms.add(label)
    for alias in ALIASES.get(cid, []):
        terms.add(alias.strip().lower())
    for term in SEARCH_TERMS.get(cid, []):
        terms.add(term.strip().lower())
    return terms


def root_inherited_terms(entries: dict[str, dict], root_id: str) -> set[str]:
    return inherited_terms(entries, root_id)


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


def validate(entries: dict[str, dict]) -> None:
    assert len(entries) == 129, len(entries)

    for cid, entry in entries.items():
        label = entry["label"].strip().lower()
        aliases = normalize_terms(entry.get("aliases", []))
        search_terms = normalize_terms(entry.get("searchTerms", []))

        assert aliases == entry.get("aliases", []), f"{cid} aliases not normalized"
        assert search_terms == entry.get("searchTerms", []), f"{cid} searchTerms not normalized"

        alias_set = set(aliases)
        search_set = set(search_terms)
        assert not alias_set & search_set, f"{cid} alias/search overlap"
        assert label not in alias_set, f"{cid} alias equals label"

        if entry.get("manifestationOf"):
            root = entry["manifestationOf"]
            inherited = root_inherited_terms(entries, root)
            for term in aliases + search_terms:
                assert term not in inherited, f"{cid} duplicates root term '{term}' from {root}"


def apply_curation(entries: dict[str, dict]) -> dict[str, dict]:
    curated: dict[str, dict] = {}
    for cid, entry in entries.items():
        updated = dict(entry)
        if cid in ALIASES:
            updated["aliases"] = normalize_terms(ALIASES[cid])
        if cid in SEARCH_TERMS:
            updated["searchTerms"] = normalize_terms(SEARCH_TERMS[cid])
        curated[cid] = updated
    return curated


def write_shards(entries: dict[str, dict]) -> None:
    shards: dict[str, dict[str, dict]] = {
        s: {} for s in ["a-c", "d-g", "h-l", "m-p", "q-t", "u-z"]
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

    curated = apply_curation(entries)
    validate(curated)
    write_shards(curated)

    alias_count = sum(1 for e in curated.values() if e.get("aliases"))
    search_count = sum(1 for e in curated.values() if e.get("searchTerms"))
    print(f"Updated {len(curated)} entries: {alias_count} with aliases, {search_count} with searchTerms")


if __name__ == "__main__":
    main()
