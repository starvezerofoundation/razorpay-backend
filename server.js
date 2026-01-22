const express = require("express")
const Razorpay = require("razorpay")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      payment_capture: 1,
    })

    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Order creation failed" })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})

