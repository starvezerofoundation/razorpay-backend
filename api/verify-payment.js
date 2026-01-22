import crypto from "crypto";
import nodemailer from "nodemailer";
import { GoogleSpreadsheet } from "google-spreadsheet";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      amount
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const success = expectedSignature === razorpay_signature;

    // ----------------- GOOGLE SHEETS -----------------
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Name: name,
      Email: email,
      Amount: amount,
      PaymentID: razorpay_payment_id || "FAILED",
      Status: success ? "SUCCESS" : "FAILED",
      Date: new Date().toLocaleString()
    });

    // ----------------- EMAIL -----------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Donation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: success ? "Payment Successful" : "Payment Failed",
      text: success
        ? `Thank you ${name}! Your donation of ₹${amount} was successful.`
        : `Hello ${name}, your payment failed. Please try again.`
    });

    res.status(200).json({ success });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}
