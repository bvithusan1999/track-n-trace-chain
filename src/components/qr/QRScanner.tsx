import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const QRScanner = ({ onScan, onClose, title = "Scan QR Code" }: QRScannerProps) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context?.drawImage(img, 0, 0);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            onScan(code.data);
            toast({
              title: "QR Code Scanned",
              description: "Successfully scanned QR code",
            });
          }
        }
      };
      img.src = imageSrc;
    }
  }, [onScan]);

  const startCamera = () => {
    setIsCameraOn(true);
    intervalRef.current = setInterval(capture, 100);
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Section */}
          <div className="space-y-4">
            <div className="text-center">
              {!isCameraOn ? (
                <Button onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-lg"
                      videoConstraints={{
                        facingMode: "environment"
                      }}
                    />
                  </div>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                    className="gap-2"
                  >
                    <CameraOff className="h-4 w-4" />
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter manually
              </span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="manual-input">Product ID</Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                placeholder="Enter product ID"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Button 
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
              >
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};