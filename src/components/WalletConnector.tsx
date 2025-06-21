import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ChevronDown, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface WalletData {
  address: string;
  balance: string;
  walletType: string;
}

interface WalletConnectorProps {
  isConnected: boolean;
  onConnect: (walletData: WalletData) => void;
  onDisconnect?: () => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnector = ({ isConnected, onConnect, onDisconnect }: WalletConnectorProps) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWalletType, setConnectedWalletType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { toast } = useToast();

  const updateBalance = useCallback(async (address: string): Promise<string> => {
    try {
      if (window.ethereum) {
        const rawBalance = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
        if (typeof rawBalance === 'string') {
          const balanceInWei = parseInt(rawBalance, 16);
          const balanceInEth = balanceInWei / Math.pow(10, 18);
          const formattedBalance = `${balanceInEth.toFixed(4)} ETH`;
          setWalletBalance(formattedBalance);
          return formattedBalance;
        }
      }
    } catch (error) {
      setWalletBalance('Unable to fetch');
      return 'Unable to fetch';
    }
    return '0 ETH';
  }, []);

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask extension to continue.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && typeof accounts[0] === 'string') {
        const address = accounts[0];
        setWalletAddress(address);
        const balance = await updateBalance(address);
        setConnectedWalletType('MetaMask');
        onConnect({ address, balance, walletType: 'MetaMask' });
        toast({ title: "Wallet Connected", description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect MetaMask.',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect, toast, updateBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress('');
    setWalletBalance('');
    setConnectedWalletType('');
    setShowDropdown(false);
    setIsConnecting(false);
    if (onDisconnect) onDisconnect();
    toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected successfully." });
  }, [onDisconnect]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const address = accounts[0];
      setWalletAddress(address);
      const balance = await updateBalance(address);
      onConnect({ address, balance, walletType: connectedWalletType || 'MetaMask' });
    }
  }, [disconnectWallet, updateBalance, onConnect, connectedWalletType]);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (Array.isArray(accounts) && typeof accounts[0] === 'string') {
            const address = accounts[0];
            setWalletAddress(address);
            const balance = await updateBalance(address);
            setConnectedWalletType('MetaMask');
            onConnect({ address, balance, walletType: 'MetaMask' });
          }
        } catch {}
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  useEffect(() => {
    if (!isConnected) {
      setWalletAddress('');
      setWalletBalance('');
      setConnectedWalletType('');
      setShowDropdown(false);
    }
  }, [isConnected]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: "Address Copied", description: "Wallet address copied to clipboard!" });
  };

  const formatAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  return (
    <div className="relative flex items-center gap-4">
      {!walletAddress ? (
        <Button
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md font-semibold transition-all duration-200"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="relative inline-block text-left">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md border border-purple-600 shadow-md"
          >
            <Wallet className="w-4 h-4" />
            <span className="font-mono text-base">{formatAddress(walletAddress)}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {showDropdown && (
            <div className="absolute z-50 mt-2 w-72 rounded-lg shadow-xl bg-black ring-1 ring-black ring-opacity-5 animate-fade-in">
              <div className="p-4 text-sm text-white border-b border-purple-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Connected</span>
                  <Badge variant="outline" className="text-xs bg-purple-700/30 border-purple-500 text-purple-200">
                    {connectedWalletType}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-lg">{formatAddress(walletAddress)}</p>
                <p className="text-green-400 mt-1 font-semibold">{walletBalance}</p>
              </div>
              <div className="p-2 space-y-1">
                <Button variant="ghost" onClick={copyAddress} className="w-full justify-start text-sm hover:bg-purple-900/30">
                  <Copy className="w-4 h-4 mr-2" /> Copy Address
                </Button>
                <Button variant="ghost" onClick={disconnectWallet} className="w-full justify-start text-sm text-red-500 hover:bg-red-900/30">
                  <LogOut className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
