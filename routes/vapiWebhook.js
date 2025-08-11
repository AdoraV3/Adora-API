import express from "express";
import { handleVoiceQuery } from "../controllers/intent.controller.js";

const router = express.Router();

const VAPI_SECRET_TOKEN = process.env.VAPI_SECRET_TOKEN;
const VAPI_CUSTOM_HEADER_KEY = process.env.VAPI_CUSTOM_HEADER_KEY;
const VAPI_CUSTOM_HEADER_VALUE = process.env.VAPI_CUSTOM_HEADER_VALUE;

router.post("/vapi-webhook", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (token !== VAPI_SECRET_TOKEN) {
      return res.status(401).json({ error: "Invalid secret token" });
    }

    const customHeaderValue = req.headers[VAPI_CUSTOM_HEADER_KEY.toLowerCase()];
    if (!customHeaderValue || customHeaderValue !== VAPI_CUSTOM_HEADER_VALUE) {
      return res.status(403).json({ error: "Invalid or missing custom header" });
    }

    console.log("Verified VAPI Webhook Event:", req.body);

    const result = await handleVoiceQuery(req.body);

    res.status(200).json({
      message: "Webhook received and processed",
      data: result,
    });
  } catch (error) {
    console.error("Error processing VAPI webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;