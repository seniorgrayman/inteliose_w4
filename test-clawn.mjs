import fetch from 'node-fetch';

const BASE_URL = 'https://clawn.ch/api';

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      console.error(`Error fetching ${endpoint}: ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();
    console.log(`Response from ${endpoint}:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
  }
}

async function runTests() {
  console.log('--- Testing /api/tokens ---');
  await testEndpoint('/tokens');
}

runTests();
