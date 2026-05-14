import { useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';
import { useComplianceStore } from '@/store/useComplianceStore';

export const useWebSocket = () => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const addAlert = useComplianceStore((state) => state.addAlert);
  const decrementScore = useComplianceStore((state) => state.decrementScore);
  const fetchDashboard = useComplianceStore((state) => state.fetchDashboard);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Subscribe to messages
    const unsubscribeMessage = wsService.onMessage((data) => {
      // Store raw message for external handling (e.g., skill acquisition)
      setLastMessage(JSON.stringify(data));
      
      // Handle different message types
      if (data.type === 'violation' || data.type === 'violation_detected') {
        addAlert(data);
        // Decrease score based on severity
        const scoreDecrease = {
          critical: 5,
          high: 3,
          medium: 2,
          low: 1
        }[data.severity] || 2;
        decrementScore(scoreDecrease);
      } else if (data.type === 'score_update') {
        // Direct score update from backend
        useComplianceStore.setState({
          complianceScore: data.score
        });
      } else if (data.type === 'refresh') {
        // Refresh dashboard data
        fetchDashboard();
      } else if (data.type === 'skills_acquired') {
        // Skills acquired message - handled by App.tsx
        console.log('Skills acquired:', data.data?.skills);
      } else {
        // Legacy format - treat as violation
        addAlert(data);
        decrementScore(2);
      }
    });

    // Subscribe to errors
    const unsubscribeError = wsService.onError((error) => {
      console.error('WebSocket error:', error);
    });

    // Subscribe to close events
    const unsubscribeClose = wsService.onClose(() => {
      console.log('WebSocket closed, attempting reconnect...');
      // Attempt reconnect after 5 seconds
      setTimeout(() => {
        wsService.connect();
      }, 5000);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeError();
      unsubscribeClose();
      wsService.disconnect();
    };
  }, [addAlert, decrementScore, fetchDashboard]);

  return {
    isConnected: wsService.isConnected(),
    send: (message: string) => wsService.send(message),
    lastMessage,
  };
};

// Made with Bob
