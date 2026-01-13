import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Package,
} from "lucide-react";
import type { Shipment } from "@/types";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

export function ShipmentDetailsDialog({
  open,
  onOpenChange,
  shipment,
}: ShipmentDetailsDialogProps) {
  if (!shipment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "border-green-500/50 bg-green-500/10 text-green-700";
      case "IN_TRANSIT":
        return "border-blue-500/50 bg-blue-500/10 text-blue-700";
      case "PENDING":
        return "border-amber-500/50 bg-amber-500/10 text-amber-700";
      default:
        return "border-border/50 bg-muted/10";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return 100;
      case "IN_TRANSIT":
        return 50;
      default:
        return 0;
    }
  };

  const progressPercentage = getProgressPercentage(shipment.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary" />
            Shipment Overview
            <Badge
              variant="outline"
              className={getStatusColor(shipment.status)}
            >
              {shipment.status.replace(/_/g, " ")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono text-xs">ID: {shipment.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Section */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Shipment Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Progress</span>
                <span className="font-semibold text-primary">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {shipment.segments?.length || 0} segments •{" "}
                {shipment.packageCount}{" "}
                {shipment.packageCount === 1 ? "package" : "packages"}
              </p>
            </div>
          </div>

          {/* Timeline & Destination Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline */}
            <ShipmentTimeline shipment={shipment} />

            {/* Destination */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Destination
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{shipment.destinationName}</p>
                {shipment.segments?.[shipment.segments.length - 1]
                  ?.end_checkpoint && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {
                        shipment.segments[shipment.segments.length - 1]
                          .end_checkpoint.location
                      }
                    </p>
                    <p>
                      {
                        shipment.segments[shipment.segments.length - 1]
                          .end_checkpoint.state
                      }
                      {shipment.segments[shipment.segments.length - 1]
                        .end_checkpoint.country &&
                        `, ${
                          shipment.segments[shipment.segments.length - 1]
                            .end_checkpoint.country
                        }`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Route Segments */}
          {shipment.segments && shipment.segments.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Route Segments
              </h3>
              <div className="space-y-3">
                {shipment.segments.map((segment, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {segment.start_checkpoint?.name ||
                            segment.start_checkpoint?.location ||
                            "Start"}
                        </p>
                        <span className="text-muted-foreground">→</span>
                        <p className="text-sm font-medium">
                          {segment.end_checkpoint?.name ||
                            segment.end_checkpoint?.location ||
                            "End"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {segment.start_checkpoint?.state},{" "}
                          {segment.start_checkpoint?.country}
                        </span>
                        <span>→</span>
                        <span>
                          {segment.end_checkpoint?.state},{" "}
                          {segment.end_checkpoint?.country}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex-shrink-0 text-xs ${
                        segment.status === "DELIVERED"
                          ? "border-green-500/50 bg-green-500/10 text-green-700"
                          : segment.status === "IN_TRANSIT"
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-700"
                          : "border-amber-500/50 bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {segment.status || "PENDING"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Timeline component - shows shipment timeline attractively
 */
function ShipmentTimeline({ shipment }: { shipment: Shipment }) {
  const timelineData = [
    {
      icon: Package,
      label: "Created",
      date: shipment.createdAt || "N/A",
      completed: true,
    },
    {
      icon: Calendar,
      label: "ETA",
      date: shipment.estimatedDelivery || "N/A",
      completed:
        shipment.status === "DELIVERED" || shipment.status === "IN_TRANSIT",
    },
    {
      icon: CheckCircle2,
      label: "Delivered",
      date: shipment.deliveredAt || "Pending",
      completed: shipment.status === "DELIVERED",
    },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Timeline
      </h3>
      <div className="space-y-4">
        {timelineData.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="flex gap-3">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    item.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                {idx < timelineData.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 ${
                      item.completed ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
              {/* Timeline content */}
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
