import html
import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger("sih_scraper.normalizer")

def fix_encoding(text: str) -> str:
    """
    Fixes malformed UTF-8 / Windows-1252 character artifacts (mojibake).
    For example: Indiaâ€™s -> India's
    """
    if not text:
        return ""
    replacements = {
        "â€™": "'",
        "â€˜": "'",
        "â€œ": '"',
        "â€\x9d": '"',
        "â€": '"',
        "â€“": "–",
        "â€”": "—",
        "â€¢": "•",
        "Ã¢â‚¬â„¢": "'",
        "Ã¢â‚¬Å“": '"',
        "Ã¢â‚¬ï¿½": '"',
        "Â": "",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text

def clean_text(text: Optional[str]) -> str:
    """
    Cleans raw scraped text:
    - Fixes malformed UTF-8 / Windows-1252 characters (mojibake)
    - Decodes HTML entities (&amp;, &quot;, &#39;, &nbsp;, etc.)
    - Removes zero-width and unprintable characters
    - Normalizes line breaks and whitespace
    - Preserves bullet points and indentation structure
    """
    if text is None:
        return ""
    
    # 1. Fix broken encoding artifacts
    cleaned = fix_encoding(str(text))

    # 2. Decode HTML entities
    cleaned = html.unescape(cleaned)
    # Replace non-breaking spaces and special unicode spaces
    cleaned = cleaned.replace('\xa0', ' ').replace('\u200b', '').replace('\ufeff', '')
    # Normalize carriage returns
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse multiple consecutive empty lines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    # Collapse multiple inline spaces while keeping newlines
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in cleaned.split('\n')]
    cleaned = '\n'.join(lines).strip()
    return cleaned

def normalize_category(category: Optional[str]) -> str:
    if not category:
        return "Software"
    cat_lower = category.strip().lower()
    if "hard" in cat_lower:
        return "Hardware"
    if "soft" in cat_lower:
        return "Software"
    return category.strip()

def normalize_problem(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a single scraped problem statement record into internal standard schema.
    """
    ps_id = clean_text(record.get("id", ""))
    if ps_id and not ps_id.upper().startswith("SIH") and ps_id.isdigit():
        ps_id = f"SIH{ps_id}"

    title = clean_text(record.get("title", ""))
    org = clean_text(record.get("organization", ""))
    dept = clean_text(record.get("department", "")) or org
    cat = normalize_category(record.get("category", "Software"))
    theme = clean_text(record.get("theme", "General")) or "General"
    desc = clean_text(record.get("description", ""))
    background = clean_text(record.get("background", ""))
    expected_sol = clean_text(record.get("expected_solution", ""))
    deadline = clean_text(record.get("deadline", "")) or None
    submitted_ideas = clean_text(record.get("submitted_ideas", "")) or None
    source_url = clean_text(record.get("source_url", ""))
    scraped_at = record.get("scraped_at", "")

    # Sanitize references
    raw_refs = record.get("references", [])
    clean_refs = []
    if isinstance(raw_refs, list):
        for ref in raw_refs:
            if isinstance(ref, dict) and ref.get("url"):
                clean_refs.append({
                    "title": clean_text(ref.get("title", "Reference")),
                    "url": clean_text(ref.get("url", ""))
                })
            elif isinstance(ref, str) and ref.startswith("http"):
                clean_refs.append({
                    "title": "Reference Link",
                    "url": clean_text(ref)
                })

    serial_no = record.get("serial_no")
    if serial_no is not None:
        try:
            serial_no = int(serial_no)
        except (ValueError, TypeError):
            serial_no = None

    return {
        "id": ps_id,
        "serial_no": serial_no,
        "title": title,
        "organization": org,
        "department": dept,
        "category": cat,
        "theme": theme,
        "description": desc or title,
        "background": background,
        "expected_solution": expected_sol,
        "deadline": deadline,
        "submitted_ideas": submitted_ideas,
        "references": clean_refs,
        "source_url": source_url,
        "scraped_at": scraped_at
    }

def deduplicate_problems(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deduplicates problem statements based on official problem statement ID.
    If duplicates occur, keeps the record with the most complete data.
    """
    unique_dict: Dict[str, Dict[str, Any]] = {}
    duplicate_count = 0

    for rec in records:
        normalized = normalize_problem(rec)
        ps_id = normalized.get("id")
        if not ps_id:
            continue

        if ps_id in unique_dict:
            duplicate_count += 1
            existing = unique_dict[ps_id]
            # Calculate completeness score based on string lengths of key fields
            curr_score = len(normalized.get("description", "")) + len(normalized.get("expected_solution", "")) + len(normalized.get("background", ""))
            prev_score = len(existing.get("description", "")) + len(existing.get("expected_solution", "")) + len(existing.get("background", ""))
            if curr_score > prev_score:
                logger.info(f"Replacing duplicate record {ps_id} with more complete version")
                unique_dict[ps_id] = normalized
        else:
            unique_dict[ps_id] = normalized

    if duplicate_count > 0:
        logger.info(f"[SCRAPER] Resolved and deduplicated {duplicate_count} duplicate records")

    return list(unique_dict.values())
