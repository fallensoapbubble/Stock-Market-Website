const express = require("express");
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const User = require("../models/User");
const Holding = require("../models/Holding");
const Position = require("../models/Position");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Demo user ID for testing without auth
const DEMO_USER_ID = "demo_user_123";

// Get all orders for demo user
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ userId: DEMO_USER_ID }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place new order
router.post("/place", async (req, res) => {
  try {
    const {
      symbol,
      exchange = "NSE",
      orderType, // LIMIT, MARKET, SL, SL-M
      side, // BUY, SELL (frontend sends this)
      quantity,
      price,
      triggerPrice,
      productType = "CNC", // CNC, MIS
      validity = "DAY",
      disclosedQuantity = 0
    } = req.body;

    // Map frontend 'side' to backend 'transactionType'
    const transactionType = side;

    console.log("📝 Order placement request:", {
      symbol,
      exchange,
      orderType,
      transactionType,
      quantity,
      price,
      productType
    });

    // Validate required fields
    if (!symbol || !orderType || !transactionType || !quantity) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["symbol", "orderType", "side", "quantity"],
        received: { symbol, orderType, side: transactionType, quantity }
      });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Validate price for non-market orders
    if (orderType !== "MARKET" && (!price || price <= 0)) {
      return res.status(400).json({ error: "Price is required for non-market orders" });
    }

    // Get stock details
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase(), exchange });
    if (!stock) {
      return res.status(404).json({ 
        error: "Stock not found",
        symbol: symbol.toUpperCase(),
        exchange
      });
    }

    console.log("📊 Stock found:", {
      symbol: stock.symbol,
      ltp: stock.ltp,
      exchange: stock.exchange
    });

    // For sell orders, check if user has sufficient holdings
    if (transactionType === "SELL") {
      const holding = await Holding.findOne({
        userId: DEMO_USER_ID,
        symbol: symbol.toUpperCase(),
        exchange
      });

      const availableQuantity = holding ? holding.quantity : 0;
      console.log("🏦 Holdings check:", {
        symbol: symbol.toUpperCase(),
        available: availableQuantity,
        requested: quantity
      });

      if (availableQuantity < quantity) {
        return res.status(400).json({ 
          error: "Insufficient holdings to sell",
          available: availableQuantity,
          requested: quantity,
          symbol: symbol.toUpperCase()
        });
      }
    }

    // Calculate order price and value
    let orderPrice = price;
    if (orderType === "MARKET") {
      orderPrice = stock.ltp;
    }

    const orderValue = quantity * orderPrice;

    console.log("💰 Order calculation:", {
      orderType,
      requestedPrice: price,
      finalPrice: orderPrice,
      quantity,
      orderValue
    });

    // For buy orders, check if user has sufficient balance (simplified for demo)
    if (transactionType === "BUY") {
      // In a real app, you'd check user balance here
      // For demo, we'll assume sufficient balance
      console.log("💳 Buy order - assuming sufficient balance for demo");
    }

    // Create order
    const order = new Order({
      orderId: uuidv4(),
      userId: DEMO_USER_ID,
      symbol: symbol.toUpperCase(),
      exchange,
      orderType,
      transactionType,
      quantity,
      price: orderPrice,
      triggerPrice: triggerPrice || 0,
      productType,
      validity,
      status: orderType === "MARKET" ? "EXECUTED" : "PENDING",
      executedQuantity: orderType === "MARKET" ? quantity : 0,
      executedPrice: orderType === "MARKET" ? stock.ltp : 0,
      orderValue,
      executedAt: orderType === "MARKET" ? new Date() : undefined
    });

    await order.save();

    // For market orders, update holdings/positions immediately
    if (orderType === "MARKET") {
      await updateHoldingsAfterExecution(order, stock);
      console.log("✅ Market order executed and holdings updated");
    } else {
      console.log("⏳ Limit/Stop order placed, pending execution");
    }

    console.log("🎉 Order placed successfully:", {
      orderId: order.orderId,
      status: order.status,
      symbol: order.symbol,
      side: order.transactionType,
      quantity: order.quantity
    });

    res.json({
      success: true,
      message: `${orderType} ${transactionType} order placed successfully`,
      order,
      orderId: order.orderId
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update holdings after order execution
async function updateHoldingsAfterExecution(order, stock) {
  try {
    console.log("🔄 Updating holdings for order:", {
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.transactionType,
      quantity: order.quantity
    });

    if (order.transactionType === "BUY") {
      // Update or create holding
      let holding = await Holding.findOne({
        userId: order.userId,
        symbol: order.symbol,
        exchange: order.exchange
      });

      if (holding) {
        // Update existing holding
        const oldQuantity = holding.quantity;
        const oldAvgPrice = holding.avgPrice;
        const totalQuantity = holding.quantity + order.quantity;
        const totalValue = (holding.quantity * holding.avgPrice) + order.orderValue;
        
        holding.quantity = totalQuantity;
        holding.avgPrice = totalValue / totalQuantity;
        holding.totalInvested = totalValue;
        await holding.save();

        console.log("📈 Updated existing holding:", {
          symbol: order.symbol,
          oldQuantity,
          newQuantity: holding.quantity,
          oldAvgPrice: oldAvgPrice.toFixed(2),
          newAvgPrice: holding.avgPrice.toFixed(2)
        });
      } else {
        // Create new holding
        holding = new Holding({
          userId: order.userId,
          stockId: stock._id,
          symbol: order.symbol,
          quantity: order.quantity,
          avgPrice: order.executedPrice || order.price,
          totalInvested: order.orderValue,
          exchange: order.exchange
        });
        await holding.save();

        console.log("🆕 Created new holding:", {
          symbol: order.symbol,
          quantity: holding.quantity,
          avgPrice: holding.avgPrice.toFixed(2),
          totalInvested: holding.totalInvested.toFixed(2)
        });
      }
      
    } else if (order.transactionType === "SELL") {
      // Update holding
      const holding = await Holding.findOne({
        userId: order.userId,
        symbol: order.symbol,
        exchange: order.exchange
      });

      if (holding) {
        const oldQuantity = holding.quantity;
        holding.quantity -= order.quantity;
        holding.totalInvested = holding.quantity * holding.avgPrice;
        
        if (holding.quantity === 0) {
          await Holding.deleteOne({ _id: holding._id });
          console.log("🗑️ Deleted holding (quantity became 0):", {
            symbol: order.symbol,
            soldQuantity: order.quantity
          });
        } else {
          await holding.save();
          console.log("📉 Updated holding after sell:", {
            symbol: order.symbol,
            oldQuantity,
            newQuantity: holding.quantity,
            soldQuantity: order.quantity
          });
        }
      } else {
        console.error("❌ No holding found to sell from:", {
          symbol: order.symbol,
          userId: order.userId
        });
        throw new Error("No holding found to sell from");
      }
    }

    // Create position for MIS orders
    if (order.productType === "MIS") {
      const position = new Position({
        userId: order.userId,
        stockId: stock._id,
        symbol: order.symbol,
        quantity: order.transactionType === "BUY" ? order.quantity : -order.quantity,
        avgPrice: order.executedPrice || order.price,
        productType: order.productType,
        exchange: order.exchange
      });
      await position.save();

      console.log("📊 Created MIS position:", {
        symbol: order.symbol,
        quantity: position.quantity,
        avgPrice: position.avgPrice
      });
    }

  } catch (error) {
    console.error("❌ Error updating holdings:", error);
    throw error;
  }
}

// Modify order
router.put("/modify/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity, price, orderType } = req.body;

    const order = await Order.findOne({ orderId, userId: DEMO_USER_ID });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Cannot modify executed or cancelled order" });
    }

    // Update order
    if (quantity) order.quantity = quantity;
    if (price) order.price = price;
    if (orderType) order.orderType = orderType;

    order.modifiedAt = new Date();
    await order.save();

    res.json({ message: "Order modified successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.delete("/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId, userId: DEMO_USER_ID });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Cannot cancel executed order" });
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order book (pending orders)
router.get("/orderbook", async (req, res) => {
  try {
    const orders = await Order.find({ 
      userId: DEMO_USER_ID, 
      status: { $in: ["PENDING", "PARTIALLY_EXECUTED"] }
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trade book (executed orders)
router.get("/tradebook", async (req, res) => {
  try {
    const orders = await Order.find({ 
      userId: DEMO_USER_ID, 
      status: { $in: ["EXECUTED", "PARTIALLY_EXECUTED"] }
    }).sort({ executedAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available quantity for selling a specific stock
router.get("/available/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = "NSE" } = req.query;

    const holding = await Holding.findOne({
      userId: DEMO_USER_ID,
      symbol: symbol.toUpperCase(),
      exchange
    });

    const availableQuantity = holding ? holding.quantity : 0;

    res.json({
      symbol: symbol.toUpperCase(),
      exchange,
      availableQuantity,
      holding: holding || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;