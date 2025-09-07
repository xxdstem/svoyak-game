// src/components/WebSocketProvider.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { webSocketService } from '../services/websocket';

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const userToken = useSelector((state: RootState) => state.user?.token);

  useEffect(() => {
    if (userToken) {
      webSocketService.connect(userToken);
      
      const messageHandler = (message: any) => {
        console.log(message)
      };
      
      //webSocketService.addMessageHandler();

      return () => {

      };
    }
  }, [userToken, dispatch]);

  return <>{children}</>;
};

export default WebSocketProvider;