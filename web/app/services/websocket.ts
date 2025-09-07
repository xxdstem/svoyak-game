import type { WsMessage } from "~/types";

// src/services/websocketService.ts
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: Record<string, (message: WsMessage) => void> = {};

  connect(token: string) {
    try {
      this.socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          const handler = this.messageHandlers[message.type]
          if(handler) handler(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(token);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting attempt ${this.reconnectAttempts}`);
        this.connect(token);
      }, this.reconnectInterval);
    }
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  addMessageHandler(type:string, handler: (message: WsMessage) => void) {
    this.messageHandlers[type] = handler;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers = {};
  }

  getStatus() {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
}

export const webSocketService = new WebSocketService();