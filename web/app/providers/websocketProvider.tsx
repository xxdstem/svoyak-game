// src/components/WebSocketProvider.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '~/types';
import { webSocketService } from '../services/websocket';

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userToken = useSelector((state: RootState) => state.user?.token);
  
  useEffect(() => {
    if (userToken) {
      webSocketService.connect(userToken);

      return () => {
        webSocketService.disconnect()
      };
    } else {
      webSocketService.disconnect()
    }
  }, [userToken]);

  return <>{children}</>;
};

export default WebSocketProvider;