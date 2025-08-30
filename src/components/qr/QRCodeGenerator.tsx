import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  size?: number;
}

export function QRCodeGenerator({ data, title = "QR Code", size = 256 }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#1a1a1a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title,
          text: 'Scan this QR code to track the product',
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(data);
        alert('QR code data copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Fallback: copy data to clipboard
      try {
        await navigator.clipboard.writeText(data);
        alert('QR code data copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {isLoading ? (
            <div className="w-64 h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Generating...</span>
            </div>
          ) : qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="rounded-lg shadow-sm border"
            />
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Failed to generate QR code</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Scan to track product</p>
          <p className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
            {data}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            disabled={!qrCodeUrl}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}