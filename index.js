const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ======================
// Telegram
// ======================
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// ======================
// Dify配置（Render环境变量）
// ======================
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// ======================
// webhook入口
// ======================
app.post("/webhook", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.text) {
            return res.sendStatus(200);
        }

        const chatId = message.chat.id;
        const text = message.text;

        console.log("收到消息:", text);

        // ======================
        // 🚀 调用 Dify（关键）
        // ======================
        const difyRes = await axios.post(
            DIFY_API_URL,
            {
                inputs: {
                    text: text
                },
                response_mode: "blocking",
                user: String(chatId)
            },
            {
                headers: {
                    "Authorization": `Bearer ${DIFY_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ======================
        // 🧠 解析返回
        // ======================
        let reply =
            difyRes.data.answer ||
            difyRes.data.data?.outputs?.text ||
            "Dify没有返回内容";

        // ======================
        // 📤 回传 Telegram
        // ======================
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });

        res.sendStatus(200);

    } catch (err) {
        console.log("错误:", err.response?.data || err.message);
        res.sendStatus(200);
    }
});

// ======================
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Bot running on port", PORT);
});
