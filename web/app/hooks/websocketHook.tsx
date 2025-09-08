import { useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocket';

export const useWebSocketMessages = () => {
  const subscribe = useCallback((
    messageType: string,
    handler: (payload: any) => void
  ) => {
    webSocketService.on(messageType, handler);
    
    return () => {
      webSocketService.off(messageType, handler);
    };
  }, [webSocketService]);

  const sendMessage = useCallback((type: string, payload: any) => {
    webSocketService.send({ type, payload });
  }, [webSocketService]);

  return { subscribe, sendMessage };
};