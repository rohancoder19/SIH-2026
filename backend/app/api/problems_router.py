from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Query, HTTPException, status

from app.services.problem_service import problem_service
from app.schemas.schemas import (
    SIHProblemOut,
    ScraperStatusResponse,
    ProblemStats,
    HealthResponse
)

router = APIRouter(tags=["SIH 2026 Problem Statements & Scraper"])

@router.get("/api/problems", response_model=List[SIHProblemOut])
async def list_problems(
    category: Optional[str] = Query(None, description="Filter by Category (e.g. Software, Hardware)"),
    theme: Optional[str] = Query(None, description="Filter by Theme"),
    organization: Optional[str] = Query(None, description="Filter by Organization / Ministry"),
    search: Optional[str] = Query(None, description="Search query across problem fields"),
    sort_by: Optional[str] = Query("id", description="Sort by field: id, title, organization, category, theme, serial_no"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc")
):
    """
    Returns all currently available SIH 2026 problem statements extracted from official source.
    """
    return await problem_service.get_all_problems(
        category=category,
        theme=theme,
        organization=organization,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/api/problems/search", response_model=List[SIHProblemOut])
async def search_problems(
    q: str = Query(..., min_length=1, description="Search term for SIH problem statements")
):
    """
    Searches title, description, organization, theme, category, and ID.
    """
    return await problem_service.search_problems(query=q)

@router.get("/api/problems/filter", response_model=List[SIHProblemOut])
async def filter_problems(
    category: Optional[str] = Query(None),
    theme: Optional[str] = Query(None),
    organization: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("id"),
    sort_order: Optional[str] = Query("asc")
):
    """
    Filtered and sorted problem statement query endpoint.
    """
    return await problem_service.get_all_problems(
        category=category,
        theme=theme,
        organization=organization,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/api/problems/stats", response_model=ProblemStats)
async def get_problem_stats():
    """
    Returns dynamically calculated statistics across the live scraped SIH problem dataset.
    """
    return await problem_service.get_stats()

@router.get("/api/problems/{problem_id}", response_model=SIHProblemOut)
async def get_problem_by_id(problem_id: str):
    """
    Returns a single problem statement by ID (e.g. SIH26001).
    """
    problem = await problem_service.get_problem_by_id(problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem statement with ID '{problem_id}' not found"
        )
    return problem

@router.get("/api/scraper/status", response_model=ScraperStatusResponse)
async def get_scraper_status():
    """
    Returns the real-time operational status, cache age, source URL, and total records.
    """
    return await problem_service.get_status()

@router.post("/api/scraper/refresh")
async def trigger_scraper_refresh():
    """
    Manually triggers an immediate scraper refresh against the official SIH portal.
    """
    return await problem_service.refresh_scraper()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    System Health Check endpoint.
    """
    scraper_status = await problem_service.get_status()
    return {
        "status": "ok",
        "scraper": scraper_status.get("status", "available"),
        "database": "connected",
        "total_problems_in_cache": scraper_status.get("total_problems", 0),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
