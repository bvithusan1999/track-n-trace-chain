import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Settings } from 'lucide-react';
import type { TelemetryPoint } from '@/types';

interface MapTrackerProps {
  telemetryData?: TelemetryPoint[];
  className?: string;
}

export const MapTracker = ({ telemetryData = [], className }: MapTrackerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Check if we have a token and mapbox is available
    const token = import.meta.env.VITE_MAPBOX_TOKEN || mapboxToken;
    
    if (!token) {
      setShowTokenInput(true);
      return;
    }

    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.006, 40.7128], // NYC default
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsMapReady(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setShowTokenInput(true);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setShowTokenInput(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
      setIsMapReady(false);
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !isMapReady || telemetryData.length === 0) return;

    // Remove existing sources and layers
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    if (map.current.getSource('points')) {
      map.current.removeLayer('points');
      map.current.removeSource('points');
    }

    // Add route line
    const coordinates = telemetryData.map(point => [point.lng, point.lat]);
    
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'hsl(var(--primary))',
        'line-width': 3
      }
    });

    // Add points
    const features = telemetryData.map((point, index) => ({
      type: 'Feature' as const,
      properties: {
        temperature: point.tempC,
        timestamp: point.ts,
        isLatest: index === telemetryData.length - 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat]
      }
    }));

    map.current.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });

    map.current.addLayer({
      id: 'points',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': [
          'case',
          ['get', 'isLatest'],
          8,
          4
        ],
        'circle-color': [
          'case',
          ['get', 'isLatest'],
          'hsl(var(--destructive))',
          'hsl(var(--primary))'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Fit bounds to show all points
    if (coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord as [number, number]));
      map.current.fitBounds(bounds, { padding: 50 });
    }

    // Add popup on click
    map.current.on('click', 'points', (e) => {
      const coordinates = e.lngLat;
      const properties = e.features?.[0].properties;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2">
            <p><strong>Temperature:</strong> ${properties?.temperature?.toFixed(1) || 'N/A'}°C</p>
            <p><strong>Time:</strong> ${new Date(properties?.timestamp || 0).toLocaleString()}</p>
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('mouseenter', 'points', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'points', () => {
      map.current!.getCanvas().style.cursor = '';
    });

  }, [telemetryData, isMapReady]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      // Trigger map re-initialization
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  };

  if (showTokenInput) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mapbox Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
          </div>
          <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()}>
            Initialize Map
          </Button>
          <p className="text-sm text-muted-foreground">
            Get your free Mapbox token at{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          GPS Tracking
          {telemetryData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({telemetryData.length} points)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          className="w-full h-64 rounded-b-lg"
          style={{ minHeight: '300px' }}
        />
      </CardContent>
    </Card>
  );
};