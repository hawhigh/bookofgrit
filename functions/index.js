
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        const { itemId, name, price, img } = req.body;

        // Convert price string "$3" to cents: 300
        const amountInCents = parseInt(price.replace(/[^0-9]/g, "")) * 100;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: name,
                                images: [img],
                            },
                            unit_amount: amountInCents,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                // Replace with your actual frontend URLs
                success_url: "https://bookofgrit.web.app/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "https://bookofgrit.web.app/cancel",
                metadata: {
                    itemId: itemId,
                },
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error("Stripe Error:", error);
            res.status(500).json({ error: error.message });
        }
    });
});
