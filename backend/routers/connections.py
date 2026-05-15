"""
Cloud Connections API Router
Endpoints for managing cloud provider connections
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from models.cloud_connection import (
    CloudConnectionCreate,
    CloudConnectionUpdate,
    CloudConnectionResponse,
    ConnectionListResponse,
    ConnectionTestRequest,
    ConnectionTestResponse,
    CloudProvider
)
from infrastructure.cloud.connection_manager import get_connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("", response_model=CloudConnectionResponse, status_code=201)
async def create_connection(connection: CloudConnectionCreate):
    """
    Create a new cloud provider connection
    
    Args:
        connection: Connection creation data
        
    Returns:
        Created connection details
    """
    try:
        manager = get_connection_manager()
        result = manager.create_connection(connection)
        logger.info(f"Created connection: {result.name}")
        return result
    except ValueError as e:
        logger.error(f"Failed to create connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("", response_model=ConnectionListResponse)
async def list_connections(
    provider: Optional[CloudProvider] = Query(None, description="Filter by provider"),
    enabled_only: bool = Query(False, description="Only return enabled connections")
):
    """
    List all cloud provider connections
    
    Args:
        provider: Optional provider filter
        enabled_only: Only return enabled connections
        
    Returns:
        List of connections
    """
    try:
        manager = get_connection_manager()
        connections = manager.list_connections(provider=provider, enabled_only=enabled_only)
        return ConnectionListResponse(
            connections=connections,
            total=len(connections)
        )
    except Exception as e:
        logger.error(f"Failed to list connections: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{connection_id}", response_model=CloudConnectionResponse)
async def get_connection(connection_id: str):
    """
    Get a specific connection by ID
    
    Args:
        connection_id: Connection ID
        
    Returns:
        Connection details
    """
    try:
        manager = get_connection_manager()
        connection = manager.get_connection(connection_id)
        
        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        return connection
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/{connection_id}", response_model=CloudConnectionResponse)
async def update_connection(connection_id: str, update: CloudConnectionUpdate):
    """
    Update a connection
    
    Args:
        connection_id: Connection ID
        update: Update data
        
    Returns:
        Updated connection details
    """
    try:
        manager = get_connection_manager()
        result = manager.update_connection(connection_id, update)
        logger.info(f"Updated connection: {connection_id}")
        return result
    except ValueError as e:
        logger.error(f"Failed to update connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error updating connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{connection_id}", status_code=204)
async def delete_connection(connection_id: str):
    """
    Delete a connection
    
    Args:
        connection_id: Connection ID
    """
    try:
        manager = get_connection_manager()
        deleted = manager.delete_connection(connection_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        logger.info(f"Deleted connection: {connection_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/test", response_model=ConnectionTestResponse)
async def test_connection(request: ConnectionTestRequest):
    """
    Test a connection (existing or new configuration)
    
    Args:
        request: Test request with connection ID or new config
        
    Returns:
        Test result
    """
    try:
        manager = get_connection_manager()
        
        if request.connection_id:
            # Test existing connection
            result = await manager.test_connection(request.connection_id)
        elif request.config and request.provider:
            # Test new configuration without saving
            # Create a temporary connection for testing
            from models.cloud_connection import CloudConnectionCreate
            temp_connection = CloudConnectionCreate(
                name="temp_test",
                provider=request.provider,
                config=request.config,
                enabled=False
            )
            created = manager.create_connection(temp_connection)
            result = await manager.test_connection(created.id)
            # Delete temporary connection
            manager.delete_connection(created.id)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either connection_id or both config and provider must be provided"
            )
        
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Failed to test connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error testing connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{connection_id}/test", response_model=ConnectionTestResponse)
async def test_existing_connection(connection_id: str):
    """
    Test an existing connection
    
    Args:
        connection_id: Connection ID
        
    Returns:
        Test result
    """
    try:
        manager = get_connection_manager()
        result = await manager.test_connection(connection_id)
        return result
    except ValueError as e:
        logger.error(f"Failed to test connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error testing connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{connection_id}/enable", response_model=CloudConnectionResponse)
async def enable_connection(connection_id: str):
    """
    Enable a connection
    
    Args:
        connection_id: Connection ID
        
    Returns:
        Updated connection details
    """
    try:
        manager = get_connection_manager()
        update = CloudConnectionUpdate(enabled=True)
        result = manager.update_connection(connection_id, update)
        logger.info(f"Enabled connection: {connection_id}")
        return result
    except ValueError as e:
        logger.error(f"Failed to enable connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error enabling connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{connection_id}/disable", response_model=CloudConnectionResponse)
async def disable_connection(connection_id: str):
    """
    Disable a connection
    
    Args:
        connection_id: Connection ID
        
    Returns:
        Updated connection details
    """
    try:
        manager = get_connection_manager()
        update = CloudConnectionUpdate(enabled=False)
        result = manager.update_connection(connection_id, update)
        logger.info(f"Disabled connection: {connection_id}")
        return result
    except ValueError as e:
        logger.error(f"Failed to disable connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error disabling connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


class ConnectionStatsResponse(BaseModel):
    """Response model for connection statistics"""
    total_connections: int
    active_connections: int
    inactive_connections: int
    error_connections: int
    total_events_processed: int
    connections_by_provider: dict


@router.get("/stats/summary", response_model=ConnectionStatsResponse)
async def get_connection_stats():
    """
    Get connection statistics summary
    
    Returns:
        Connection statistics
    """
    try:
        manager = get_connection_manager()
        connections = manager.list_connections()
        
        stats = {
            'total_connections': len(connections),
            'active_connections': sum(1 for c in connections if c.status == 'active'),
            'inactive_connections': sum(1 for c in connections if c.status == 'inactive'),
            'error_connections': sum(1 for c in connections if c.status == 'error'),
            'total_events_processed': sum(c.events_processed for c in connections),
            'connections_by_provider': {}
        }
        
        # Count by provider
        for conn in connections:
            provider = conn.provider.value
            stats['connections_by_provider'][provider] = \
                stats['connections_by_provider'].get(provider, 0) + 1
        
        return ConnectionStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Failed to get connection stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/cleanup/corrupted", status_code=200)
async def cleanup_corrupted_connections():
    """
    Remove connections that cannot be decrypted (due to encryption key mismatch)
    
    Returns:
        Number of connections removed
    """
    try:
        manager = get_connection_manager()
        connections = list(manager.connections.values())
        removed_count = 0
        
        for conn in connections:
            try:
                # Try to decrypt the config
                manager.get_decrypted_config(conn.id)
            except ValueError:
                # Cannot decrypt - remove this connection
                manager.delete_connection(conn.id)
                removed_count += 1
                logger.info(f"Removed corrupted connection: {conn.name} ({conn.id})")
        
        return {
            "message": f"Removed {removed_count} corrupted connection(s)",
            "removed_count": removed_count
        }
    except Exception as e:
        logger.error(f"Failed to cleanup corrupted connections: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Made with Bob