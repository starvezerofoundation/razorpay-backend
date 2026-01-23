import Razorpay from "razorpay"

/* -------------------- CORS -------------------- */
function allowCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

/* -------------------- RAZORPAY -------------------- */
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export default async function handler(req, res) {
    allowCors(res)

    // ✅ Preflight CORS
    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST allowed" })
    }

    try {
        const { amount } = req.body

        if (!amount) {
            return res.status(400).json({ error: "Amount required" })
        }

        const order = await razorpay.orders.create({
            amount: Number(amount),
            currency: "INR",
            receipt: "donation_" + Date.now(),
        })

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
        })
    } catch (err) {
        console.error("Create order error:", err)
        return res.status(500).json({
            error: "Unable to create order",
        })
    }
}
