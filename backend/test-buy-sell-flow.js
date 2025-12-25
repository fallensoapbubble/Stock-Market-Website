const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCompleteBuySellFlow() {
  console.log("🧪 Starting Complete Buy/Sell Flow Test...\n");

  try {
    // 1. Check server health
    console.log("1️⃣ Checking server health...");
    await axios.get(`${BASE_URL}/../health`);
    console.log("✅ Server is running\n");

    // 2. Check initial holdings
    console.log("2️⃣ Checking initial holdings for RELIANCE...");
    const initialHoldings = await axios.get(`${BASE_URL}/orders/available/RELIANCE?exchange=NSE`);
    console.log(`📊 Initial holdings: ${initialHoldings.data.availableQuantity} shares`);
    console.log(`💰 Average price: ₹${initialHoldings.data.holding?.avgPrice?.toFixed(2) || 'N/A'}\n`);

    // 3. Place a buy order
    console.log("3️⃣ Placing buy order (Market)...");
    const buyOrderData = {
      symbol: "RELIANCE",
      exchange: "NSE",
      orderType: "MARKET",
      side: "BUY",
      quantity: 10,
      price: 0,
      productType: "CNC"
    };

    const buyResponse = await axios.post(`${BASE_URL}/orders/place`, buyOrderData);
    console.log(`✅ Buy order placed successfully!`);
    console.log(`📝 Order ID: ${buyResponse.data.orderId}`);
    console.log(`📊 Status: ${buyResponse.data.order.status}`);
    console.log(`💵 Order Value: ₹${buyResponse.data.order.orderValue?.toFixed(2)}\n`);

    // 4. Check updated holdings after buy
    await sleep(1000); // Wait a bit for processing
    console.log("4️⃣ Checking holdings after buy...");
    const holdingsAfterBuy = await axios.get(`${BASE_URL}/orders/available/RELIANCE?exchange=NSE`);
    console.log(`📊 Holdings after buy: ${holdingsAfterBuy.data.availableQuantity} shares`);
    console.log(`💰 New average price: ₹${holdingsAfterBuy.data.holding?.avgPrice?.toFixed(2)}\n`);

    // 5. Place a sell order
    console.log("5️⃣ Placing sell order (Market)...");
    const sellOrderData = {
      symbol: "RELIANCE",
      exchange: "NSE",
      orderType: "MARKET",
      side: "SELL",
      quantity: 5,
      price: 0,
      productType: "CNC"
    };

    const sellResponse = await axios.post(`${BASE_URL}/orders/place`, sellOrderData);
    console.log(`✅ Sell order placed successfully!`);
    console.log(`📝 Order ID: ${sellResponse.data.orderId}`);
    console.log(`📊 Status: ${sellResponse.data.order.status}`);
    console.log(`💵 Order Value: ₹${sellResponse.data.order.orderValue?.toFixed(2)}\n`);

    // 6. Check final holdings after sell
    await sleep(1000); // Wait a bit for processing
    console.log("6️⃣ Checking final holdings after sell...");
    const finalHoldings = await axios.get(`${BASE_URL}/orders/available/RELIANCE?exchange=NSE`);
    console.log(`📊 Final holdings: ${finalHoldings.data.availableQuantity} shares`);
    console.log(`💰 Average price: ₹${finalHoldings.data.holding?.avgPrice?.toFixed(2)}\n`);

    // 7. Check order history
    console.log("7️⃣ Checking order history...");
    const orderHistory = await axios.get(`${BASE_URL}/orders`);
    const recentOrders = orderHistory.data.slice(0, 5);
    console.log(`📚 Total orders: ${orderHistory.data.length}`);
    console.log("Recent orders:");
    recentOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.transactionType} ${order.quantity} ${order.symbol} @ ₹${order.price} - ${order.status}`);
    });

    // 8. Test error cases
    console.log("\n8️⃣ Testing error cases...");
    
    // Try to sell more than available
    try {
      const oversellData = {
        symbol: "RELIANCE",
        exchange: "NSE",
        orderType: "MARKET",
        side: "SELL",
        quantity: 1000, // More than available
        price: 0,
        productType: "CNC"
      };
      await axios.post(`${BASE_URL}/orders/place`, oversellData);
      console.log("❌ Should have failed - oversell not caught");
    } catch (error) {
      console.log(`✅ Oversell correctly rejected: ${error.response.data.error}`);
    }

    // Try to buy non-existent stock
    try {
      const invalidStockData = {
        symbol: "NONEXISTENT",
        exchange: "NSE",
        orderType: "MARKET",
        side: "BUY",
        quantity: 10,
        price: 0,
        productType: "CNC"
      };
      await axios.post(`${BASE_URL}/orders/place`, invalidStockData);
      console.log("❌ Should have failed - invalid stock not caught");
    } catch (error) {
      console.log(`✅ Invalid stock correctly rejected: ${error.response.data.error}`);
    }

    console.log("\n🎉 Complete Buy/Sell Flow Test Completed Successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Initial holdings: ${initialHoldings.data.availableQuantity} shares`);
    console.log(`- After buying 10: ${holdingsAfterBuy.data.availableQuantity} shares`);
    console.log(`- After selling 5: ${finalHoldings.data.availableQuantity} shares`);
    console.log(`- Net change: +${finalHoldings.data.availableQuantity - initialHoldings.data.availableQuantity} shares`);

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Test limit orders
async function testLimitOrders() {
  console.log("\n🎯 Testing Limit Orders...\n");

  try {
    // Place a limit buy order
    console.log("📝 Placing limit buy order...");
    const limitBuyData = {
      symbol: "TCS",
      exchange: "NSE",
      orderType: "LIMIT",
      side: "BUY",
      quantity: 5,
      price: 3000, // Below current market price
      productType: "CNC"
    };

    const limitBuyResponse = await axios.post(`${BASE_URL}/orders/place`, limitBuyData);
    console.log(`✅ Limit buy order placed: ${limitBuyResponse.data.orderId}`);
    console.log(`📊 Status: ${limitBuyResponse.data.order.status} (should be PENDING)\n`);

    // Check order book
    console.log("📋 Checking order book...");
    const orderBook = await axios.get(`${BASE_URL}/orders/orderbook`);
    console.log(`📚 Pending orders: ${orderBook.data.length}`);
    if (orderBook.data.length > 0) {
      console.log("Latest pending order:", {
        symbol: orderBook.data[0].symbol,
        side: orderBook.data[0].transactionType,
        quantity: orderBook.data[0].quantity,
        price: orderBook.data[0].price,
        status: orderBook.data[0].status
      });
    }

    console.log("\n✅ Limit order test completed!");

  } catch (error) {
    console.error("❌ Limit order test failed:", error.response?.data || error.message);
  }
}

async function runAllTests() {
  await testCompleteBuySellFlow();
  await testLimitOrders();
}

runAllTests();