import type { WsMessage } from "~/types";

type MessageHandler = (message: WsMessage) => void
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private handlers: Record<string, MessageHandler[]> = {};

  connect(token: string) {
    try {
      this.socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          this.handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
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
        this.connect(token);
      }, this.reconnectInterval);
    }
  }

  private handleMessage(message: WsMessage) {
    const { type, payload } = message;
    
    if (this.handlers[type]) {
      this.handlers[type].forEach(handler => handler(payload));
    }
    
    // Глобальные обработчики для всех сообщений
    if (this.handlers['*']) {
      this.handlers['*'].forEach(handler => handler(message));
    }
  }

  on(messageType: string, handler: MessageHandler) {
    if (!this.handlers[messageType]) {
      this.handlers[messageType] = [];
    }
    this.handlers[messageType].push(handler);
  }

  off(messageType: string, handler: MessageHandler) {
    if (this.handlers[messageType]) {
      this.handlers[messageType] = this.handlers[messageType].filter(
        h => h !== handler
      );
    }
  }

  send(message: WsMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.handlers = {};
  }

  getStatus() {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
}

export const webSocketService = new WebSocketService();