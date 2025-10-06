import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  ProductMeta,
  TelemetryPoint,
  Alert,
  Shipment,
} from "@/types";
import { setAuthToken } from "@/lib/api";

interface AppState {
  // 🔐 Auth & Wallet
  token?: string;
  role?: string;
  walletAddress: `0x${string}` | null;
  isConnected: boolean;

  // User
  user: UserProfile | null;

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
  temperatureUnit: "C" | "F";
  darkMode: boolean;
  realtimeSource: "WebSocket" | "MQTT" | "Mock";

  // Actions
  setUser: (user: UserProfile | null) => void;

  // 🔐 Auth actions
  setAuth: (data: { token: string; role: string; address: `0x${string}` }) => void;
  logout: () => void;
  setWalletConnection: (address: `0x${string}` | null) => void;

  // Product actions
  addProduct: (product: ProductMeta) => void;
  updateProduct: (id: string, updates: Partial<ProductMeta>) => void;
  setSelectedProduct: (product: ProductMeta | null) => void;

  // Telemetry actions
  addTelemetryPoint: (productId: string, point: TelemetryPoint) => void;

  // Alert actions
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (alertId: string) => void;

  // Shipment actions
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;

  // Settings actions
  setTemperatureUnit: (unit: "C" | "F") => void;
  setDarkMode: (enabled: boolean) => void;
  setRealtimeSource: (source: "WebSocket" | "MQTT" | "Mock") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: undefined,
      role: undefined,
      isConnected: false,
      walletAddress: null,
      products: [],
      selectedProduct: null,
      telemetryData: {},
      alerts: [],
      unreadAlertsCount: 0,
      shipments: [],
      temperatureUnit: "C",
      darkMode: false,
      realtimeSource: "Mock",

      // 🔹 User actions
      setUser: (user) => set({ user }),

      // 🔐 Auth actions
      setAuth: ({ token, role, address }) => {
        // Reset any mock or stale data when authenticating
        set({
          token,
          role,
          walletAddress: address,
          isConnected: true,
          user: null, // ✅ Clear any previous mock user
        });
        setAuthToken(token); // ✅ apply JWT to Axios instance
      },

      logout: () => {
        set({
          token: undefined,
          role: undefined,
          walletAddress: null,
          isConnected: false,
          user: null,
        });
        setAuthToken(undefined); // remove Authorization header
      },

      setWalletConnection: (address) =>
        set({
          walletAddress: address,
          isConnected: !!address,
        }),

      // 🔹 Product actions
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      // 🔹 Telemetry actions
      addTelemetryPoint: (productId, point) =>
        set((state) => {
          const existing = state.telemetryData[productId] || [];
          const updated = [...existing, point].slice(-100);
          return {
            telemetryData: {
              ...state.telemetryData,
              [productId]: updated,
            },
          };
        }),

      // 🔹 Alert actions
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
          unreadAlertsCount: state.unreadAlertsCount + 1,
        })),

      markAlertAsRead: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          ),
          unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1),
        })),

      // 🔹 Shipment actions
      addShipment: (shipment) =>
        set((state) => ({
          shipments: [...state.shipments, shipment],
        })),

      updateShipment: (id, updates) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      // 🔹 Settings actions
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setRealtimeSource: (source) => set({ realtimeSource: source }),
    }),
    {
      name: "supply-chain-store",
      partialize: (state) => ({
        // ✅ Only persist what is safe and useful
        token: state.token,
        role: state.role,
        walletAddress: state.walletAddress,
        temperatureUnit: state.temperatureUnit,
        darkMode: state.darkMode,
        realtimeSource: state.realtimeSource,
      }),
    }
  )
);
