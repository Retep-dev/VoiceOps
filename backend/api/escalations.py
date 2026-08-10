import uuid
import datetime
from fastapi import APIRouter, HTTPException, Path
from typing import List, Dict
from models.escalation import EscalationDossier, ResolveEscalationRequest

router = APIRouter()

# In-memory store for human escalations
ESCALATION_STORE: Dict[str, EscalationDossier] = {}


def register_escalation(
    conversation_id: str,
    customer_id: str,
    reason: str,
    intent: str,
    transcript: list,
    actions_performed: list,
    retrieved_sources: list = None,
) -> EscalationDossier:
    esc_id = f"esc_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    dossier = EscalationDossier(
        escalation_id=esc_id,
        conversation_id=conversation_id,
        customer_id=customer_id,
        created_at=now_iso,
        status="pending",
        reason=reason,
        intent=intent,
        urgency="high" if "urgent" in reason.lower() else "normal",
        customer_profile={"customer_id": customer_id, "tier": "VIP Gold"},
        full_transcript=transcript,
        actions_performed=actions_performed,
        retrieved_knowledge_sources=retrieved_sources or [],
    )

    ESCALATION_STORE[esc_id] = dossier
    return dossier


@router.get("", response_model=List[EscalationDossier])
async def list_escalations():
    """Lists all active and historical human escalation dossiers."""
    return list(ESCALATION_STORE.values())


@router.get("/{escalation_id}", response_model=EscalationDossier)
async def get_escalation_details(escalation_id: str = Path(..., description="Escalation ID")):
    """Retrieves full structured handoff dossier for a human support agent."""
    if escalation_id not in ESCALATION_STORE:
        raise HTTPException(status_code=404, detail="Escalation dossier not found.")
    return ESCALATION_STORE[escalation_id]


@router.post("/{escalation_id}/resolve", response_model=EscalationDossier)
async def resolve_escalation(
    request: ResolveEscalationRequest,
    escalation_id: str = Path(..., description="Escalation ID"),
):
    """Resolves an escalation with human agent resolution notes."""
    if escalation_id not in ESCALATION_STORE:
        raise HTTPException(status_code=404, detail="Escalation dossier not found.")

    dossier = ESCALATION_STORE[escalation_id]
    dossier.status = "resolved"
    dossier.human_notes = request.notes
    dossier.resolved_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return dossier
