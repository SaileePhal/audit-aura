"""
Agent System API Routes
Endpoints for multi-agent compliance workflow
"""
import uuid
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from core.agents.graph import get_compiled_graph
from core.agents.registry import get_all_incidents, get_pending_approvals, get_stats
from core.agents.auditor import perform_bulk_audit

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["agents"])


class LogPayload(BaseModel):
    """Request payload for log ingestion"""
    logs: List[Dict[str, Any]]
    incident_id: Optional[str] = None


class ResumePayload(BaseModel):
    """Request payload for resuming workflow"""
    approve: bool
    change_ticket: Optional[str] = None


async def run_workflow_background(incident_id: str, initial_state: Dict[str, Any]):
    """
    Background task to run the agent workflow.
    
    Args:
        incident_id: Unique incident identifier
        initial_state: Initial state for the workflow
    """
    try:
        graph_app = await get_compiled_graph()
        config = {"configurable": {"thread_id": incident_id}}
        
        # Run the workflow
        async for event in graph_app.astream(initial_state, config):
            logger.info(f"Workflow event for {incident_id}: {event}")
            
        logger.info(f"Workflow completed for incident {incident_id}")
        
    except Exception as e:
        logger.error(f"Workflow error for {incident_id}: {e}", exc_info=True)


@router.post("/ingest")
async def ingest_logs(payload: LogPayload, background_tasks: BackgroundTasks):
    """
    Ingest logs and trigger agent workflow.
    
    Args:
        payload: Log payload with logs and optional incident ID
        background_tasks: FastAPI background tasks
        
    Returns:
        Incident ID and status
    """
    try:
        # Generate incident ID if not provided
        incident_id = payload.incident_id or f"GIT-INC-{uuid.uuid4().hex[:8]}"
        
        # Perform bulk audit first
        evaluations = perform_bulk_audit(payload.logs)
        
        # Prepare initial state
        initial_state = {
            "incident_id": incident_id,
            "logs": payload.logs,
            "evaluations": evaluations,
            "severity": None,
            "remediation_action": None,
            "validation_status": None,
            "narrative": None,
            "offending_entity": None,
            "incident_ticket_id": None,
            "change_ticket_id": None,
            "mapped_controls": [],
            "framework": None,
            "control_id": None,
            "retry_count": 0,
            "execution_log": []
        }
        
        # Run workflow in background
        background_tasks.add_task(run_workflow_background, incident_id, initial_state)
        
        return {
            "success": True,
            "incident_id": incident_id,
            "message": f"Workflow initiated for {len(payload.logs)} log(s)",
            "evaluations_count": len(evaluations)
        }
        
    except Exception as e:
        logger.error(f"Failed to ingest logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume/{incident_id}")
async def resume_workflow(
    incident_id: str,
    payload: ResumePayload,
    background_tasks: BackgroundTasks
):
    """
    Resume a paused workflow (e.g., after approval).
    
    Args:
        incident_id: Incident ID to resume
        payload: Resume payload with approval decision
        background_tasks: FastAPI background tasks
        
    Returns:
        Status message
    """
    try:
        graph_app = await get_compiled_graph()
        config = {"configurable": {"thread_id": incident_id}}
        
        # Get current state
        state = await graph_app.aget_state(config)
        
        if not state:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Update state with approval decision
        update = {}
        if payload.approve:
            update["approval_status"] = "Approved"
        else:
            update["approval_status"] = "Rejected"
            
        if payload.change_ticket:
            update["change_ticket_id"] = payload.change_ticket
        
        # Resume workflow
        async def resume_background():
            async for event in graph_app.astream(update, config):
                logger.info(f"Resume event for {incident_id}: {event}")
        
        background_tasks.add_task(resume_background)
        
        return {
            "success": True,
            "incident_id": incident_id,
            "message": "Workflow resumed",
            "approved": payload.approve
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resume workflow: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/incidents")
async def list_incidents():
    """
    List all incidents from the registry.
    
    Returns:
        List of incidents
    """
    try:
        incidents = get_all_incidents()
        return {
            "success": True,
            "incidents": incidents,
            "count": len(incidents)
        }
    except Exception as e:
        logger.error(f"Failed to list incidents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/incidents/pending-approvals")
async def list_pending_approvals():
    """
    List incidents waiting for approval.
    
    Returns:
        List of pending incidents
    """
    try:
        incidents = get_pending_approvals()
        return {
            "success": True,
            "incidents": incidents,
            "count": len(incidents)
        }
    except Exception as e:
        logger.error(f"Failed to list pending approvals: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_incident_stats():
    """
    Get incident statistics.
    
    Returns:
        Incident statistics
    """
    try:
        stats = get_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Made with Bob
