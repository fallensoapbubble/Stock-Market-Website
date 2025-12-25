const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

// Test data
const testOrders = [
  {
    name: "Buy Market Order",
    data: {
      symbol: "RELIANCE",
      exchange: "NSE",
      orderType: "MARKET",
      side: "BUY",
      quantity: 10,
      price: 0,
      productType: "CNC"
    }
  },
  {
    name: "Buy Limit Order",
    data: {
      symbol: "TCS",
      exchange: "NSE",
      orderType: "LIMIT",
      side: "BUY",
      quantity: 5,
      price: 3500,
      productType: "CNC"
    }
  },
  {
    name: "Sell Market Order",
    data: {
      symbol: "RELIANCE",
      exchange: "NSE",
      orderType: "MARKET",
      side: "SELL",
      quantity: 5,
      price: 0,
      productType: "CNC"
    }
  }
];

async function testOrderPlacement() {
  console.log("🧪 Starting Order Placement Tests...\n");

  for (const test of testOrders) {
    try {
      console.log(`📝 Testing: ${test.name}`);
      console.log("Request data:", JSON.stringify(test.data, null, 2));
      
      const response = await axios.post(`${BASE_URL}/orders/place`, test.data);
      
      console.log("✅ Success:", response.data.message);
      console.log("Order ID:", response.data.orderId);
      console.log("Status:", response.data.order.status);
      console.log("---");
      
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
      console.log("---");
    }
  }
}

async function testAvailableQuantity() {
  console.log("\n🏦 Testing Available Quantity Check...");
  
  try {
    const response = await axios.get(`${BASE_URL}/orders/available/RELIANCE?exchange=NSE`);
    console.log("✅ Available quantity response:", response.data);
  } catch (error) {
    console.log("❌ Error:", error.response?.data?.error || error.message);
  }
}

async function testOrderHistory() {
  console.log("\n📚 Testing Order History...");
  
  try {
    const response = await axios.get(`${BASE_URL}/orders`);
    console.log("✅ Order history:", response.data.length, "orders found");
    
    if (response.data.length > 0) {
      console.log("Latest order:", {
        orderId: response.data[0].orderId,
        symbol: response.data[0].symbol,
        side: response.data[0].transactionType,
        quantity: response.data[0].quantity,
        status: response.data[0].status
      });
    }
  } catch (error) {
    console.log("❌ Error:", error.response?.data?.error || error.message);
  }
}

async function runTests() {
  try {
    // Check if server is running
    await axios.get(`${BASE_URL}/../health`);
    console.log("🚀 Server is running, starting tests...\n");
    
    await testOrderPlacement();
    await testAvailableQuantity();
    await testOrderHistory();
    
    console.log("\n🎉 All tests completed!");
    
  } catch (error) {
    console.log("❌ Server not running or not accessible:", error.message);
    console.log("Please start the backend server first: npm start");
  }
}

runTests();