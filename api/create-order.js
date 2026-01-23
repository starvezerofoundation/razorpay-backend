function allowCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

export default async function handler(req, res) {
    allowCors(res)

    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    // ... your existing code below (DO NOT change logic)
}

import Razorpay from "razorpay";

export default async function handler(req, res) {

    // ✅ CORS HEADERS
    res.setHeader("Access-Control-Allow-Origin", "https://starvezero.org");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST allowed" });
    }

    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "donation_" + Date.now(),
        });

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });

    } catch (err) {
        console.error("Create order error:", err);
        return res.status(500).json({ error: "Failed to create order" });
    }
}
