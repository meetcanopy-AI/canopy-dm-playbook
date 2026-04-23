const express = require('express');
const path = require('path');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 3031;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/create-checkout', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'How I Closed a $4K Deal Through the DMs',
            description: '10 prompts. No fluff. Just the messages that close. — Canopy Academy'
          },
          unit_amount: 4700
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&product=playbook`,
      cancel_url: `${baseUrl}/`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Checkout failed', detail: err.message });
  }
});

app.post('/create-checkout-kit', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'The Prompt Starter Kit',
            description: '30 copy-paste AI prompts for women in business. — Canopy Academy'
          },
          unit_amount: 2700
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&product=kit`,
      cancel_url: `${baseUrl}/`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Checkout failed', detail: err.message });
  }
});

app.get('/success', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (session.payment_status === 'paid') {
      res.sendFile(path.join(__dirname, 'public', 'success.html'));
    } else {
      res.redirect('/');
    }
  } catch {
    res.redirect('/');
  }
});

app.get('/download', (req, res) => {
  res.download(path.join(__dirname, 'public', 'playbook.pdf'), 'Canopy-Academy-DM-Playbook.pdf');
});

app.get('/download-kit', (req, res) => {
  res.download(path.join(__dirname, 'public', 'prompt-starter-kit.pdf'), 'Canopy-Academy-Prompt-Starter-Kit.pdf');
});

app.listen(PORT, () => {
  console.log(`Canopy Academy store running at http://localhost:${PORT}`);
});
