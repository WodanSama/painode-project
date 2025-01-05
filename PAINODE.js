const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN; // Your bot token env
const webhookUrl = process.env.WEBHOOK_URL; // Your Make.com webhook URL env

const bot = new TelegramBot(token, { webHook: { 
  port: process.env.PORT || 3000,
  autoOpen: false
} });

const app = express();
app.use(bodyParser.json());

// Forward message to Make.com (function remains unchanged)
function forwardToWebhook(msg) {
    const payload = {
        Message: msg.text || "(no text provided)", 
        from: msg.from.username || msg.from.id || "(unknown sender)",
        chatId: msg.chat.id || "(unknown chat)",
        messageId: msg.message_id || "(no message ID)"
    };

    console.log("Payload being sent to Make.com:", payload); 

    axios.post(webhookUrl, payload)
        .then(response => {
            console.log("Response status:", response.status);
            console.log("Message forwarded successfully:", response.data);
        })
        .catch(error => {
            if (error.response) {
                console.error("HTTP Error:", error.response.status, error.response.data);
            } else if (error.request) {
                console.error("Request Error:", error.request);
            } else {
                console.error("Error", error.message);
            }
        });
}

// Handle incoming Telegram messages (remains unchanged)
bot.on("message", (msg) => {
    const messageText = msg.text || "";

    if (messageText.startsWith("@AIPeanut_DevBot")) {
        console.log("Forwarding message to Make.com...");
        forwardToWebhook(msg);
        bot.sendMessage(msg.chat.id, "Accepted by Node WtestNode");
        return; 
    }
    bot.sendMessage(msg.chat.id, "Blocked by Node WtestNode");
    console.log("Non-filtered message received:", messageText);
});

// Add webhook endpoint for Vercel
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// For local testing
//if (process.env.NODE_ENV !== 'production') {
//  const PORT = process.env.PORT || 3000;
//  app.listen(PORT, () => {
//    console.log(`Server is running on port ${PORT}`);
//    bot.setWebHook(`localhost:${PORT}/webhook`);
// });
//}

// Export handler for Vercel
module.exports = app;