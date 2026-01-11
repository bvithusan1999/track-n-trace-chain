import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, CameraOff, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const QRScanner = ({
  onScan,
  onClose,
  title = "Scan QR Code",
}: QRScannerProps) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const rafRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopScanLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  };

  const captureFrame = useCallback(() => {
    const video = webcamRef.current?.video as HTMLVideoElement | undefined;
    if (!video || video.readyState !== 4) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height);

    if (code) {
      stopScanLoop();
      onScan(code.data);
      toast({
        title: "QR Code Scanned",
        description: "Successfully scanned QR code",
      });
    } else {
      rafRef.current = requestAnimationFrame(captureFrame);
    }
  }, [onScan]);

  const startCamera = () => {
    setIsCameraOn(true);
    stopScanLoop();
    rafRef.current = requestAnimationFrame(captureFrame);
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    stopScanLoop();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      toast({
        title: "Manual Input",
        description: "Product ID entered manually",
      });
    }
  };

  // Ensure scan loop stops if the component unmounts.
  useEffect(() => stopScanLoop, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-white text-lg font-bold">{title}</h2>
            <p className="text-blue-100 text-xs mt-0.5">
              Position QR code in frame
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Camera Section */}
          {!isCameraOn ? (
            <Button
              onClick={startCamera}
              className="w-full gap-2 h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
            >
              <Camera className="h-5 w-5" />
              Start Camera
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-3 border-blue-400 shadow-md bg-black">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }}
                  className="w-full aspect-square object-cover"
                />
                {/* Scanning frame overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 border-3 border-blue-300/80 rounded-2xl" />
                </div>
              </div>
              <Button
                onClick={stopCamera}
                className="w-full gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-700 border-2 border-red-400 font-bold rounded-lg transition-all h-10"
                variant="outline"
              >
                <CameraOff className="h-4 w-4" />
                Stop Camera
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t-2 border-slate-300" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">
              Or Enter Manually
            </span>
            <div className="flex-1 border-t-2 border-slate-300" />
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label
              htmlFor="manual-input"
              className="text-slate-900 font-bold text-xs uppercase tracking-wide"
            >
              Product ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                placeholder="Enter product ID"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                className="flex-1 border-2 border-green-400 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg font-medium transition-all h-10"
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all rounded-lg px-6 h-10"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
