import fetch from 'node-fetch';

const TOKEN_ADDRESS = '0xfC607313E19f9E170bc732AcCcC8Dd73281D1E65';

async function fetchTokenDetails() {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`);
    if (!res.ok) {
      console.error(`Error fetching token details: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    console.log('Token Details:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching token details:', error);
  }
}

fetchTokenDetails();
