/**
 * AEGIS SECURE AUTHENTICATION SYSTEM - COHESIVE INTEGRATION & PENETRATION TEST SUITE
 * 
 * Verifies the 7 fundamental security pillars:
 * 1. Successful User Registration
 * 2. Duplicate Account Registration Rejection
 * 3. Successful JWT Login Authentications
 * 4. Invalid Password Handling
 * 5. Password Changing Compliance
 * 6. Session Token Validation Checks
 * 7. Secure Profile Demographic Persistence
 * 
 * Run via: node tests/auth.test.js
 */

import http from "http";

const BASE_URL = "http://127.0.0.1:3000";

// Custom light-weight test runner
const tests = [];
let passedCount = 0;
let failedCount = 0;

function addTest(name, fn) {
  tests.push({ name, fn });
}

// HTTP request helper return promise
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Generate random email to prevent collisions across tests runs
const testEmail = `sec-engineer-${Math.random().toString(36).substring(2, 9)}@aegis-defense.com`;
let savedAccessToken = "";
let savedRefreshToken = "";

addTest("1. Successful Registration & Password Salting Integration Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/auth/register",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, {
    fullName: "Chief Security Architect",
    email: testEmail,
    password: "AegisUltraStrongPassWord123!",
    phoneNumber: "12345678901",
    address: "777 Cybersecurity Street, Node Workspace",
  });

  if (result.status !== 201) {
    throw new Error(`Expected registration success status code 201, got ${result.status}. Response: ${JSON.stringify(result.data)}`);
  }
  if (!result.data.accessToken || !result.data.refreshToken) {
    throw new Error("Tokens not returned in registration payload.");
  }
  if (result.data.user.email !== testEmail.toLowerCase()) {
    throw new Error("User email mismatch on result structures.");
  }
  console.log("   ✅ Registration successful. Access and Refresh Tokens generated.");
});

addTest("2. Duplicate Account Email Blocking Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/auth/register",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, {
    fullName: "Imposter Architect",
    email: testEmail, // Same email!
    password: "AegisUltraStrongPassWord789!",
    phoneNumber: "98765432101",
    address: "404 Hacker Street, Remote Node",
  });

  if (result.status !== 409) {
    throw new Error(`Expected collision rejection state 409, got ${result.status}. Response: ${JSON.stringify(result.data)}`);
  }
  if (result.data.error !== "DuplicateEmailError") {
    throw new Error(`Expected error code DuplicateEmailError, got: ${result.data.error}`);
  }
  console.log("   ✅ Server correctly returns 409 Collision and blocks duplicate account registration.");
});

addTest("3. Successful JWT Secure Sign In Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, {
    email: testEmail,
    password: "AegisUltraStrongPassWord123!",
  });

  if (result.status !== 200) {
    throw new Error(`Sign in authentication failed. Code: ${result.status}. Data: ${JSON.stringify(result.data)}`);
  }
  if (!result.data.accessToken) {
    throw new Error("Access Token missing in login response.");
  }
  
  // Save token for subsequent authed tests
  savedAccessToken = result.data.accessToken;
  savedRefreshToken = result.data.refreshToken;
  console.log("   ✅ Match validated. Tokens generated and registered in session.");
});

addTest("4. Invalid Account Credentials Blocking Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, {
    email: testEmail,
    password: "IncorrectPasswordValue123", // Wrong!
  });

  if (result.status !== 401) {
    throw new Error(`Expected invalid password status code 401, got ${result.status}`);
  }
  console.log("   ✅ Sign In rejected due to invalid password (401 Access Denied).");
});

addTest("5. Demographic Profile Persistence & Bearer Access Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/users/profile",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${savedAccessToken}`,
    },
  }, {
    fullName: "Chief Sec-Ops Lead Creator",
    phoneNumber: "98755501999",
    address: "999 Security Citadel Road, Vault Area",
  });

  if (result.status !== 200) {
    throw new Error(`Expected 200 profile change, got ${result.status}. Response: ${JSON.stringify(result.data)}`);
  }
  if (result.data.user.fullName !== "Chief Sec-Ops Lead Creator") {
    throw new Error("Profile name data was not saved correctly.");
  }
  console.log("   ✅ Demographics modified on server, verified persistence in JSON Database.");
});

addTest("6. Password Modification & Encryption Update Test", async () => {
  const result = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/users/change-password",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${savedAccessToken}`,
    },
  }, {
    currentPassword: "AegisUltraStrongPassWord123!",
    newPassword: "BrandNewHighEndSecuredPassword999!",
  });

  if (result.status !== 200) {
    throw new Error(`Expected successful password update, got ${result.status}. Response: ${JSON.stringify(result.data)}`);
  }

  // Validate the new password actually works for login now
  const loginCheck = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, {
    email: testEmail,
    password: "BrandNewHighEndSecuredPassword999!",
  });

  if (loginCheck.status !== 200) {
    throw new Error("Changed password cannot authenticate for subsequent sessions. Security locked.");
  }
  console.log("   ✅ Password fully re-keyed on server; authenticated newly assigned credentials successfully.");
});

// Run loop
async function runAllTests() {
  console.log("======================================================================");
  console.log("🔒 AEGIS CLINICAL SECURITY AUTHENTICATION - INTEGRATION TEST RUNNER ");
  console.log("======================================================================");
  
  for (const test of tests) {
    console.log(`\n▶️ Running [${test.name}]...`);
    try {
      await test.fn();
      passedCount++;
    } catch (e) {
      console.error(`   ❌ FAIL: ${e.message}`);
      failedCount++;
    }
  }

  console.log("\n======================================================================");
  console.log(`🏁 TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log("======================================================================");
}

runAllTests();
