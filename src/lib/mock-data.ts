import type { ProductMeta, TelemetryPoint, Alert, UserProfile, CustodyEvent } from '@/types';

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    role: 'MANUFACTURER',
    displayName: 'Acme Manufacturing',
    company: 'Acme Corp'
  },
  {
    id: '2',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    role: 'TRANSPORTER',
    displayName: 'Global Logistics',
    company: 'Global Transport LLC'
  },
  {
    id: '3',
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    role: 'RETAILER',
    displayName: 'Metro Store',
    company: 'Metro Retail Inc'
  }
];

export const mockProducts: ProductMeta[] = [
  {
    id: 'PRD-001',
    name: 'Premium Coffee Beans',
    sku: 'COF-PMM-001',
    batch: 'BTH-2024-001',
    mfgDate: '2024-01-15',
    qrUri: 'https://track.supply/qr/PRD-001',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    currentHolder: '0xabcdef1234567890abcdef1234567890abcdef12',
    status: 'IN_TRANSIT'
  },
  {
    id: 'PRD-002',
    name: 'Organic Chocolate',
    sku: 'CHC-ORG-002',
    batch: 'BTH-2024-002',
    mfgDate: '2024-01-20',
    qrUri: 'https://track.supply/qr/PRD-002',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    currentHolder: '0xfedcba0987654321fedcba0987654321fedcba09',
    status: 'DELIVERED'
  },
  {
    id: 'PRD-003',
    name: 'Artisan Honey',
    sku: 'HNY-ART-003',
    batch: 'BTH-2024-003',
    mfgDate: '2024-01-25',
    qrUri: 'https://track.supply/qr/PRD-003',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    currentHolder: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'CREATED'
  }
];

export const generateMockTelemetry = (productId: string, hours: number = 24): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const baseLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
  
  for (let i = 0; i < hours * 6; i++) { // Every 10 minutes
    const timestamp = now - (hours * 60 * 60 * 1000) + (i * 10 * 60 * 1000);
    const progress = i / (hours * 6);
    
    points.push({
      ts: timestamp,
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.1 + progress * 0.05,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.1 + progress * 0.08,
      tempC: 18 + Math.sin(progress * Math.PI * 2) * 3 + (Math.random() - 0.5) * 2,
      doorOpen: Math.random() < 0.05, // 5% chance door is open
      speed: Math.random() * 60 + 40, // 40-100 km/h
      altitude: 100 + Math.random() * 50
    });
  }
  
  return points;
};

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    productId: 'PRD-001',
    level: 'WARN',
    message: 'Temperature above threshold (24°C)',
    ts: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    acknowledged: false
  },
  {
    id: 'ALT-002',
    productId: 'PRD-001',
    level: 'INFO',
    message: 'Checkpoint reached: Distribution Center',
    ts: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    acknowledged: true
  },
  {
    id: 'ALT-003',
    productId: 'PRD-002',
    level: 'CRITICAL',
    message: 'Unauthorized door opening detected',
    ts: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    acknowledged: false
  }
];

export const mockCustodyEvents: CustodyEvent[] = [
  {
    ts: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    from: undefined,
    to: '0x1234567890abcdef1234567890abcdef12345678',
    note: 'Product created and registered',
    txHash: '0xabc123...',
    checkpoint: 'Manufacturing Facility'
  },
  {
    ts: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    note: 'Handover to transport company',
    txHash: '0xdef456...',
    checkpoint: 'Logistics Hub A'
  },
  {
    ts: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    from: '0xabcdef1234567890abcdef1234567890abcdef12',
    to: '0xfedcba0987654321fedcba0987654321fedcba09',
    note: 'Delivered to retail location',
    txHash: '0x789ghi...',
    checkpoint: 'Metro Store Warehouse'
  }
];

// Utility function to generate continuous telemetry stream
export class MockTelemetryStream {
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((point: TelemetryPoint) => void)[] = [];
  private productId: string;
  private currentLocation = { lat: 40.7128, lng: -74.0060 };

  constructor(productId: string) {
    this.productId = productId;
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Simulate movement
      this.currentLocation.lat += (Math.random() - 0.5) * 0.001;
      this.currentLocation.lng += (Math.random() - 0.5) * 0.001;

      const point: TelemetryPoint = {
        ts: Date.now(),
        lat: this.currentLocation.lat,
        lng: this.currentLocation.lng,
        tempC: 18 + Math.sin(Date.now() / 60000) * 4 + (Math.random() - 0.5) * 1,
        doorOpen: Math.random() < 0.02, // 2% chance
        speed: Math.random() * 20 + 50,
        altitude: 100 + Math.random() * 30
      };

      this.callbacks.forEach(callback => callback(point));
    }, 5000); // Every 5 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onData(callback: (point: TelemetryPoint) => void) {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (point: TelemetryPoint) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}