import React, { useState, useEffect } from "react"; 
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { Edit, Cancel, Info, CheckCircle, Schedule, Error } from "@mui/icons-material";
import axios from "axios";

const Orders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orderBook, setOrderBook] = useState([]);
  const [tradeBook, setTradeBook] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modifyDialog, setModifyDialog] = useState({ open: false, order: null });

  useEffect(() => {
    fetchOrderBook();
    fetchTradeBook();
  }, []);

  const fetchOrderBook = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3002/api/orders/orderbook");
      setOrderBook(response.data || []);
    } catch (err) {
      console.error("Error fetching order book:", err);
      // Mock data for demonstration
      setOrderBook([
        {
          _id: "1",
          symbol: "ITC",
          side: "BUY",
          orderType: "LIMIT",
          quantity: 1,
          price: 261.00,
          status: "OPEN",
          productType: "CNC",
          exchange: "NSE",
          createdAt: new Date().toISOString(),
          orderId: "240001"
        },
        {
          _id: "2",
          symbol: "INFY",
          side: "SELL",
          orderType: "LIMIT",
          quantity: 5,
          price: 1020.50,
          status: "PENDING",
          productType: "MIS",
          exchange: "NSE",
          createdAt: new Date().toISOString(),
          orderId: "240002"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradeBook = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/orders/tradebook");
      setTradeBook(response.data || []);
    } catch (err) {
      console.error("Error fetching trade book:", err);
      // Mock data for demonstration
      setTradeBook([
        {
          _id: "1",
          symbol: "TCS",
          side: "BUY",
          quantity: 2,
          price: 3295.75,
          executedAt: new Date().toISOString(),
          orderId: "240003",
          tradeId: "T240001",
          exchange: "NSE"
        }
      ]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'warning';
      case 'completed':
      case 'executed':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return <Schedule fontSize="small" />;
      case 'completed':
      case 'executed':
        return <CheckCircle fontSize="small" />;
      case 'cancelled':
      case 'rejected':
        return <Error fontSize="small" />;
      default:
        return null;
    }
  };

  const handleModifyOrder = (order) => {
    setModifyDialog({ open: true, order });
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3002/api/orders/cancel/${orderId}`);
      fetchOrderBook(); // Refresh order book
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const OrderBookTab = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>📋 Order Book:</strong> Shows all your pending and open orders. You can modify or cancel orders from here.
        </Typography>
      </Alert>

      {orderBook.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No pending orders
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your buy and sell orders will appear here once placed
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Symbol</strong></TableCell>
                <TableCell><strong>Side</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderBook.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {order.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.symbol}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {order.exchange}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.side} 
                      color={order.side === 'BUY' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.orderType}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {order.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {order.orderType === 'MARKET' ? 'Market' : `₹${order.price?.toFixed(2)}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(order.status)}
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.productType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {(order.status === 'OPEN' || order.status === 'PENDING') && (
                        <>
                          <Tooltip title="Modify Order">
                            <IconButton 
                              size="small" 
                              onClick={() => handleModifyOrder(order)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Order">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const TradeBookTab = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>📊 Trade Book:</strong> Shows all your executed trades. This is your trading receipt with all completed transactions.
        </Typography>
      </Alert>

      {tradeBook.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No executed trades
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your completed buy and sell transactions will appear here
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Trade ID</strong></TableCell>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Symbol</strong></TableCell>
                <TableCell><strong>Side</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Value</strong></TableCell>
                <TableCell><strong>Exchange</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tradeBook.map((trade) => (
                <TableRow key={trade._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                      {trade.tradeId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {trade.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {trade.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={trade.side} 
                      color={trade.side === 'BUY' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {trade.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ₹{trade.price?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{(trade.price * trade.quantity).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {trade.exchange}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(trade.executedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        textAlign: "center", 
        fontStyle: "italic", 
        color: "#333", 
        fontFamily: "'Georgia', serif",
        mb: 3
      }}>
        Order Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tabs">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Order Book ({orderBook.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle />
                Trade Book ({tradeBook.length})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {tabValue === 0 && <OrderBookTab />}
      {tabValue === 1 && <TradeBookTab />}

      {/* Modify Order Dialog */}
      <ModifyOrderDialog 
        open={modifyDialog.open}
        order={modifyDialog.order}
        onClose={() => setModifyDialog({ open: false, order: null })}
        onSuccess={() => {
          setModifyDialog({ open: false, order: null });
          fetchOrderBook();
        }}
      />
    </Box>
  );
};

// Modify Order Dialog Component
const ModifyOrderDialog = ({ open, order, onClose, onSuccess }) => {
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setNewPrice(order.price || 0);
      setNewQuantity(order.quantity || 0);
    }
  }, [order]);

  const handleModify = async () => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:3002/api/orders/modify/${order._id}`, {
        price: newPrice,
        quantity: newQuantity
      });
      onSuccess();
    } catch (err) {
      console.error("Error modifying order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Modify Order - {order.symbol}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            You can modify the price and quantity of your pending order. The order will be updated in the market.
          </Typography>
        </Alert>
        
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="New Price (₹)"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
            fullWidth
            inputProps={{ step: 0.05, min: 0 }}
          />
          <TextField
            label="New Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleModify} 
          variant="contained"
          disabled={loading || !newPrice || !newQuantity}
        >
          {loading ? "Updating..." : "Update Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Orders;
