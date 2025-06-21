import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { useEthPrice } from "@/hooks/useRealTimePrices";

interface RealTimePriceDisplayProps {
  showDetails?: boolean;
  className?: string;
}

const RealTimePriceDisplay = ({ showDetails = true, className = "" }: RealTimePriceDisplayProps) => {
  const { ethPrice, ethPriceChange24h, isLoading, lastUpdated } = useEthPrice(30000);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-purple-300">ETH:</span>
        <span className="text-white font-medium">
          {ethPrice > 0 ? formatPrice(ethPrice) : 'Loading...'}
        </span>
        {isLoading && <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />}
        {ethPriceChange24h !== 0 && (
          <span className={`text-xs ${ethPriceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({ethPriceChange24h >= 0 ? '+' : ''}{ethPriceChange24h.toFixed(2)}%)
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-black/40 border-purple-800/30 backdrop-blur-xl ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Real-Time ETH Price
          </CardTitle>
          {isLoading && <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />}
        </div>
        <CardDescription className="text-purple-300">
          Live price data from CoinGecko API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {ethPrice > 0 ? formatPrice(ethPrice) : 'Loading...'}
            </div>
            <div className="text-sm text-purple-300 mt-1">
              Ethereum (ETH)
            </div>
          </div>

          {/* 24h Change */}
          {ethPriceChange24h !== 0 && (
            <div className={`flex items-center justify-center p-3 rounded-lg border ${
              ethPriceChange24h >= 0 
                ? 'bg-green-900/20 border-green-800/30' 
                : 'bg-red-900/20 border-red-800/30'
            }`}>
              <div className="flex items-center space-x-2">
                {ethPriceChange24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <div className="text-white font-medium">24h Change</div>
                  <div className={`text-lg font-bold ${
                    ethPriceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {ethPriceChange24h >= 0 ? '+' : ''}{ethPriceChange24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Live Data</span>
            </div>
            <Badge variant="outline" className="border-purple-600 text-purple-300">
              Real-Time
            </Badge>
          </div>

          {/* Last Updated */}
          <div className="text-center text-xs text-gray-400">
            Last updated: {formatLastUpdated()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimePriceDisplay; 