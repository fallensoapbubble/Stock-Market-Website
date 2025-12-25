const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Demo user data for testing without auth
const DEMO_USER = {
  id: "demo_user_123",
  username: "DemoTrader",
  email: "demo@trader.com",
  balance: {
    equity: 50000,
    commodity: 25000
  }
};

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    res.json(DEMO_USER);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.password;
    delete updates.balance;
    
    // In a real app, you would update the database
    const updatedUser = { ...DEMO_USER, ...updates };
    
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user balance
router.get("/balance", async (req, res) => {
  try {
    res.json(DEMO_USER.balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add funds
router.post("/funds/add", async (req, res) => {
  try {
    const { amount, type = "equity" } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    DEMO_USER.balance[type] += amount;
    
    res.json({ 
      message: "Funds added successfully", 
      balance: DEMO_USER.balance 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw funds
router.post("/funds/withdraw", async (req, res) => {
  try {
    const { amount, type = "equity" } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    if (DEMO_USER.balance[type] < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    DEMO_USER.balance[type] -= amount;
    
    res.json({ 
      message: "Funds withdrawn successfully", 
      balance: DEMO_USER.balance 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;