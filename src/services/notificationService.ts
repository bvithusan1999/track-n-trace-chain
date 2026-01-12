/**
 * WebSocket Notification Service
 * Manages real-time notifications via WebSocket connection
 */

import { useAppStore } from "@/lib/store";

export type NotificationType =
  | "SHIPMENT_CREATED"
  | "SHIPMENT_ACCEPTED"
  | "SHIPMENT_IN_TRANSIT"
  | "SHIPMENT_DELIVERED"
  | "SHIPMENT_CANCELLED"
  | "SEGMENT_CREATED"
  | "SEGMENT_ASSIGNED"
  | "SEGMENT_ACCEPTED"
  | "SEGMENT_TAKEOVER"
  | "SEGMENT_HANDOVER"
  | "SEGMENT_DELIVERED"
  | "PACKAGE_CREATED"
  | "PACKAGE_ACCEPTED"
  | "PACKAGE_DELIVERED"
  | "CONDITION_BREACH"
  | "TEMPERATURE_BREACH"
  | "TIME_BREACH"
  | "SYSTEM_ALERT"
  | "USER_MENTION";

export type NotificationSeverity =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  shipmentId?: string;
  segmentId?: string;
  packageId?: string;
  breachId?: string;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  createdAt: string;
  expiresAt?: string;
};

export type WebSocketMessage = {
  type:
    | "NEW_NOTIFICATION"
    | "UNREAD_COUNT"
    | "AUTH_SUCCESS"
    | "AUTH_ERROR"
    | "PONG";
  data?: Notification;
  count?: number;
  userId?: string;
  message?: string;
};

class NotificationService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isManualClose = false;

  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws/notifications`;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.token = token;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected");
          this.reconnectAttempts = 0;

          // Send authentication
          if (this.token) {
            this.ws?.send(
              JSON.stringify({
                type: "AUTH",
                token: this.token,
              })
            );
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);

            if (message.type === "AUTH_SUCCESS") {
              resolve();
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          if (!this.isManualClose) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.token && !this.isManualClose) {
        this.connect(this.token).catch(console.error);
      }
    }, delay);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "NEW_NOTIFICATION":
        if (message.data) {
          this.emit("notification", message.data);
          console.log("📬 New notification received:", message.data);
        }
        break;

      case "UNREAD_COUNT":
        this.emit("unread_count", message.count);
        break;

      case "AUTH_SUCCESS":
        console.log("✅ WebSocket authenticated");
        this.emit("auth_success", message.userId);
        break;

      case "AUTH_ERROR":
        console.error("❌ Authentication error:", message.message);
        this.emit("auth_error", message.message);
        break;

      case "PONG":
        this.emit("pong", null);
        break;
    }
  }

  /**
   * Send ping to keep connection alive
   */
  public ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "PING" }));
    }
  }

  /**
   * Subscribe to notifications
   */
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
