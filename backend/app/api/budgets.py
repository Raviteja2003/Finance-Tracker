from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.api.deps import get_current_user
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, CopyPreviousMonthRequest
from app.services import budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=list[BudgetResponse])
def list_budgets(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return budget_service.get_budgets_for_month(db, current_user.id, year, month)


@router.post("/", response_model=BudgetResponse, status_code=201)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return budget_service.create_budget(db, current_user.id, payload)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return budget_service.update_budget(db, current_user.id, budget_id, payload)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    budget_service.delete_budget(db, current_user.id, budget_id)


@router.post("/copy-previous-month", response_model=list[BudgetResponse])
def copy_previous_month(
    payload: CopyPreviousMonthRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return budget_service.copy_previous_month(db, current_user.id, payload.year, payload.month)