import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from "@mui/material";
import { TrendingUp, TrendingDown, Info } from "@mui/icons-material";

const MarketDepth = ({ open, onClose, symbol, stockData }) => {
  const [marketDepthData, setMarketDepthData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock market depth data - in real app, this would come from API
  useEffect(() => {
    if (open && symbol) {
      generateMockMarketDepth();
    }
  }, [open, symbol]);

  const generateMockMarketDepth = () => {
    setLoading(true);
    
    // Generate realistic bid/offer data
    const basePrice = stockData?.ltp || 1000;
    const spread = basePrice * 0.001; // 0.1% spread
    
    const bids = [];
    const offers = [];
    
    // Generate 5 bid levels (buyers)
    for (let i = 0; i < 5; i++) {
      const price = basePrice - spread - (i * 0.5);
      const quantity = Math.floor(Math.random() * 1000) + 100;
      const orders = Math.floor(Math.random() * 10) + 1;
      
      bids.push({
        price: price.toFixed(2),
        quantity,
        orders
      });
    }
    
    // Generate 5 offer levels (sellers)
    for (let i = 0; i < 5; i++) {
      const price = basePrice + spread + (i * 0.5);
      const quantity = Math.floor(Math.random() * 1000) + 100;
      const orders = Math.floor(Math.random() * 10) + 1;
      
      offers.push({
        price: price.toFixed(2),
        quantity,
        orders
      });
    }
    
    // Mock OHLC and other data
    const mockData = {
      symbol,
      ltp: basePrice.toFixed(2),
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      open: (basePrice * (0.98 + Math.random() * 0.04)).toFixed(2),
      high: (basePrice * (1.01 + Math.random() * 0.02)).toFixed(2),
      low: (basePrice * (0.97 + Math.random() * 0.02)).toFixed(2),
      close: (basePrice * (0.99 + Math.random() * 0.02)).toFixed(2),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      bids,
      offers,
      totalBuyQuantity: bids.reduce((sum, bid) => sum + bid.quantity, 0),
      totalSellQuantity: offers.reduce((sum, offer) => sum + offer.quantity, 0)
    };
    
    setMarketDepthData(mockData);
    setLoading(false);
  };

  if (!marketDepthData) {
    return null;
  }

  const { bids, offers, totalBuyQuantity, totalSellQuantity } = marketDepthData;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h6">
          Market Depth - {symbol}
        </Typography>
        <Chip 
          label={`LTP: ₹${marketDepthData.ltp}`} 
          color="primary" 
          size="small" 
        />
        <Chip 
          label={`${marketDepthData.change > 0 ? '+' : ''}${marketDepthData.change.toFixed(2)} (${marketDepthData.changePercent.toFixed(2)}%)`}
          color={marketDepthData.change >= 0 ? "success" : "error"}
          size="small"
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* OHLC Information */}
        <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    OPEN
                  </Typography>
                  <Typography variant="h6">
                    ₹{marketDepthData.open}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    HIGH
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ₹{marketDepthData.high}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    LOW
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ₹{marketDepthData.low}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    VOLUME
                  </Typography>
                  <Typography variant="h6">
                    {(marketDepthData.volume / 100000).toFixed(1)}L
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Market Depth Tables */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Bids (Buyers) */}
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Bids (Buyers)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell align="right"><strong>Qty</strong></TableCell>
                      <TableCell align="right"><strong>Orders</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bids.map((bid, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          backgroundColor: index === 0 ? '#e8f5e8' : 'inherit',
                          '&:hover': { backgroundColor: '#f0f8ff' }
                        }}
                      >
                        <TableCell sx={{ color: '#1976d2', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                          ₹{bid.price}
                        </TableCell>
                        <TableCell align="right">{bid.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">{bid.orders}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{totalBuyQuantity.toLocaleString()}</strong></TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Offers (Sellers) */}
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown color="error" />
                Offers (Sellers)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#ffebee' }}>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell align="right"><strong>Qty</strong></TableCell>
                      <TableCell align="right"><strong>Orders</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.map((offer, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          backgroundColor: index === 0 ? '#ffe8e8' : 'inherit',
                          '&:hover': { backgroundColor: '#fff0f0' }
                        }}
                      >
                        <TableCell sx={{ color: '#d32f2f', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                          ₹{offer.price}
                        </TableCell>
                        <TableCell align="right">{offer.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">{offer.orders}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{totalSellQuantity.toLocaleString()}</strong></TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {/* Market Analysis */}
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                <strong>💡 Understanding Market Depth:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • <strong>Best Bid:</strong> ₹{bids[0]?.price} - Highest price buyers are willing to pay
              </Typography>
              <Typography variant="body2">
                • <strong>Best Offer:</strong> ₹{offers[0]?.price} - Lowest price sellers are willing to accept
              </Typography>
              <Typography variant="body2">
                • <strong>Spread:</strong> ₹{(parseFloat(offers[0]?.price) - parseFloat(bids[0]?.price)).toFixed(2)} - Difference between best bid and offer
              </Typography>
              <Typography variant="body2">
                • <strong>Market Orders:</strong> Buy orders execute at best offer price, Sell orders at best bid price
              </Typography>
            </Alert>
          </Box>

          {/* Buy/Sell Pressure Indicator */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Market Sentiment
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="primary">
                  Buy Pressure: {totalBuyQuantity.toLocaleString()} shares
                </Typography>
                <Box sx={{ 
                  height: 8, 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    backgroundColor: '#1976d2',
                    width: `${(totalBuyQuantity / (totalBuyQuantity + totalSellQuantity)) * 100}%`,
                    borderRadius: 1
                  }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="error">
                  Sell Pressure: {totalSellQuantity.toLocaleString()} shares
                </Typography>
                <Box sx={{ 
                  height: 8, 
                  backgroundColor: '#ffebee', 
                  borderRadius: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    backgroundColor: '#d32f2f',
                    width: `${(totalSellQuantity / (totalBuyQuantity + totalSellQuantity)) * 100}%`,
                    borderRadius: 1
                  }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={generateMockMarketDepth} variant="contained">
          Refresh Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarketDepth;