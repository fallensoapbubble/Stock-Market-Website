const { spawn } = require('child_process');
const axios = require('axios');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get('http://localhost:3002/health');
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for server... (${i + 1}/${maxAttempts})`);
      await sleep(2000);
    }
  }
  return false;
}

async function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function setupAndTest() {
  console.log("🚀 Setting up and testing buy/sell functionality...\n");

  try {
    // 1. Initialize stock data
    console.log("1️⃣ Initializing stock data...");
    await runCommand('node', ['init-data.js']);
    console.log("✅ Stock data initialized\n");

    // 2. Initialize holdings
    console.log("2️⃣ Initializing demo holdings...");
    await runCommand('node', ['init-holdings.js']);
    console.log("✅ Demo holdings initialized\n");

    // 3. Check if server is already running
    console.log("3️⃣ Checking if server is running...");
    try {
      await axios.get('http://localhost:3002/health');
      console.log("✅ Server is already running\n");
    } catch (error) {
      console.log("⚠️ Server not running. Please start it manually with: npm start");
      console.log("Then run the tests with: node test-buy-sell-flow.js");
      return;
    }

    // 4. Run tests
    console.log("4️⃣ Running buy/sell flow tests...");
    await runCommand('node', ['test-buy-sell-flow.js']);
    console.log("✅ All tests completed!\n");

    console.log("🎉 Setup and testing completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Start the frontend: cd ../frontend && npm run dev");
    console.log("2. Test the buy/sell functionality in the UI");
    console.log("3. Check the browser console for detailed logs");

  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setupAndTest();