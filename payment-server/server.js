import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');
const DB_PATH = join(__dirname, 'payments.json');

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    console.error('Config not found! Run: node scripts/setup.js');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadPayments() {
  if (!existsSync(DB_PATH)) return {};
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function savePayments(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const config = loadConfig();
const razorpay = new Razorpay({
  key_id: config.keyId,
  key_secret: config.keySecret
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Serve config for frontend
app.get('/api/config', (req, res) => {
  res.json({ keyId: config.keyId, amount: 100, currency: 'INR' });
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { source: 'python-jungle' }
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment and unlock
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = createHmac('sha256', config.keySecret).update(body).digest('hex');
  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  const db = loadPayments();
  db[razorpay_payment_id] = {
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    status: 'completed',
    amount: 100,
    currency: 'INR',
    phone: config.merchantPhone,
    verifiedAt: new Date().toISOString()
  };
  savePayments(db);
  res.json({ success: true, paymentId: razorpay_payment_id });
});

// Check if a payment ID has been verified
app.get('/api/payment-status/:paymentId', (req, res) => {
  const db = loadPayments();
  const p = db[req.params.paymentId];
  if (p) return res.json({ verified: true, ...p });
  res.json({ verified: false });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
  console.log(`Merchant phone: ${config.merchantPhone}`);
});
