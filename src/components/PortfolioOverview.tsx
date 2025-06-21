import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, AlertTriangle, RefreshCw } from "lucide-react";
import { WalletData } from "./WalletConnector";
import AssetAllocationChart from "./AssetAllocationChart";
import AssetTracking from "./portfolio/AssetTracking";
import PerformanceMetrics from "./portfolio/PerformanceMetrics";
import TransactionHistory from "./portfolio/TransactionHistory";
import InvestmentPositions from "./portfolio/InvestmentPositions";
import RealTimePriceDisplay from "./portfolio/RealTimePriceDisplay";
import { useEffect, useState } from "react";
import { useEthPrice } from "@/hooks/useRealTimePrices";

interface PortfolioOverviewProps {
  isConnected: boolean;
  walletData?: WalletData | null;
}

const PortfolioOverview = ({ isConnected, walletData }: PortfolioOverviewProps) => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  
  // Use the new real-time price hook
  const { ethPrice, ethPriceChange24h, isLoading: isLoadingPrices, lastUpdated } = useEthPrice(30000);

  useEffect(() => {
    if (isConnected && walletData?.balance && ethPrice > 0) {
      // Calculate portfolio value with real-time ETH price
      const ethAmount = parseFloat(walletData.balance.replace(' ETH', ''));
      const currentValue = ethAmount * ethPrice;
      
      setPortfolioValue(currentValue);
      
      // Calculate daily change based on ETH price change
      if (currentValue > 0) {
        const marketChange = currentValue * (ethPriceChange24h / 100);
        setDailyChange(marketChange);
        setChangePercent(ethPriceChange24h);
      } else {
        setDailyChange(0);
        setChangePercent(0);
      }
      
      console.log('Real-time portfolio value updated:', {
        ethPrice,
        ethAmount,
        portfolioValue: currentValue,
        priceChange24h: ethPriceChange24h
      });
    } else if (!isConnected || !walletData?.balance) {
      setPortfolioValue(0);
      setDailyChange(0);
      setChangePercent(0);
    }
  }, [isConnected, walletData?.balance, ethPrice, ethPriceChange24h]);

  const getActiveChains = () => {
    if (!isConnected || portfolioValue === 0) return 0;
    return 1; // Ethereum when wallet has value
  };

  const getActivePositions = () => {
    if (!isConnected || portfolioValue === 0) return 0;
    return portfolioValue > 0 ? 1 : 0;
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

  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-xl">
          <CardHeader className="text-center py-12">
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <CardTitle className="text-white text-xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-purple-300">
              Connect your wallet to view your real-time portfolio and blockchain data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Price Display */}
      <RealTimePriceDisplay />

      {/* Wallet Info Header */}
      {walletData && (
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-purple-300">Wallet Address</p>
                <p className="text-white font-mono break-all">{walletData.address}</p>
              </div>
              <div>
                <p className="text-sm text-purple-300">ETH Balance</p>
                <p className="text-white font-medium">{walletData.balance}</p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Portfolio Value</p>
                <p className="text-white font-medium">
                  ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Updated: {formatLastUpdated()}</div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-purple-300">Total Portfolio Value (Real-Time)</CardDescription>
              {isLoadingPrices && <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className={`flex items-center text-sm ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioValue === 0 ? (
                    <span className="text-gray-400">Empty Wallet</span>
                  ) : (
                    <>
                      {changePercent >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {`${changePercent >= 0 ? '+' : ''}$${Math.abs(dailyChange).toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%)`}
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">Live ETH Price: ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-300">Active Chains (Real-Time)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{getActiveChains()}</div>
                <div className="text-sm text-purple-300">Networks Connected</div>
              </div>
              <div className="flex flex-col space-y-1">
                {getActiveChains() > 0 && (
                  <Badge variant="secondary" className="bg-purple-900/30 text-purple-300 text-xs">Ethereum</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-300">Token Holdings (Real-Time)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{getActivePositions()}</div>
                <div className="text-sm text-purple-300">Active Tokens</div>
              </div>
              <PieChart className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Asset Tracking */}
      <AssetTracking 
        isConnected={isConnected} 
        walletData={walletData} 
        ethPrice={ethPrice}
        ethPriceChange24h={ethPriceChange24h}
        isLoadingPrices={isLoadingPrices}
      />

      {/* Asset Allocation Chart */}
      <AssetAllocationChart walletData={walletData} isConnected={isConnected} />

      {/* Real-time Performance Metrics */}
      <PerformanceMetrics isConnected={isConnected} walletData={walletData} />

      {/* Transaction History */}
      <TransactionHistory isConnected={isConnected} walletData={walletData} />

      {/* Investment Positions */}
      <InvestmentPositions isConnected={isConnected} walletData={walletData} />

      {/* Real-time Risk Alerts */}
      <Card className="bg-black/40 border-orange-800/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Real-Time Risk Alerts
          </CardTitle>
          <CardDescription className="text-orange-300">Live portfolio risk monitoring from connected MetaMask wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolioValue === 0 ? (
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Empty Wallet Detected</div>
                    <div className="text-blue-300 text-xs">No ETH balance found in connected MetaMask wallet</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-600 text-blue-300">
                  Live
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Portfolio Active</div>
                    <div className="text-green-300 text-xs">
                      Real-time value: ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-300">
                  Live
                </Badge>
              </div>
            )}
            
            {ethPriceChange24h !== 0 && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                ethPriceChange24h >= 0 
                  ? 'bg-green-900/20 border-green-800/30' 
                  : 'bg-red-900/20 border-red-800/30'
              }`}>
                <div className="flex items-center space-x-3">
                  {ethPriceChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <div className="text-white text-sm font-medium">ETH Price Movement</div>
                    <div className={`text-xs ${
                      ethPriceChange24h >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {ethPriceChange24h >= 0 ? '+' : ''}{ethPriceChange24h.toFixed(2)}% in 24h
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`${
                  ethPriceChange24h >= 0 
                    ? 'border-green-600 text-green-300' 
                    : 'border-red-600 text-red-300'
                }`}>
                  Live
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
