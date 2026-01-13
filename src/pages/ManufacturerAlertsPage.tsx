import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertTable } from "@/components/AlertTable";

export default function ManufacturerAlertsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor condition breaches detected on your packages
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardContent className="pt-6">
          <AlertTable
            apiEndpoint="/api/alerts/manufacturer"
            columns={[
              "packageId",
              "alertType",
              "severity",
              "shipmentId",
              "location",
              "breachTime",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
