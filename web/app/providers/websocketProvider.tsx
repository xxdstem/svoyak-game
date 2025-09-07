// src/components/WebSocketProvider.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '~/types';
import { webSocketService } from '../services/websocket';

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const userToken = useSelector((state: RootState) => state.user?.token);
  
  useEffect(() => {
    if (userToken) {
      webSocketService.connect(userToken);

      return () => {
      };
    } else {
      webSocketService.disconnect()
    }
  }, [userToken, dispatch]);

  return <>{children}</>;
};

export default WebSocketProvider;