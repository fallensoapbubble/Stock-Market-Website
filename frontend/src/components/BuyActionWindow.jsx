import React, { useState, useContext, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Typography, 
  Box, 
  Tooltip, 
  IconButton,
  Alert,
  Chip
} from "@mui/material";
import { Info, Help } from "@mui/icons-material";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { useMarket } from "../context/MarketContext";

const BuyActionWindow = ({ uid, open, onClose }) => {
  const [orderType, setOrderType] = useState("LIMIT");
  const [productType, setProductType] = useState("CNC");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [triggerPrice, setTriggerPrice] = useState(0.0);
  const [disclosedQuantity, setDisclosedQuantity] = useState(0);
  const [exchange, setExchange] = useState("NSE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockInfo, setStockInfo] = useState(null);

  const { closeBuyWindow } = useContext(GeneralContext);
  const { watchlist } = useMarket();

  // Get stock info from watchlist
  useEffect(() => {
    if (uid && watchlist.length > 0) {
      const stock = watchlist.find(s => s.symbol === uid);
      if (stock) {
        setStockInfo(stock);
        setStockPrice(stock.ltp || 0);
      }
    }
  }, [uid, watchlist]);

  const calculateMarginRequired = () => {
    const baseMargin = stockPrice * stockQuantity;
    const marginMultiplier = productType === "MIS" ? 0.2 : 1; // 20% for intraday, 100% for delivery
    return (baseMargin * marginMultiplier).toFixed(2);
  };

  const handleBuyClick = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Validate inputs
      if (!stockQuantity || stockQuantity <= 0) {
        throw new Error("Please enter a valid quantity");
      }

      if (orderType !== "MARKET" && (!stockPrice || stockPrice <= 0)) {
        throw new Error("Please enter a valid price");
      }

      if ((orderType === "SL" || orderType === "SL-M") && (!triggerPrice || triggerPrice <= 0)) {
        throw new Error("Please enter a valid trigger price");
      }

      const orderData = {
        symbol: uid,
        exchange,
        orderType,
        productType,
        quantity: parseInt(stockQuantity),
        price: orderType === "MARKET" ? 0 : parseFloat(stockPrice),
        triggerPrice: (orderType === "SL" || orderType === "SL-M") ? parseFloat(triggerPrice) : 0,
        disclosedQuantity: parseInt(disclosedQuantity) || 0,
        side: "BUY"
      };

      console.log("🛒 Placing buy order:", orderData);

      const response = await axios.post("http://localhost:3002/api/orders/place", orderData);
      
      console.log("✅ Buy order response:", response.data);
      
      // Show success message
      if (response.data.success) {
        alert(`✅ ${response.data.message}\nOrder ID: ${response.data.orderId}`);
      }
      
      closeBuyWindow();
      onClose && onClose();
    } catch (err) {
      console.error("❌ Buy order error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to place order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    closeBuyWindow();
    onClose && onClose();
  };

  const getOrderTypeTooltip = (type) => {
    const tooltips = {
      LIMIT: "Buy at a specific price or better. Order may not execute if price doesn't reach your limit.",
      MARKET: "Buy immediately at current market price. Guarantees execution but not price.",
      SL: "Stop Loss - Protects against losses. Becomes active when trigger price is hit.",
      "SL-M": "Stop Loss Market - Market order triggered when stop price is reached."
    };
    return tooltips[type] || "";
  };

  const getProductTypeTooltip = (type) => {
    const tooltips = {
      CNC: "Cash and Carry - For delivery trades. Shares will be held in your Demat account.",
      MIS: "Margin Intraday Square-off - For same-day trading with leverage. Must be squared off by 3:20 PM."
    };
    return tooltips[type] || "";
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancelClick}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '8px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: '#e3f2fd',
        color: '#1976d2'
      }}>
        <Typography variant="h6">
          Buy {stockInfo?.symbol || uid}
        </Typography>
        <Chip 
          label={`LTP: ₹${stockInfo?.ltp?.toFixed(2) || 'N/A'}`} 
          color="primary" 
          size="small" 
        />
        {stockInfo?.changePercent && (
          <Chip 
            label={`${stockInfo.changePercent > 0 ? '+' : ''}${stockInfo.changePercent.toFixed(2)}%`}
            color={stockInfo.changePercent >= 0 ? "success" : "error"}
            size="small"
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Exchange Selection */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Exchange</InputLabel>
            <Select
              value={exchange}
              label="Exchange"
              onChange={(e) => setExchange(e.target.value)}
            >
              <MenuItem value="NSE">NSE</MenuItem>
              <MenuItem value="BSE">BSE</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Order Type */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Order Type</InputLabel>
            <Select
              value={orderType}
              label="Order Type"
              onChange={(e) => setOrderType(e.target.value)}
            >
              <MenuItem value="LIMIT">Limit</MenuItem>
              <MenuItem value="MARKET">Market</MenuItem>
              <MenuItem value="SL">Stop Loss</MenuItem>
              <MenuItem value="SL-M">Stop Loss Market</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={getOrderTypeTooltip(orderType)} arrow>
            <IconButton size="small">
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Product Type */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Product Type</InputLabel>
            <Select
              value={productType}
              label="Product Type"
              onChange={(e) => setProductType(e.target.value)}
            >
              <MenuItem value="CNC">CNC (Delivery)</MenuItem>
              <MenuItem value="MIS">MIS (Intraday)</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={getProductTypeTooltip(productType)} arrow>
            <IconButton size="small">
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quantity */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Quantity"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            helperText="Number of shares to buy"
          />
        </Box>

        {/* Price (for Limit orders) */}
        {orderType !== "MARKET" && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Price (₹)"
              type="number"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              inputProps={{ step: 0.05, min: 0 }}
              helperText={orderType === "LIMIT" ? "Maximum price you're willing to pay" : "Stop loss price"}
            />
          </Box>
        )}

        {/* Trigger Price (for Stop Loss orders) */}
        {(orderType === "SL" || orderType === "SL-M") && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Trigger Price (₹)"
              type="number"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              inputProps={{ step: 0.05, min: 0 }}
              helperText="Price at which stop loss order becomes active"
            />
          </Box>
        )}

        {/* Disclosed Quantity */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Disclosed Quantity (Optional)"
            type="number"
            value={disclosedQuantity}
            onChange={(e) => setDisclosedQuantity(e.target.value)}
            inputProps={{ min: 0 }}
            helperText="Leave 0 to disclose full quantity"
          />
        </Box>

        {/* Order Summary */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1, 
          mb: 2 
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Order Summary
          </Typography>
          <Typography variant="body2">
            {orderType} order to buy {stockQuantity} shares of {uid}
          </Typography>
          {orderType !== "MARKET" && (
            <Typography variant="body2">
              At ₹{stockPrice} per share
            </Typography>
          )}
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
            Estimated Cost: ₹{(stockPrice * stockQuantity).toFixed(2)}
          </Typography>
          <Typography variant="body2" color="primary">
            Margin Required: ₹{calculateMarginRequired()}
          </Typography>
        </Box>

        {/* Beginner Tips */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>💡 Beginner Tip:</strong> 
            {orderType === "LIMIT" && " Limit orders give you price control but may not execute if the stock doesn't reach your price."}
            {orderType === "MARKET" && " Market orders execute immediately but at the current market price."}
            {productType === "CNC" && " CNC orders are for long-term investment - shares will be delivered to your Demat account."}
            {productType === "MIS" && " MIS orders must be closed by 3:20 PM the same day."}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleCancelClick} 
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleBuyClick} 
          variant="contained"
          color="primary"
          disabled={loading || !stockQuantity || (orderType !== "MARKET" && !stockPrice)}
          sx={{ minWidth: 100 }}
        >
          {loading ? "Placing..." : `Buy ${stockQuantity} Share${stockQuantity > 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyActionWindow;
