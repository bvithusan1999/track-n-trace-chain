```
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogOut, Copy, Check, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export const WalletConnectButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { 
    walletAddress, 
    isConnected, 
    setWalletConnection,
    user,
    setUser 
  } = useAppStore();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Real wallet connection not needed - handled by Login page
      toast({
        title: "WalletConnect",
        description: "Please use the login page to connect your wallet",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletConnection(null);
    setUser(null);
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected || !walletAddress) {
    return (
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        className="gap-2 transition-all duration-300 ease-in-out min-w-[140px]"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-auto border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="pb-2 p-3">
        <CardTitle className="text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-medium">Connected</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-md border border-border/50">
          <code className="text-xs font-mono text-muted-foreground flex-1 px-1">
            {formatAddress(walletAddress)}
          </code>
          <div className="flex items-center border-l border-border/50 pl-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyAddress}
              className="h-6 w-6 hover:bg-background hover:text-primary transition-colors"
              title="Copy Address"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDisconnect}
              className="h-6 w-6 hover:bg-background hover:text-destructive transition-colors"
              title="Disconnect"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {user && (
          <div className="mt-2 flex items-center gap-2 px-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user.displayName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```