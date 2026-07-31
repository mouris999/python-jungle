import { writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'process';

const rl = createInterface({ input, output });

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

async function main() {
  console.log('\n🔧 Python Jungle — Payment Server Setup\n');
  console.log('You need a Razorpay merchant account.');
  console.log('Sign up at: https://dashboard.razorpay.com/signup\n');
  console.log('After signing up:');
  console.log('1. Go to https://dashboard.razorpay.com/app/keys');
  console.log('2. Generate API Key (Key ID + Key Secret)');
  console.log('3. Your phone 9217517591 will receive payments\n');

  const keyId = await ask('Enter Razorpay Key ID (e.g. rzp_test_xxxx): ');
  const keySecret = await ask('Enter Razorpay Key Secret: ');

  if (!keyId || !keySecret) {
    console.log('\n❌ Both fields are required.');
    rl.close();
    return;
  }

  const config = {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
    merchantPhone: '9217517591'
  };

  writeFileSync('config.json', JSON.stringify(config, null, 2));
  console.log('\n✅ Config saved to config.json');
  console.log(`📱 Payments go to: 9217517591`);
  console.log('\n🚀 Start the server: node server.js');
  console.log(`   Payment server runs on http://localhost:3001\n`);

  rl.close();
}

main();
