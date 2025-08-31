import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Search, CheckCircle, Clock, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Alert } from '@/types';

const Alerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { alerts, markAlertAsRead, products } = useAppStore();

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.productId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || alert.level === levelFilter;
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'READ' && alert.acknowledged) ||
                         (statusFilter === 'unread' && !alert.acknowledged);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'WARN':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'destructive';
      case 'WARN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const levelOptions = ['ALL', 'CRITICAL', 'WARN', 'INFO'];
  const statusOptions = ['ALL', 'unread', 'read'];

  const unreadCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.level === 'CRITICAL' && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor critical events and anomalies in your supply chain
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} unread
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} critical
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter(a => a.level === 'CRITICAL').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.level === 'WARN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2">
              {levelOptions.map((level) => (
                <Button
                  key={level}
                  variant={levelFilter === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevelFilter(level)}
                >
                  {level}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-muted-foreground">
              {alerts.length === 0 
                ? "No alerts yet. All systems are running smoothly!"
                : "No alerts match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`${!alert.acknowledged ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.level)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getAlertColor(alert.level) as any}>
                            {alert.level}
                          </Badge>
                          {!alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-lg">{alert.message}</h3>
                        <p className="text-sm text-muted-foreground">
                          Product: {getProductName(alert.productId)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.ts).toLocaleString()}
                        </span>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Product ID: {alert.productId}</span>
                      {alert.acknowledged && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Acknowledged</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;