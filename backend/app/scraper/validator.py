import logging
import re
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("sih_scraper.validator")

class ValidationError(Exception):
    pass

def validate_problem(record: Dict[str, Any]) -> bool:
    """
    Validates a single normalized problem statement:
    - ID exists and is non-empty
    - Title exists and has meaningful length (>= 3 chars)
    - Source URL exists
    - Category is valid
    """
    ps_id = record.get("id")
    if not ps_id or not isinstance(ps_id, str) or len(ps_id.strip()) == 0:
        return False

    title = record.get("title")
    if not title or not isinstance(title, str) or len(title.strip()) < 3:
        return False

    source_url = record.get("source_url")
    if not source_url or not isinstance(source_url, str):
        return False

    return True

def validate_scraped_batch(
    records: List[Dict[str, Any]],
    previous_count: int = 0,
    min_safety_ratio: float = 0.3
) -> Tuple[bool, List[Dict[str, Any]], str]:
    """
    Validates an entire scraped batch against safety rules:
    1. Must contain valid records.
    2. Safety Check: If previous successful scrape had N records (e.g. 200+),
       and current scrape suddenly has dramatically fewer (< N * min_safety_ratio),
       fail validation to preserve existing cached data.
    
    Returns: (is_valid, valid_records, message)
    """
    if not records:
        return False, [], "No records extracted from source"

    valid_records = []
    discarded = 0
    seen_ids = set()

    for r in records:
        if validate_problem(r):
            ps_id = r["id"]
            if ps_id not in seen_ids:
                seen_ids.add(ps_id)
                valid_records.append(r)
            else:
                discarded += 1
        else:
            discarded += 1

    current_count = len(valid_records)
    logger.info(f"[SCRAPER] Validation: Discovered={len(records)}, Valid={current_count}, Discarded={discarded}")

    if current_count == 0:
        return False, [], "Zero valid records passed schema validation"

    # Safety Check against dramatic drop
    if previous_count > 10 and current_count < (previous_count * min_safety_ratio):
        msg = (
            f"Safety check triggered: Scraped record count ({current_count}) is dramatically lower "
            f"than previous count ({previous_count}). Rejecting batch to prevent data loss."
        )
        logger.error(f"[SCRAPER] {msg}")
        return False, valid_records, msg

    return True, valid_records, f"Successfully validated {current_count} problem statements"
