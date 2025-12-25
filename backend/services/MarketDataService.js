const Stock = require("../models/Stock");
const MarketData = require("../models/MarketData");

class MarketDataService {
  constructor(io) {
    this.io = io;
    this.subscribers = new Map(); // socket.id -> Set of symbols
    this.marketData = new Map(); // symbol -> latest data
    this.simulationInterval = null;
  }

  subscribe(socket, symbols) {
    if (!this.subscribers.has(socket.id)) {
      this.subscribers.set(socket.id, new Set());
    }
    
    const userSymbols = this.subscribers.get(socket.id);
    symbols.forEach(symbol => {
      userSymbols.add(symbol.toUpperCase());
    });

    // Send current data immediately
    this.sendCurrentData(socket, symbols);
  }

  unsubscribe(socket, symbols) {
    if (!this.subscribers.has(socket.id)) return;
    
    const userSymbols = this.subscribers.get(socket.id);
    symbols.forEach(symbol => {
      userSymbols.delete(symbol.toUpperCase());
    });
  }

  unsubscribeAll(socket) {
    this.subscribers.delete(socket.id);
  }

  async sendCurrentData(socket, symbols) {
    try {
      const stocks = await Stock.find({ 
        symbol: { $in: symbols.map(s => s.toUpperCase()) } 
      });
      
      stocks.forEach(stock => {
        socket.emit("market_data", {
          symbol: stock.symbol,
          ltp: stock.ltp,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          ohlc: stock.ohlc,
          timestamp: new Date()
        });
      });
    } catch (error) {
      console.error("Error sending current data:", error);
    }
  }

  async startSimulation() {
    // Initialize with sample stocks
    await this.initializeSampleStocks();
    
    // Start price simulation
    this.simulationInterval = setInterval(() => {
      this.simulateMarketData();
    }, 2000); // Update every 2 seconds

    console.log("📈 Market data simulation started");
  }

  async initializeSampleStocks() {
    const sampleStocks = [
      { symbol: "INFY", name: "Infosys Limited", ltp: 1555.45, previousClose: 1580.00 },
      { symbol: "TCS", name: "Tata Consultancy Services", ltp: 3194.8, previousClose: 3202.00 },
      { symbol: "ITC", name: "ITC Limited", ltp: 262.25, previousClose: 263.30 },
      { symbol: "RELIANCE", name: "Reliance Industries", ltp: 2112.4, previousClose: 2082.15 },
      { symbol: "HDFCBANK", name: "HDFC Bank Limited", ltp: 1522.35, previousClose: 1520.75 },
      { symbol: "WIPRO", name: "Wipro Limited", ltp: 577.75, previousClose: 575.90 },
      { symbol: "BHARTIARTL", name: "Bharti Airtel Limited", ltp: 541.15, previousClose: 538.05 },
      { symbol: "SBIN", name: "State Bank of India", ltp: 430.2, previousClose: 431.67 },
      { symbol: "ONGC", name: "Oil & Natural Gas Corporation", ltp: 116.8, previousClose: 116.90 },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever Limited", ltp: 2417.4, previousClose: 2412.35 }
    ];

    for (const stockData of sampleStocks) {
      try {
        const existingStock = await Stock.findOne({ symbol: stockData.symbol });
        if (!existingStock) {
          const change = stockData.ltp - stockData.previousClose;
          const changePercent = ((change / stockData.previousClose) * 100);
          
          const stock = new Stock({
            ...stockData,
            change,
            changePercent,
            open: stockData.previousClose + (Math.random() - 0.5) * 10,
            high: stockData.ltp + Math.random() * 20,
            low: stockData.ltp - Math.random() * 15,
            volume: Math.floor(Math.random() * 1000000) + 100000,
            ohlc: {
              open: stockData.previousClose + (Math.random() - 0.5) * 10,
              high: stockData.ltp + Math.random() * 20,
              low: stockData.ltp - Math.random() * 15,
              close: stockData.ltp
            }
          });
          
          await stock.save();
          console.log(`✅ Created stock: ${stockData.symbol}`);
        }
      } catch (error) {
        console.error(`Error creating stock ${stockData.symbol}:`, error);
      }
    }
  }

  async simulateMarketData() {
    try {
      const stocks = await Stock.find({ isActive: true });
      
      for (const stock of stocks) {
        // Simulate price movement (±2% max change)
        const maxChange = stock.ltp * 0.02;
        const priceChange = (Math.random() - 0.5) * maxChange;
        const newLtp = Math.max(stock.ltp + priceChange, 1); // Minimum price of 1
        
        const change = newLtp - stock.previousClose;
        const changePercent = ((change / stock.previousClose) * 100);
        
        // Update OHLC
        const ohlc = stock.ohlc || {};
        ohlc.high = Math.max(ohlc.high || newLtp, newLtp);
        ohlc.low = Math.min(ohlc.low || newLtp, newLtp);
        ohlc.close = newLtp;
        
        // Update stock
        stock.ltp = parseFloat(newLtp.toFixed(2));
        stock.change = parseFloat(change.toFixed(2));
        stock.changePercent = parseFloat(changePercent.toFixed(2));
        stock.ohlc = ohlc;
        stock.volume += Math.floor(Math.random() * 1000);
        
        await stock.save();
        
        // Save market data
        const marketData = new MarketData({
          symbol: stock.symbol,
          exchange: stock.exchange,
          ltp: stock.ltp,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          ohlc: stock.ohlc
        });
        
        await marketData.save();
        
        // Broadcast to subscribers
        this.broadcastMarketData(stock);
      }
    } catch (error) {
      console.error("Error in market simulation:", error);
    }
  }

  broadcastMarketData(stock) {
    const data = {
      symbol: stock.symbol,
      ltp: stock.ltp,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      ohlc: stock.ohlc,
      timestamp: new Date()
    };

    // Send to all subscribers of this symbol
    this.subscribers.forEach((symbols, socketId) => {
      if (symbols.has(stock.symbol)) {
        this.io.to(socketId).emit("market_data", data);
      }
    });
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log("📈 Market data simulation stopped");
    }
  }
}

module.exports = MarketDataService;