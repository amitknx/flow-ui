import { Client, FrameImpl } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';

// Use FrameImpl as Frame type
type Frame = FrameImpl;
import type { ExecutionSnapshot, StepExecution } from '../types/workflow';

export interface WebSocketMessage {
  type: 'EXECUTION_UPDATE' | 'STEP_UPDATE' | 'EXECUTION_COMPLETE';
  payload: ExecutionSnapshot | StepExecution;
  timestamp: string;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, string>();
  private eventHandlers = new Set<WebSocketEventHandler>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: this.onConnect.bind(this),
      onDisconnect: this.onDisconnect.bind(this),
      onStompError: this.onError.bind(this),
    });
  }

  private onConnect(frame: Frame) {
    console.log('[WebSocket] Connected:', frame);
    this.reconnectAttempts = 0;
    
    // Resubscribe to all topics after reconnection
    this.resubscribeAll();
  }

  private onDisconnect() {
    console.log('[WebSocket] Disconnected');
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    }
  }

  private onError(frame: Frame) {
    console.error('[WebSocket] Error:', frame);
  }

  private resubscribeAll() {
    if (!this.client?.connected) return;

    // Re-establish all subscriptions
    const currentSubscriptions = new Map(this.subscriptions);
    this.subscriptions.clear();
    
    currentSubscriptions.forEach((subscriptionId, topic) => {
      this.subscribeToTopic(topic);
    });
  }

  private subscribeToTopic(topic: string): string | null {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Cannot subscribe - not connected');
      return null;
    }

    try {
      const subscription = this.client.subscribe(topic, (message) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message.body);
          this.notifyHandlers(parsedMessage);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      this.subscriptions.set(topic, subscription.id);
      console.log(`[WebSocket] Subscribed to ${topic}`);
      return subscription.id;
    } catch (error) {
      console.error(`[WebSocket] Failed to subscribe to ${topic}:`, error);
      return null;
    }
  }

  private notifyHandlers(message: WebSocketMessage) {
    this.eventHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('[WebSocket] Handler error:', error);
      }
    });
  }

  // Public API
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      const onConnect = () => {
        this.client?.off('connect', onConnect);
        this.client?.off('error', onError);
        resolve();
      };

      const onError = (error: any) => {
        this.client?.off('connect', onConnect);
        this.client?.off('error', onError);
        reject(error);
      };

      this.client?.on('connect', onConnect);
      this.client?.on('error', onError);
      this.client?.activate();
    });
  }

  disconnect(): void {
    this.subscriptions.clear();
    this.client?.deactivate();
  }

  subscribeToExecution(workflowId: string, executionId: string): () => void {
    const topic = `/topic/workflows/${workflowId}/executions/${executionId}`;
    const subscriptionId = this.subscribeToTopic(topic);
    
    // Return unsubscribe function
    return () => {
      if (subscriptionId && this.client?.connected) {
        this.client.unsubscribe(subscriptionId);
        this.subscriptions.delete(topic);
        console.log(`[WebSocket] Unsubscribed from ${topic}`);
      }
    };
  }

  subscribeToWorkflow(workflowId: string): () => void {
    const topic = `/topic/workflows/${workflowId}`;
    const subscriptionId = this.subscribeToTopic(topic);
    
    // Return unsubscribe function
    return () => {
      if (subscriptionId && this.client?.connected) {
        this.client.unsubscribe(subscriptionId);
        this.subscriptions.delete(topic);
        console.log(`[WebSocket] Unsubscribed from ${topic}`);
      }
    };
  }

  addEventListener(handler: WebSocketEventHandler): () => void {
    this.eventHandlers.add(handler);
    
    // Return remove function
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  get isConnected(): boolean {
    return this.client?.connected || false;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
