import Razorpay from "razorpay"

/* -------------------- CORS HELPER -------------------- */
function allowCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

/* -------------------- RAZORPAY INIT -------------------- */
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/* -------------------- CREATE ORDER API -------------------- */
export async function createOrder(req, res) {
    allowCors(res)

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST allowed" })
    }

    try {
        const { amount } = req.body

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" })
        }

        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount)),
            currency: "INR",
            receipt: "donation_" + Date.now(),
        })

        return res.status(200).json(order)
    } catch (err) {
        console.error("Create order error:", err)
        return res.status(500).json({ error: "Failed to create order" })
    }
}

/* -------------------- VERIFY PAYMENT API -------------------- */
export async function verifyPayment(req, res) {
    allowCors(res)

    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST allowed" })
    }

    try {
        return res.status(200).json({ success: true })
    } catch (err) {
        console.error("Verify payment error:", err)
        return res.status(500).json({ error: "Verification failed" })
    }
}
