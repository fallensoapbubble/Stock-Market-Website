import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import socketService from '../services/socket';

const MarketContext = createContext();

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};

export const MarketProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadWatchlist();
    
    // Connect to socket for real-time updates
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (watchlist.length > 0) {
      const symbols = watchlist.map(stock => stock.symbol);
      
      // Subscribe to market data updates
      socketService.subscribeToMarketData(symbols, (data) => {
        setMarketData(prev => ({
          ...prev,
          [data.symbol]: data
        }));
        
        // Update watchlist with new data
        setWatchlist(prev => prev.map(stock => 
          stock.symbol === data.symbol 
            ? { ...stock, ...data }
            : stock
        ));
      });
      
      return () => {
        socketService.unsubscribeFromMarketData(symbols);
      };
    }
  }, [watchlist]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const response = await marketAPI.getWatchlist();
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async (query) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      const response = await marketAPI.searchStocks(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    }
  };

  const addToWatchlist = async (stockData) => {
    try {
      const response = await marketAPI.addToWatchlist(stockData);
      await loadWatchlist(); // Reload watchlist
      return { success: true, stock: response.data.stock };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add stock' };
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await marketAPI.removeFromWatchlist(symbol);
      await loadWatchlist(); // Reload watchlist
      return { success: true };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to remove stock' };
    }
  };

  const getStockDetails = async (symbol) => {
    try {
      const response = await marketAPI.getStockDetails(symbol);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting stock details:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to get stock details' };
    }
  };

  const value = {
    watchlist,
    marketData,
    loading,
    searchResults,
    loadWatchlist,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    getStockDetails,
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};