import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Add,
  Remove,
  History,
  Info,
  CreditCard,
  Wallet
} from "@mui/icons-material";
import axios from "axios";

const Funds = () => {
  const [balances, setBalances] = useState({
    equity: 600.20,
    commodity: 136.75,
    total: 736.95
  });
  const [addFundsDialog, setAddFundsDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [fundType, setFundType] = useState("equity");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalances();
    fetchTransactions();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/user/balance");
      setBalances(response.data);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/user/transactions");
      setTransactions(response.data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      // Mock data for demonstration
      setTransactions([
        {
          _id: "1",
          type: "CREDIT",
          amount: 1000,
          fundType: "equity",
          description: "Bank transfer from HDFC Bank",
          createdAt: new Date().toISOString(),
          status: "COMPLETED"
        },
        {
          _id: "2",
          type: "DEBIT",
          amount: 500,
          fundType: "equity",
          description: "Withdrawal to bank account",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: "COMPLETED"
        }
      ]);
    }
  };

  const handleAddFunds = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3002/api/user/funds/add", {
        amount: parseFloat(amount),
        fundType
      });
      
      setAddFundsDialog(false);
      setAmount("");
      fetchBalances();
      fetchTransactions();
    } catch (err) {
      console.error("Error adding funds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3002/api/user/funds/withdraw", {
        amount: parseFloat(amount),
        fundType
      });
      
      setWithdrawDialog(false);
      setAmount("");
      fetchBalances();
      fetchTransactions();
    } catch (err) {
      console.error("Error withdrawing funds:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationPercentage = (used, total) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        textAlign: "center", 
        fontStyle: "italic", 
        color: "#333", 
        fontFamily: "'Georgia', serif",
        mb: 3
      }}>
        Fund Management
      </Typography>

      {/* Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Equity Funds</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                ₹{balances.equity?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Available for stock trading
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Utilization: {getUtilizationPercentage(400, balances.equity).toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getUtilizationPercentage(400, balances.equity)} 
                  sx={{ mt: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown sx={{ mr: 1 }} />
                <Typography variant="h6">Commodity Funds</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                ₹{balances.commodity?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Available for commodity trading
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Utilization: {getUtilizationPercentage(50, balances.commodity).toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getUtilizationPercentage(50, balances.commodity)} 
                  sx={{ mt: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Wallet sx={{ mr: 1 }} />
                <Typography variant="h6">Total Balance</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                ₹{balances.total?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Combined available funds
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip 
                  label="Active" 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="Verified" 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddFundsDialog(true)}
          sx={{ minWidth: 150 }}
        >
          Add Funds
        </Button>
        <Button
          variant="outlined"
          startIcon={<Remove />}
          onClick={() => setWithdrawDialog(true)}
          sx={{ minWidth: 150 }}
        >
          Withdraw Funds
        </Button>
      </Box>

      {/* Information Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="info" sx={{ height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Fund Management Tips
            </Typography>
            <Typography variant="body2">
              • <strong>Equity Funds:</strong> Used for buying and selling stocks on NSE/BSE
            </Typography>
            <Typography variant="body2">
              • <strong>Commodity Funds:</strong> Used for trading in gold, silver, crude oil, etc.
            </Typography>
            <Typography variant="body2">
              • <strong>Instant Transfer:</strong> Funds are available immediately after bank transfer
            </Typography>
            <Typography variant="body2">
              • <strong>Withdrawal:</strong> Takes 1-2 business days to reflect in your bank account
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="success" sx={{ height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              🔒 Security Features
            </Typography>
            <Typography variant="body2">
              • All transactions are encrypted and secure
            </Typography>
            <Typography variant="body2">
              • Bank-grade security with 2-factor authentication
            </Typography>
            <Typography variant="body2">
              • Real-time transaction monitoring
            </Typography>
            <Typography variant="body2">
              • Instant SMS and email notifications
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          Recent Transactions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No transactions yet. Add funds to start trading!
            </Typography>
          </Box>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <ListItem key={transaction._id} divider>
                <ListItemIcon>
                  {transaction.type === 'CREDIT' ? (
                    <Add color="success" />
                  ) : (
                    <Remove color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {transaction.type === 'CREDIT' ? 'Funds Added' : 'Funds Withdrawn'}
                      </Typography>
                      <Chip 
                        label={transaction.fundType.toUpperCase()} 
                        size="small" 
                        color="primary"
                      />
                      <Chip 
                        label={transaction.status} 
                        size="small" 
                        color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {transaction.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Typography 
                  variant="h6" 
                  color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                >
                  {transaction.type === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsDialog} onClose={() => setAddFundsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard />
          Add Funds to Trading Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Funds will be instantly available for trading after successful bank transfer.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Fund Type"
              value={fundType}
              onChange={(e) => setFundType(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="equity">Equity Trading</option>
              <option value="commodity">Commodity Trading</option>
            </TextField>
            
            <TextField
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ min: 100, max: 100000 }}
              helperText="Minimum: ₹100, Maximum: ₹1,00,000 per transaction"
            />
            
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Note:</strong> You will be redirected to your bank's secure payment gateway to complete the transaction.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundsDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddFunds} 
            variant="contained"
            disabled={loading || !amount || parseFloat(amount) < 100}
          >
            {loading ? "Processing..." : `Add ₹${amount || 0}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Funds Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance />
          Withdraw Funds to Bank Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Withdrawal will take 1-2 business days to reflect in your bank account.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Fund Type"
              value={fundType}
              onChange={(e) => setFundType(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="equity">Equity Funds</option>
              <option value="commodity">Commodity Funds</option>
            </TextField>
            
            <TextField
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ 
                min: 100, 
                max: fundType === 'equity' ? balances.equity : balances.commodity 
              }}
              helperText={`Available: ₹${fundType === 'equity' ? balances.equity?.toFixed(2) : balances.commodity?.toFixed(2)}`}
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                Funds will be transferred to your registered bank account ending with ****1234.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleWithdrawFunds} 
            variant="contained"
            color="secondary"
            disabled={
              loading || 
              !amount || 
              parseFloat(amount) < 100 || 
              parseFloat(amount) > (fundType === 'equity' ? balances.equity : balances.commodity)
            }
          >
            {loading ? "Processing..." : `Withdraw ₹${amount || 0}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Funds;
