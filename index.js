const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 从环境变量读取（推荐安全方式）
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// 🤖 接收 Telegram 消息
app.post("/webhook", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.text) {
            return res.sendStatus(200);
        }

        const chatId = message.chat.id;
        const text = message.text;

        console.log("收到消息:", text);

        // 🇨🇳 中文回复逻辑
        const replyText = `🤖 我已经收到你的消息啦：\n\n👉 ${text}`;

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: replyText,
            parse_mode: "HTML"
        });

        res.sendStatus(200);
    } catch (err) {
        console.log("错误:", err.message);
        res.sendStatus(200);
    }
});

// 🌐 健康检查
app.get("/", (req, res) => {
    res.send("机器人运行正常 🚀");
});

// ⚙️ Render端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Bot running on port", PORT);
});
