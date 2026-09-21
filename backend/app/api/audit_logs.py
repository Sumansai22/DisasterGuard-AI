from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.audit_log import AuditLog

router = APIRouter()

class AuditIn(BaseModel):
    action: str
    user: str | None = None
    entity: str | None = None
    entity_id: str | None = None
    details: str | None = None

@router.get("")
def list_logs(limit: int = 100, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 500))
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()

@router.post("", status_code=201)
def create_log(payload: AuditIn, db: Session = Depends(get_db)):
    log = AuditLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
