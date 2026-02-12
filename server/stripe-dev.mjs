
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Configure storage for local uploads
const storage_local = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'asset_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage_local });

// Log requests
app.use((req, res, next) => {
    console.log(`[STRIPE_DEV] ${req.method} ${req.url}`);
    next();
});

// Mirror for upload.php
app.post('/upload.php', upload.single('file'), (req, res) => {
    // Security check mirror
    const receivedKey = req.headers['x-operator-key'];
    if (receivedKey !== process.env.VITE_OPERATOR_KEY && receivedKey !== 'protocol_omega_99_secure_vault') {
        return res.status(401).json({ status: 'error', message: 'UNAUTHORIZED_PROTOCOL_ACCESS' });
    }

    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    const url = `http://localhost:5173/uploads/${req.file.filename}`;
    console.log(`[STRIPE_DEV] File uploaded: ${url}`);
    res.json({ status: 'success', url: url });
});

// Mirror for delete-asset.php
app.post('/delete-asset.php', (req, res) => {
    const receivedKey = req.headers['x-operator-key'];
    if (receivedKey !== process.env.VITE_OPERATOR_KEY && receivedKey !== 'protocol_omega_99_secure_vault') {
        return res.status(401).json({ status: 'error', message: 'UNAUTHORIZED_PROTOCOL_ACCESS' });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', message: 'No URL provided' });

    const filename = path.basename(url);
    const filepath = path.join(__dirname, '..', 'public', 'uploads', filename);

    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`[STRIPE_DEV] File purged: ${filename}`);
        res.json({ status: 'success', message: 'ASSET_PURGED_FROM_DISK' });
    } else {
        res.status(404).json({ status: 'error', message: 'ASSET_NOT_FOUND_ON_DISK' });
    }
});

// Mirror for download.php
app.get('/download.php', (req, res) => {
    const { file } = req.query;
    if (!file) return res.status(400).send('ACCESS_DENIED: NO_PAYLOAD_SPECIFIED');

    const filepath = path.join(__dirname, '..', 'public', 'uploads', file);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).send('ACCESS_DENIED: ASSET_MISSING');
    }
});

// Mirror for webhook.php
app.post('/webhook.php', (req, res) => {
    console.log(`\n[STRIPE_WEBHOOK_RECEIVED]: ${req.body.type}`);
    // Simulate fulfillment logging
    const log = `[MOCK_AUDIT] ${new Date().toISOString()} | ${req.body.type} | SID: ${req.body.data?.object?.id}\n`;
    fs.appendFileSync('./fulfillment_audit.log', log);
    res.json({ status: 'success' });
});

// Mirror for read-logs.php
app.get('/read-logs.php', (req, res) => {
    // Security check mirror
    const receivedKey = req.headers['x-operator-key'];
    if (receivedKey !== process.env.VITE_OPERATOR_KEY && receivedKey !== 'protocol_omega_99_secure_vault') {
        return res.status(401).json({ status: 'error', message: 'UNAUTHORIZED_PROTOCOL_ACCESS' });
    }

    const logFile = './fulfillment_audit.log';
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8');
        res.json({ status: 'success', logs: logs });
    } else {
        res.json({ status: 'success', logs: 'NO_LOGS_ON_DISK_CURRENTLY' });
    }
});

// Mirror for create-checkout-session.php
app.post('/create-checkout-session.php', async (req, res) => {
    try {
        const { itemId, name, price, img, uid } = req.body;

        // Dynamic success URL to match environment
        const origin = req.headers.origin || 'http://localhost:5173';
        const amountInCents = Math.round(parseFloat(price.replace(/[^0-9.]/g, '')) * 100);
        const mode = itemId?.includes('SUB_') ? 'subscription' : 'payment';

        const sessionParams = {
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: name,
                        images: [img],
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            }],
            mode: mode,
            success_url: `${origin}/success?item_id=${itemId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
                itemId: itemId,
                uid: uid || 'anonymous'
            },
        };

        if (mode === 'subscription') {
            sessionParams.line_items[0].price_data.recurring = { interval: 'month' };
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        // MOCK WEBHOOK TRIGGER (In Dev, we trigger it manually for testing)
        console.log(`\n[DEV_ONLY]: To simulate fulfillment, trigger webhook for session: ${session.id}\n`);

        res.json(session);
    } catch (err) {
        console.error("Create Session Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Mirror for verify-session.php
app.get('/verify-session.php', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: 'SESSION_ID_MISSING' });

        const session = await stripe.checkout.sessions.retrieve(session_id);

        // DEV_BYPASS: Always return paid in local development for testing fulfillment loop
        res.json({
            status: 'paid',
            itemId: session.metadata.itemId,
            uid: session.metadata.uid
        });
    } catch (err) {
        console.error("Verify Session Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`\n🚀 STRIPE_EMULATOR_ACTIVE`);
    console.log(`📡 Mirroring Hostinger PHP environment on port ${PORT}`);
    console.log(`🔑 Using Key Profile: ${process.env.STRIPE_SECRET_KEY?.substring(0, 8)}***\n`);
});
