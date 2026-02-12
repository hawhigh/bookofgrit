
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

// Genkit AI Initialization
const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash', // Use a stable string reference
});

const drillFlow = ai.defineFlow(
    {
        name: 'drillFlow',
        inputSchema: z.object({
            difficulty: z.string().default('OPERATOR'),
            focus: z.string().optional()
        }),
    },
    async (input) => {
        const { text } = await ai.generate({
            prompt: `
        You are the 'Grit Intelligence Agency'. 
        MISSION: Generate a hardcore tactical drill for elite operators.
        DIFFICULTY: ${input.difficulty}
        FOCUS: ${input.focus || 'GENERAL_FORTITUDE'}
        
        STYLE: Stoic, Military-grade, Cold, Brutalist.
        OUTPUT_FORMAT: Provide a JSON object with:
        {
          "title": "A 2-3 word high-impact title",
          "type": "PROTOCOL | MANIFESTO | TACTICAL | CLEARANCE",
          "content": "The actual drill instructions. Use // for comments and [OBJECTIVE] headers. Keep it intense."
        }
        
        JSON ONLY. No markdown.
      `,
            config: { temperature: 1.0 }
        });
        try {
            return JSON.parse(text.replace(/```json|```/g, ''));
        } catch (e) {
            return { title: 'SIGNAL_CORRUPT', type: 'PROTOCOL', content: text };
        }
    }
);

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

// Mirror for ops.php
app.all('/ops.php', upload.single('file'), (req, res) => {
    const action = req.query.action || req.body.action || '';
    console.log(`[STRIPE_DEV] OPS.PHP ACTION: ${action}`);

    if (action === 'read_logs') {
        const logFile = './fulfillment_audit.log';
        if (fs.existsSync(logFile)) {
            const logs = fs.readFileSync(logFile, 'utf8');
            res.json({ status: 'success', logs: logs });
        } else {
            res.json({ status: 'success', logs: 'NO_LOGS_ON_DISK_CURRENTLY' });
        }
    } else if (action === 'delete') {
        const { fileUrl } = req.body;
        const filename = path.basename(fileUrl);
        const filepath = path.join(__dirname, '..', 'public', 'uploads', filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.json({ status: 'success', message: 'ASSET_PURGED' });
        } else {
            res.json({ status: 'success', message: 'ASSET_ALREADY_GONE' });
        }
    } else {
        res.json({ status: 'error', message: 'ACTION_NOT_IMPLEMENTED_IN_DEV' });
    }
});

// Mirror for download.php
app.get('/download.php', (req, res) => {
    const { file } = req.query;
    if (!file) return res.status(400).send('ACCESS_DENIED');
    const filepath = path.join(__dirname, '..', 'public', 'uploads', file);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).send('ASSET_MISSING');
    }
});

// Mirror for webhook.php
app.post('/webhook.php', (req, res) => {
    console.log(`\n[STRIPE_WEBHOOK_RECEIVED]: ${req.body.type}`);
    const log = `[MOCK_AUDIT] ${new Date().toISOString()} | ${req.body.type} | SID: ${req.body.data?.object?.id}\n`;
    fs.appendFileSync('./fulfillment_audit.log', log);
    res.json({ status: 'success' });
});

// Mirror for create-checkout-session.php
app.post('/create-checkout-session.php', async (req, res) => {
    try {
        const { itemId, name, price, img, uid } = req.body;
        const origin = req.headers.origin || 'http://localhost:5173';
        const amountInCents = Math.round(parseFloat(price.replace(/[^0-9.]/g, '')) * 100);
        const mode = itemId?.includes('SUB_') ? 'subscription' : 'payment';
        const sessionParams = {
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: name, images: [img] },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            }],
            mode: mode,
            success_url: `${origin}/success?item_id=${itemId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
                itemId: itemId,
                uid: uid || 'anonymous',
                ...(req.body.metadata || {})
            },
        };
        if (mode === 'subscription') {
            sessionParams.line_items[0].price_data.recurring = { interval: 'month' };
        }
        const session = await stripe.checkout.sessions.create(sessionParams);
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mirror for verify-session.php
app.get('/verify-session.php', async (req, res) => {
    try {
        const { session_id } = req.query;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        res.json({ status: 'paid', itemId: session.metadata.itemId, uid: session.metadata.uid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Genkit AI Signal Generation
app.post('/api/generate-drill', async (req, res) => {
    try {
        console.log(`[GRIT_AI]: Intercepting signal request...`);
        const result = await ai.runFlow(drillFlow, req.body || {});
        res.json(result);
    } catch (err) {
        console.error("Genkit Error:", err.message);
        res.status(500).json({ status: 'error', message: 'SIGNAL_DECODING_FAILED' });
    }
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`\n🚀 GRIT_DEVELOPMENT_NODE_ACTIVE`);
    console.log(`📡 Mirroring Hostinger environment + Genkit AI on port ${PORT}`);
});
