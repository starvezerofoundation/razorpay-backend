import crypto from "crypto"

/* -------------------- CORS -------------------- */
function allowCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

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
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body

        const body =
            razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex")

        const isValid = expectedSignature === razorpay_signature

        if (!isValid) {
            return res.status(400).json({ success: false })
        }

        return res.status(200).json({ success: true })
    } catch (err) {
        console.error("Verify error:", err)
        return res.status(500).json({ success: false })
    }
}
