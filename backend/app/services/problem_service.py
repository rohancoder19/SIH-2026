import logging
import re
from typing import Dict, Any, List, Optional
from collections import Counter

from app.scraper.scraper import scraper_service
from app.scraper.cache import problem_cache

logger = logging.getLogger("sih_scraper.service_layer")

class ProblemService:
    """
    Business service layer orchestrating SIH problem statement caching,
    searching, filtering, statistics aggregation, and scraper refreshes.
    """
    async def ensure_data(self, force: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves problems from cache if fresh, otherwise triggers live scraper.
        """
        if force or not problem_cache.is_fresh() or len(problem_cache.get_data()) == 0:
            return await scraper_service.scrape_live(force=force)
        return problem_cache.get_data()

    async def get_all_problems(
        self,
        category: Optional[str] = None,
        theme: Optional[str] = None,
        organization: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "id",
        sort_order: Optional[str] = "asc"
    ) -> List[Dict[str, Any]]:
        """
        Retrieves all problem statements with optional filters and sorting applied.
        """
        problems = await self.ensure_data()

        # Apply category filter
        if category and category.strip().lower() not in ["all", ""]:
            cat_clean = category.strip().lower()
            problems = [p for p in problems if cat_clean in p.get("category", "").lower()]

        # Apply theme filter
        if theme and theme.strip().lower() not in ["all", ""]:
            theme_clean = theme.strip().lower()
            problems = [p for p in problems if theme_clean in p.get("theme", "").lower()]

        # Apply organization filter
        if organization and organization.strip().lower() not in ["all", ""]:
            org_clean = organization.strip().lower()
            problems = [p for p in problems if org_clean in p.get("organization", "").lower()]

        # Apply search query
        if search and search.strip():
            query = search.strip().lower()
            matched = []
            for p in problems:
                fields_to_search = [
                    p.get("id", ""),
                    p.get("title", ""),
                    p.get("description", ""),
                    p.get("organization", ""),
                    p.get("department", "") or "",
                    p.get("theme", ""),
                    p.get("category", ""),
                    p.get("expected_solution", "") or "",
                    p.get("background", "") or ""
                ]
                combined = " ".join(fields_to_search).lower()
                if query in combined:
                    matched.append(p)
            problems = matched

        # Apply sorting
        reverse = (sort_order.lower() == "desc")
        if sort_by == "serial_no":
            problems = sorted(problems, key=lambda x: x.get("serial_no") or 999999, reverse=reverse)
        elif sort_by == "title":
            problems = sorted(problems, key=lambda x: x.get("title", "").lower(), reverse=reverse)
        elif sort_by == "organization":
            problems = sorted(problems, key=lambda x: x.get("organization", "").lower(), reverse=reverse)
        elif sort_by == "category":
            problems = sorted(problems, key=lambda x: x.get("category", "").lower(), reverse=reverse)
        elif sort_by == "theme":
            problems = sorted(problems, key=lambda x: x.get("theme", "").lower(), reverse=reverse)
        elif sort_by == "id":
            # Natural sort for IDs like SIH26001
            def id_key(p):
                val = p.get("id", "")
                nums = re.findall(r'\d+', val)
                return int(nums[0]) if nums else 0
            problems = sorted(problems, key=id_key, reverse=reverse)

        return problems

    async def get_problem_by_id(self, problem_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single problem statement by ID.
        """
        await self.ensure_data()
        return problem_cache.get_by_id(problem_id)

    async def search_problems(self, query: str) -> List[Dict[str, Any]]:
        """
        Fast search across problem statements.
        """
        return await self.get_all_problems(search=query)

    async def get_status(self) -> Dict[str, Any]:
        """
        Returns real-time scraper and cache status.
        """
        return problem_cache.get_status()

    async def refresh_scraper(self) -> Dict[str, Any]:
        """
        Manually triggers a fresh scrape of the official SIH portal.
        """
        records = await scraper_service.scrape_live(force=True)
        status = problem_cache.get_status()
        return {
            "message": f"Scraper refresh completed. {len(records)} problem statements loaded.",
            "status": status
        }

    async def get_stats(self) -> Dict[str, Any]:
        """
        Calculates dynamic statistical metrics across the actual scraped dataset.
        Zero hardcoded counts.
        """
        problems = await self.ensure_data()
        total = len(problems)

        soft_count = sum(1 for p in problems if p.get("category", "").lower() == "software")
        hard_count = sum(1 for p in problems if p.get("category", "").lower() == "hardware")

        theme_counts = Counter(p.get("theme", "General") for p in problems if p.get("theme"))
        org_counts = Counter(p.get("organization", "Unknown") for p in problems if p.get("organization"))
        cat_counts = Counter(p.get("category", "Software") for p in problems if p.get("category"))

        themes_list = [{"name": k, "count": v} for k, v in theme_counts.most_common()]
        orgs_list = [{"name": k, "count": v} for k, v in org_counts.most_common()]
        cats_list = [{"name": k, "count": v} for k, v in cat_counts.most_common()]

        return {
            "total_problems": total,
            "software_count": soft_count,
            "hardware_count": hard_count,
            "theme_count": len(theme_counts),
            "organization_count": len(org_counts),
            "themes": themes_list,
            "categories": cats_list,
            "organizations": orgs_list
        }

problem_service = ProblemService()
