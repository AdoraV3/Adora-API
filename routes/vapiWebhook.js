import express from "express";
import { handleVoiceQuery } from "../controllers/intent.controller.js";

const router = express.Router();

const VAPI_SECRET_TOKEN = process.env.VAPI_SECRET_TOKEN;

router.post("/vapi-webhook", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (token !== VAPI_SECRET_TOKEN) {
      return res.status(401).json({ error: "Invalid secret token" });
    }

    console.log("Verified VAPI Webhook Event:", req.body);

    await handleVoiceQuery(req, res);

  } catch (error) {
    console.error("Error processing VAPI webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;