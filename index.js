const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ======================
// Telegram Token（Render环境变量）
// ======================
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// ======================
// Dify（Render环境变量）
// ======================
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// ======================
// Webhook入口
// ======================
app.post("/webhook", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.text) {
            return res.sendStatus(200);
        }

        const chatId = message.chat.id;
        const text = message.text;

        console.log("📩 收到消息:", text);

        // ======================
        // 🚀 调用 Dify Workflow
        // ======================
        const difyRes = await axios.post(
            DIFY_API_URL,
            {
                inputs: {
                    query: text
                },
                response_mode: "blocking",
                user: String(chatId)
            },
            {
                headers: {
                    Authorization: `Bearer ${DIFY_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("🧠 Dify返回:", JSON.stringify(difyRes.data, null, 2));

        // ======================
        // 🧠 兼容不同返回结构
        // ======================
        let reply =
            difyRes.data?.answer ||
            difyRes.data?.data?.outputs?.text ||
            difyRes.data?.data?.outputs?.result ||
            "⚠️ 没有返回内容";

        // ======================
        // 📤 回 Telegram
        // ======================
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });

        res.sendStatus(200);

    } catch (err) {
        console.log("❌ 错误完整信息:", JSON.stringify(err.response?.data || {}, null, 2));
        console.log("❌ 原始错误:", err.message);

        // 防止Telegram无响应
        try {
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: req.body?.message?.chat?.id,
                text: "⚠️ 系统错误，请查看日志"
            });
        } catch (e) {}

        res.sendStatus(200);
    }
});

// ======================
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Bot running on port", PORT);
});
