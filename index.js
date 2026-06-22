const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 在这里填你的 Telegram Bot Token
const TOKEN = "8780534518:AAGLKQKcRTkfmHt0LuH2lnFVSpq5AnfelP0";
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

        // 🤖 简单回复逻辑（你可以以后改成AI）
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "你刚刚说的是：" + text
        });

        res.sendStatus(200);
    } catch (err) {
        console.log("错误:", err.message);
        res.sendStatus(200);
    }
});

// 🌐 Render健康检查
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

// ⚙️ Render必须用这个端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Bot running on port", PORT);
});