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
