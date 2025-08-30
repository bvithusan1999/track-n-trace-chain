import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, ProductMeta, TelemetryPoint, Alert, Shipment } from '@/types';

interface AppState {
  // User & Auth
  user: UserProfile | null;
  isConnected: boolean;
  walletAddress: `0x${string}` | null;
  
  // Products
  products: ProductMeta[];
  selectedProduct: ProductMeta | null;
  
  // Telemetry
  telemetryData: Record<string, TelemetryPoint[]>;
  
  // Alerts
  alerts: Alert[];
  unreadAlertsCount: number;
  
  // Shipments
  shipments: Shipment[];
  
  // Settings
  temperatureUnit: 'C' | 'F';
  darkMode: boolean;
  realtimeSource: 'WebSocket' | 'MQTT' | 'Mock';
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setWalletConnection: (address: `0x${string}` | null) => void;
  addProduct: (product: ProductMeta) => void;
  updateProduct: (id: string, updates: Partial<ProductMeta>) => void;
  setSelectedProduct: (product: ProductMeta | null) => void;
  addTelemetryPoint: (productId: string, point: TelemetryPoint) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (alertId: string) => void;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  setTemperatureUnit: (unit: 'C' | 'F') => void;
  setDarkMode: (enabled: boolean) => void;
  setRealtimeSource: (source: 'WebSocket' | 'MQTT' | 'Mock') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isConnected: false,
      walletAddress: null,
      products: [],
      selectedProduct: null,
      telemetryData: {},
      alerts: [],
      unreadAlertsCount: 0,
      shipments: [],
      temperatureUnit: 'C',
      darkMode: false,
      realtimeSource: 'Mock',

      // Actions
      setUser: (user) => set({ user }),
      
      setWalletConnection: (address) => set({ 
        walletAddress: address, 
        isConnected: !!address 
      }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      
      addTelemetryPoint: (productId, point) => set((state) => {
        const existing = state.telemetryData[productId] || [];
        const updated = [...existing, point].slice(-100); // Keep last 100 points
        return {
          telemetryData: {
            ...state.telemetryData,
            [productId]: updated
          }
        };
      }),
      
      addAlert: (alert) => set((state) => ({
        alerts: [alert, ...state.alerts],
        unreadAlertsCount: state.unreadAlertsCount + 1
      })),
      
      markAlertAsRead: (alertId) => set((state) => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? { ...a, acknowledged: true } : a
        ),
        unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
      })),
      
      addShipment: (shipment) => set((state) => ({
        shipments: [...state.shipments, shipment]
      })),
      
      updateShipment: (id, updates) => set((state) => ({
        shipments: state.shipments.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setRealtimeSource: (source) => set({ realtimeSource: source }),
    }),
    {
      name: 'supply-chain-store',
      partialize: (state) => ({
        user: state.user,
        temperatureUnit: state.temperatureUnit,
        darkMode: state.darkMode,
        realtimeSource: state.realtimeSource,
      }),
    }
  )
);