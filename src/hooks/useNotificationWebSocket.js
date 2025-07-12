import { useEffect, useRef } from 'react';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { getContainer } from '../core/container.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const useNotificationWebSocket = (onNotification) => {
  const { user, isAuthenticated } = useAuth();
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    try {
      const container = getContainer();
      const tokenService = container.tokenService;
      const token = tokenService.getAccessToken();
      
      // Create WebSocket connection
      ws.current = new WebSocket(`${API_ENDPOINTS.WS_BASE}/ws/notifications/?token=${token}`);
      
      ws.current.onopen = () => {
        console.log('✅ WebSocket connected for notifications');
        reconnectAttempts.current = 0;
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification' && onNotification) {
            onNotification(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.reason);
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`🔄 Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connectWebSocket();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectWebSocket();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  return {
    disconnect,
    reconnect: connectWebSocket,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
};
