import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertTable } from "@/components/AlertTable";

export default function SupplierAlertsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor condition breaches during your shipment segments
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Shipment Condition Breaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertTable
            apiEndpoint="/api/alerts/supplier"
            columns={[
              "packageId",
              "alertType",
              "severity",
              "segmentId",
              "location",
              "breachTime",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
