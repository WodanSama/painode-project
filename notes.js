// Local and Vercel with specific port
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const https = require('https');
const fs = require('fs');

const token = "7160964981:AAF2ILMqsBoREb4hWS1QIt_-1e_ZWZWKK0I"; // Your bot token
const webhookUrl = "https://hook.us2.make.com/fq2o5mke7wrp1kwjlwc63st6qq50dg64"; // Your Make.com webhook URL

const bot = new TelegramBot(token, { webHook: { 
  port: process.env.PORT || 8443, // Use 8443 for local testing; Vercel will handle the port in production
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

// For local testing with SSL
if (process.env.NODE_ENV !== 'production') {
  const PORT = 8443; // Telegram requires one of these ports: 80, 88, 443, or 8443
  
  // Generate or use pre-generated SSL certificates for local testing. 
  // Here we assume you've already created them using mkcert or similar
  const options = {
    key: fs.readFileSync('/Users/paulus/Documents/PEANUTAI/localhost+2-key.pem'),
    cert: fs.readFileSync('/Users/paulus/Documents/PEANUTAI/localhost+2.pem')
  };

  const server = https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    bot.setWebHook(`https://localhost:${PORT}/webhook`).then(() => {
      console.log('Webhook set successfully');
    }).catch((error) => {
      console.error('Failed to set webhook:', error);
    });
  });
} else {
  // For Vercel or other production environments, we don't need to explicitly start the server
  // Vercel will handle the HTTP server setup
  console.log("Running in production mode (Vercel).");
}

// Export handler for Vercel
module.exports = app;

////////

//Local and Vercel version
/*
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const token = "7160964981:AAF2ILMqsBoREb4hWS1QIt_-1e_ZWZWKK0I"; // Your bot token
const webhookUrl = "https://hook.us2.make.com/fq2o5mke7wrp1kwjlwc63st6qq50dg64"; // Your Make.com webhook URL

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
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    bot.setWebHook(`localhost:${PORT}/webhook`);
  });
}

// Export handler for Vercel
module.exports = app;
*/

