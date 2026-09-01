import logging
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup, Tag

logger = logging.getLogger("sih_scraper.parser")

def extract_problem_ids(soup: BeautifulSoup) -> List[str]:
    """
    Extracts all discovered problem statement IDs from the HTML document.
    """
    problem_ids = []
    # Search table cells and text patterns for SIH ID formats like SIH26001, SIH-26001, 26001
    table = soup.find("table", {"id": "dataTablePS"}) or soup.find("table")
    if table:
        tbody = table.find("tbody") or table
        for tr in tbody.find_all("tr", recursive=False):
            tds = tr.find_all("td", recursive=False)
            if len(tds) >= 5:
                ps_num_text = tds[4].get_text(strip=True)
                if ps_num_text:
                    if not ps_num_text.upper().startswith("SIH"):
                        ps_num_text = f"SIH{ps_num_text}"
                    problem_ids.append(ps_num_text)
    
    if not problem_ids:
        # Fallback regex search across entire HTML
        raw_ids = re.findall(r'\b(?:SIH)?(26\d{3})\b', soup.get_text())
        for raw_id in set(raw_ids):
            problem_ids.append(f"SIH{raw_id}" if not raw_id.startswith("SIH") else raw_id)
            
    return list(dict.fromkeys(problem_ids))

def extract_problem_details(modal_elem: Tag) -> Dict[str, Any]:
    """
    Extracts detailed key-value fields from inner modal dialog or embedded structure.
    """
    details: Dict[str, Any] = {}
    if not modal_elem:
        return details

    # Look for table rows or definition rows inside modal
    rows = modal_elem.find_all("tr")
    for tr in rows:
        tds = tr.find_all(["td", "th"])
        if len(tds) >= 2:
            key = tds[0].get_text(strip=True).rstrip(":").strip()
            val = tds[1].get_text(separator="\n", strip=True)
            details[key] = val
        elif len(tds) == 1:
            text = tds[0].get_text(strip=True)
            if ":" in text:
                parts = text.split(":", 1)
                details[parts[0].strip()] = parts[1].strip()

    # Look for specific link tags inside modal
    links = []
    for a in modal_elem.find_all("a", href=True):
        href = a.get("href", "").strip()
        link_text = a.get_text(strip=True)
        if href and not href.startswith("#") and not href.startswith("javascript:"):
            links.append({"title": link_text or "Reference Link", "url": href})
    if links:
        details["_extracted_links"] = links

    return details

def parse_problem_statement(tr: Tag, source_url: str = "") -> Optional[Dict[str, Any]]:
    """
    Parses a single HTML table row containing an SIH Problem Statement.
    Tolerates missing fields and structural variations.
    """
    tds = tr.find_all("td", recursive=False)
    if not tds or len(tds) < 3:
        return None

    try:
        # Extract direct column values from main table
        # Standard SIH table layout:
        # TD 0: S.No.
        # TD 1: Organization
        # TD 2: Title & Details Modal
        # TD 3: Category (Software/Hardware)
        # TD 4: PS Number (SIH26001)
        # TD 5: Submitted Idea(s) Count (0/500)
        # TD 6: Theme (Disaster Management)
        # TD 7: Deadline for Idea Submission (20 September 2026)

        # 1. Serial Number
        serial_raw = tds[0].get_text(strip=True)
        serial_no = int(re.sub(r'[^\d]', '', serial_raw)) if re.search(r'\d', serial_raw) else None

        # 2. Organization
        organization = tds[1].get_text(strip=True) if len(tds) > 1 else ""

        # 3. TD 2 contains Title & Modal with Description & Department
        td2 = tds[2]
        modal_div = td2.find("div", class_=lambda c: c and "modal" in c) or td2.find("div")
        modal_details = extract_problem_details(modal_div) if modal_div else {}

        # Extract title: prefer modal title or td2 title link text
        title = modal_details.get("Problem Statement Title", "")
        if not title:
            # Check for anchor tag or direct text in TD 2
            a_tag = td2.find("a")
            if a_tag:
                title = a_tag.get_text(strip=True)
            else:
                title = td2.get_text(strip=True)

        # 4. Category
        category = tds[3].get_text(strip=True) if len(tds) > 3 else modal_details.get("Category", "Software")

        # 5. Problem Statement ID
        ps_id = tds[4].get_text(strip=True) if len(tds) > 4 else modal_details.get("Problem Statement ID", "")
        if not ps_id:
            ps_id = modal_details.get("Problem Statement ID", "")
        
        # Normalize ID format (e.g. 26001 -> SIH26001)
        ps_id = ps_id.strip()
        if ps_id and not ps_id.upper().startswith("SIH") and ps_id.isdigit():
            ps_id = f"SIH{ps_id}"

        # 6. Submitted Ideas Count
        submitted_ideas = tds[5].get_text(strip=True) if len(tds) > 5 else modal_details.get("Submitted Idea(s) Count", None)

        # 7. Theme
        theme = tds[6].get_text(strip=True) if len(tds) > 6 else modal_details.get("Theme", "General")

        # 8. Deadline
        deadline = tds[7].get_text(strip=True) if len(tds) > 7 else modal_details.get("Deadline for Idea Submission", None)

        # Extract Description, Background, and Expected Solution from modal details or description text
        raw_description = modal_details.get("Description", "") or modal_details.get("Problem Description", "")
        background = modal_details.get("Background", "") or modal_details.get("Problem Background", "")
        expected_solution = modal_details.get("Expected Solution", "") or modal_details.get("Solution", "")
        department = modal_details.get("Department", organization)

        # Regex / Keyword splitting if all text is embedded in raw_description
        if not background or not expected_solution:
            full_text = raw_description
            bg_match = re.search(r'(?:Background|•\s*Background)[:\s]*(.*?)(?=(?:Description|•\s*Description|Expected Solution|•\s*Expected Solution|$))', full_text, re.DOTALL | re.IGNORECASE)
            desc_match = re.search(r'(?:Description|•\s*Description)[:\s]*(.*?)(?=(?:Expected Solution|•\s*Expected Solution|Background|•\s*Background|$))', full_text, re.DOTALL | re.IGNORECASE)
            sol_match = re.search(r'(?:Expected Solution|•\s*Expected Solution)[:\s]*(.*?)(?=$)', full_text, re.DOTALL | re.IGNORECASE)

            if bg_match and not background:
                background = bg_match.group(1).strip()
            if sol_match and not expected_solution:
                expected_solution = sol_match.group(1).strip()
            if desc_match and desc_match.group(1).strip():
                raw_description = desc_match.group(1).strip()
        
        # Build references list
        references = []
        if "_extracted_links" in modal_details:
            references.extend(modal_details["_extracted_links"])
        
        for key in ["Youtube Link", "Dataset Link", "Reference"]:
            link_val = modal_details.get(key, "").strip()
            if link_val and link_val.startswith("http"):
                references.append({"title": key, "url": link_val})

        return {
            "id": ps_id,
            "serial_no": serial_no,
            "title": title,
            "organization": organization,
            "department": department,
            "category": category,
            "theme": theme,
            "description": raw_description or title,
            "background": background,
            "expected_solution": expected_solution,
            "deadline": deadline,
            "submitted_ideas": submitted_ideas,
            "references": references,
            "source_url": source_url,
            "scraped_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.warning(f"Error parsing row: {e}")
        return None

def parse_sih_html(html_content: str, source_url: str = "") -> List[Dict[str, Any]]:
    """
    Main entry point for parsing full SIH HTML document.
    Discovers all problem statements within tables and modal structures.
    """
    if not html_content or not html_content.strip():
        logger.error("Empty HTML content provided to parse_sih_html")
        return []

    soup = BeautifulSoup(html_content, "html.parser")
    
    # Try finding dataTablePS first, or any main table
    main_table = soup.find("table", {"id": "dataTablePS"}) or soup.find("table")
    if not main_table:
        logger.warning("No table found in SIH HTML content")
        return []

    tbody = main_table.find("tbody") or main_table
    direct_trs = tbody.find_all("tr", recursive=False)
    
    # If no direct children found or only 1, fallback to all TRs with multiple TDs
    if len(direct_trs) <= 1:
        direct_trs = [tr for tr in main_table.find_all("tr") if len(tr.find_all("td")) >= 3]

    parsed_problems = []
    for tr in direct_trs:
        parsed = parse_problem_statement(tr, source_url=source_url)
        if parsed and parsed.get("id"):
            parsed_problems.append(parsed)

    logger.info(f"Successfully extracted {len(parsed_problems)} problem statement records from HTML")
    return parsed_problems
