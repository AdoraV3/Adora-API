import express from "express";
import { handleVoiceQuery } from "../controllers/intent.controller.js";

const router = express.Router();

router.post("/vapi-webhook", async (req, res) => {
  try {
    console.log("VAPI Webhook Event:", req.body);

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
