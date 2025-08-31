import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, AlertTriangle } from 'lucide-react';
import type { TelemetryPoint } from '@/types';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  temperatureUnit?: 'C' | 'F';
  minTemp?: number;
  maxTemp?: number;
  className?: string;
}

export const TelemetryChart = ({ 
  data, 
  temperatureUnit = 'C',
  minTemp = 2,
  maxTemp = 8,
  className 
}: TelemetryChartProps) => {
  
  const convertTemp = (temp: number) => {
    if (temperatureUnit === 'F') {
      return (temp * 9/5) + 32;
    }
    return temp;
  };

  const convertedMinTemp = convertTemp(minTemp);
  const convertedMaxTemp = convertTemp(maxTemp);

  const chartData = data
    .filter(point => point.tempC !== undefined)
    .map(point => ({
      timestamp: point.ts,
      temperature: convertTemp(point.tempC!),
      time: new Date(point.ts).toLocaleTimeString(),
      isOutOfRange: point.tempC! < minTemp || point.tempC! > maxTemp
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const hasAlerts = chartData.some(point => point.isOutOfRange);
  const latestTemp = chartData[chartData.length - 1]?.temperature;
  const latestIsAlert = chartData[chartData.length - 1]?.isOutOfRange;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${data.time}`}</p>
          <p className="text-sm">
            {`Temperature: ${data.temperature.toFixed(1)}°${temperatureUnit}`}
          </p>
          {data.isOutOfRange && (
            <p className="text-destructive text-xs mt-1">⚠️ Out of range</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Monitoring
          </CardTitle>
          <div className="flex items-center gap-2">
            {latestTemp !== undefined && (
              <Badge 
                variant={latestIsAlert ? "destructive" : "secondary"}
                className="gap-1"
              >
                {latestIsAlert && <AlertTriangle className="h-3 w-3" />}
                {latestTemp.toFixed(1)}°{temperatureUnit}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No temperature data available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Temperature range info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Normal: {convertedMinTemp.toFixed(1)}°{temperatureUnit} - {convertedMaxTemp.toFixed(1)}°{temperatureUnit}</span>
              </div>
              {hasAlerts && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Alerts detected</span>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    label={{ 
                      value: `Temperature (°${temperatureUnit})`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Safe temperature range */}
                  <ReferenceLine 
                    y={convertedMinTemp} 
                    stroke="hsl(var(--success))" 
                    strokeDasharray="5 5" 
                    label="Min Safe"
                  />
                  <ReferenceLine 
                    y={convertedMaxTemp} 
                    stroke="hsl(var(--success))" 
                    strokeDasharray="5 5" 
                    label="Max Safe"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ 
                      fill: "hsl(var(--primary))", 
                      strokeWidth: 2, 
                      r: 3 
                    }}
                    activeDot={{ 
                      r: 5, 
                      fill: "hsl(var(--primary))" 
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};