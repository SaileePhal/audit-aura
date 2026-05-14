"""
Messaging Layer
WebSocket, notifications, and external messaging services
"""

from .websocket import WebSocketManager
from .notifications import NotificationService
from .slack import SlackNotifier

__all__ = [
    "WebSocketManager",
    "NotificationService",
    "SlackNotifier",
]