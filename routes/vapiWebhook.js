// import express from "express";
// import { handleVoiceQuery } from "../controllers/intent.controller.js";

// const router = express.Router();

// router.post("/vapi-webhook", async (req, res) => {
//   try {
//     console.log("VAPI Webhook Event:", req.body);

//     const result = await handleVoiceQuery(req.body);

//     res.status(200).json({
//       message: "Webhook received and processed",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error processing VAPI webhook:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// export default router;

import express from "express";
import { handleVoiceQuery } from "../controllers/intent.controller.js";

const router = express.Router();

// VAPI Secret Token (stored in .env for security)
const VAPI_SECRET_TOKEN = process.env.VAPI_SECRET_TOKEN;

router.post("/vapi-webhook", async (req, res) => {
  try {
    // Verify secret token from request headers
    const incomingToken = req.headers["x-vapi-signature"]; // or the exact header Vapi uses

    if (!incomingToken || incomingToken !== VAPI_SECRET_TOKEN) {
      return res.status(403).json({ error: "Invalid or missing secret token" });
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