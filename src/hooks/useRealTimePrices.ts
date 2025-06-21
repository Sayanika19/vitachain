import { useState, useEffect, useCallback } from 'react';
import { coingeckoApi } from '@/services/coingeckoApi';

interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface UseRealTimePricesReturn {
  prices: PriceData;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useRealTimePrices = (
  coinIds: string[] = ['ethereum'],
  updateInterval: number = 30000
): UseRealTimePricesReturn => {
  const [prices, setPrices] = useState<PriceData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (coinIds.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const priceData = await coingeckoApi.getSimplePrices(coinIds, 'usd', true);
      setPrices(priceData);
      setLastUpdated(new Date());
      
      console.log('Real-time prices updated:', priceData);
    } catch (err) {
      console.error('Error fetching real-time prices:', err);
      setError('Failed to fetch live prices');
      
      // Keep previous prices if available, don't clear them on error
    } finally {
      setIsLoading(false);
    }
  }, [coinIds]);

  useEffect(() => {
    fetchPrices();
    
    // Set up real-time price updates
    const interval = setInterval(fetchPrices, updateInterval);
    
    return () => clearInterval(interval);
  }, [fetchPrices, updateInterval]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchPrices
  };
};

// Convenience hook for ETH price specifically
export const useEthPrice = (updateInterval: number = 30000) => {
  const { prices, isLoading, error, lastUpdated, refetch } = useRealTimePrices(['ethereum'], updateInterval);
  
  return {
    ethPrice: prices.ethereum?.usd || 0,
    ethPriceChange24h: prices.ethereum?.usd_24h_change || 0,
    isLoading,
    error,
    lastUpdated,
    refetch
  };
}; 