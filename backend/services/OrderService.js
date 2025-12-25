const Order = require("../models/Order");
const Stock = require("../models/Stock");
const User = require("../models/User");
const Holding = require("../models/Holding");
const Position = require("../models/Position");
const { v4: uuidv4 } = require("uuid");

class OrderService {
  constructor(io) {
    this.io = io;
  }

  async placeOrder(orderData) {
    try {
      const {
        userId,
        symbol,
        exchange = "NSE",
        orderType,
        transactionType,
        quantity,
        price,
        triggerPrice,
        productType = "CNC",
        validity = "DAY"
      } = orderData;

      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get stock
      const stock = await Stock.findOne({ symbol: symbol.toUpperCase(), exchange });
      if (!stock) {
        throw new Error("Stock not found");
      }

      // Calculate order price and value
      let orderPrice = price;
      if (orderType === "MARKET") {
        orderPrice = stock.ltp;
      }

      const orderValue = quantity * orderPrice;

      // Check balance for buy orders
      if (transactionType === "BUY") {
        const requiredBalance = orderValue;
        if (user.balance.equity < requiredBalance) {
          throw new Error("Insufficient balance");
        }
      }

      // Create order
      const order = new Order({
        orderId: uuidv4(),
        userId,
        symbol: symbol.toUpperCase(),
        exchange,
        orderType,
        transactionType,
        quantity,
        price: orderPrice,
        triggerPrice,
        productType,
        validity,
        orderValue,
        status: "PENDING"
      });

      // For market orders, execute immediately
      if (orderType === "MARKET") {
        await this.executeOrder(order, stock);
      }

      await order.save();

      // Emit order update
      this.io.to(userId).emit("order_update", {
        type: "ORDER_PLACED",
        order: order.toObject()
      });

      return {
        success: true,
        message: "Order placed successfully",
        orderId: order.orderId,
        order: order.toObject()
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }

  async executeOrder(order, stock) {
    try {
      const user = await User.findById(order.userId);
      
      if (order.transactionType === "BUY") {
        // Deduct balance
        user.balance.equity -= order.orderValue;
        await user.save();

        // Update or create holding
        await this.updateHolding(order, stock, "BUY");
        
      } else if (order.transactionType === "SELL") {
        // Add balance
        user.balance.equity += order.orderValue;
        await user.save();

        // Update holding
        await this.updateHolding(order, stock, "SELL");
      }

      // Update order status
      order.status = "EXECUTED";
      order.executedQuantity = order.quantity;
      order.executedPrice = stock.ltp;
      order.executedAt = new Date();

      // Create position for MIS orders
      if (order.productType === "MIS") {
        await this.createPosition(order, stock);
      }

      // Emit execution update
      this.io.to(order.userId.toString()).emit("order_update", {
        type: "ORDER_EXECUTED",
        order: order.toObject()
      });

      console.log(`✅ Order executed: ${order.orderId}`);

    } catch (error) {
      order.status = "REJECTED";
      order.rejectionReason = error.message;
      console.error(`❌ Order execution failed: ${order.orderId}`, error);
    }
  }

  async updateHolding(order, stock, action) {
    try {
      let holding = await Holding.findOne({
        userId: order.userId,
        symbol: order.symbol,
        exchange: order.exchange
      });

      if (action === "BUY") {
        if (holding) {
          // Update existing holding
          const totalQuantity = holding.quantity + order.quantity;
          const totalValue = (holding.quantity * holding.avgPrice) + order.orderValue;
          
          holding.quantity = totalQuantity;
          holding.avgPrice = totalValue / totalQuantity;
          holding.totalInvested = totalValue;
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
        }
        
        await holding.save();
        
      } else if (action === "SELL") {
        if (holding && holding.quantity >= order.quantity) {
          holding.quantity -= order.quantity;
          holding.totalInvested = holding.quantity * holding.avgPrice;
          
          if (holding.quantity === 0) {
            await Holding.deleteOne({ _id: holding._id });
          } else {
            await holding.save();
          }
        } else {
          throw new Error("Insufficient holdings to sell");
        }
      }
    } catch (error) {
      console.error("Error updating holding:", error);
      throw error;
    }
  }

  async createPosition(order, stock) {
    try {
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
    } catch (error) {
      console.error("Error creating position:", error);
    }
  }

  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ orderId, userId });
      
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "PENDING") {
        throw new Error("Cannot cancel executed or already cancelled order");
      }

      order.status = "CANCELLED";
      order.cancelledAt = new Date();
      await order.save();

      // Emit cancellation update
      this.io.to(userId).emit("order_update", {
        type: "ORDER_CANCELLED",
        order: order.toObject()
      });

      return {
        success: true,
        message: "Order cancelled successfully",
        order: order.toObject()
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }

  async modifyOrder(orderId, userId, modifications) {
    try {
      const order = await Order.findOne({ orderId, userId });
      
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "PENDING") {
        throw new Error("Cannot modify executed or cancelled order");
      }

      // Update allowed fields
      if (modifications.quantity) order.quantity = modifications.quantity;
      if (modifications.price) order.price = modifications.price;
      if (modifications.orderType) order.orderType = modifications.orderType;
      if (modifications.triggerPrice) order.triggerPrice = modifications.triggerPrice;

      // Recalculate order value
      order.orderValue = order.quantity * order.price;
      order.modifiedAt = new Date();

      await order.save();

      // Emit modification update
      this.io.to(userId).emit("order_update", {
        type: "ORDER_MODIFIED",
        order: order.toObject()
      });

      return {
        success: true,
        message: "Order modified successfully",
        order: order.toObject()
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = OrderService;