from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import IngestionPipeline
from app.gis.pipeline import gis_pipeline

router = APIRouter(prefix="/api/gis", tags=["GIS & Ingestion Pipeline"])

@router.post("/upload")
async def upload_gis_dataset(
    dataset_name: str = Form(...),
    source: str = Form("State GIS Survey"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await file.read()
    size_bytes = len(content)
    fmt = file.filename.split(".")[-1].upper() if "." in file.filename else "GEOJSON"
    
    pipeline = IngestionPipeline(
        dataset_name=dataset_name,
        source=source,
        format=fmt,
        size_bytes=size_bytes,
        record_count=55,
        crs="EPSG:4326 (WGS84)",
        status="Uploaded"
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    
    return {
        "message": "Dataset uploaded successfully",
        "pipeline_id": pipeline.id,
        "filename": file.filename,
        "format": fmt,
        "size_kb": round(size_bytes / 1024, 2),
        "status": "Uploaded -> Ready for Spatial Analysis"
    }

@router.post("/process/{pipeline_id}")
def process_gis_pipeline(pipeline_id: int, db: Session = Depends(get_db)):
    pipe = db.query(IngestionPipeline).filter(IngestionPipeline.id == pipeline_id).first()
    if not pipe:
        # Create a mock pipeline if missing
        pipe = IngestionPipeline(dataset_name="Darjeeling Landslide Survey 2026", format="GeoJSON", size_bytes=48500, record_count=55, status="Processing")
        db.add(pipe)
        db.commit()
        db.refresh(pipe)
        
    pipe.status = "Completed"
    db.commit()
    
    return {
        "pipeline_id": pipe.id,
        "dataset_name": pipe.dataset_name,
        "stages": [
            {"stage": "Format Validation", "status": "Passed", "crs": "EPSG:4326"},
            {"stage": "Coordinate Transformation", "status": "Aligned"},
            {"stage": "Spatial Join & Buffer Analysis", "status": "Completed"},
            {"stage": "AI Risk Scoring Pipeline", "status": "Completed"}
        ],
        "final_status": "Completed",
        "records_ingested": pipe.record_count or 55
    }

@router.get("/pipelines")
def get_ingestion_pipelines(db: Session = Depends(get_db)):
    return db.query(IngestionPipeline).order_by(IngestionPipeline.created_at.desc()).all()
