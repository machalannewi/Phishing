const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const API_URL = "http://localhost:3001/api";

// Test 1: Health Check
async function testHealth() {
  console.log("\n🧪 Testing Health Endpoint...");
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log("✅ Health check:", response.data);
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
  }
}

// Test 2: Get Templates
async function testTemplates() {
  console.log("\n🧪 Testing Templates Endpoint...");
  try {
    const response = await axios.get(`${API_URL}/templates`);
    console.log("✅ Templates:", response.data);
  } catch (error) {
    console.error("❌ Templates failed:", error.message);
  }
}

// Test 3: Send Test Email
async function testEmail() {
  console.log("\n🧪 Testing Single Email...");
  try {
    const response = await axios.post(`${API_URL}/test-email`, {
      email: "your-email@example.com", // Replace with your email
      name: "Test User",
      template: "welcome",
    });
    console.log("✅ Test email:", response.data);
  } catch (error) {
    console.error(
      "❌ Test email failed:",
      error.response?.data || error.message
    );
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting API Tests...\n");
  await testHealth();
  await testTemplates();
  await testEmail();
  console.log("\n✅ All tests completed!\n");
}

runTests();
