const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ====== 环境变量 ======
const BOT_TOKEN = process.env.BOT_TOKEN;

// 👉 Dify配置（你必须在Render里填）
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// ====== Telegram发送消息 ======
async function sendMessage(chatId, text) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      chat_id: chatId,
      text: text,
    }
  );
}

// ====== 调用 Dify ======
async function callDify(userMessage) {
  try {
    const res = await axios.post(
      DIFY_API_URL,
      {
        inputs: {},
        query: userMessage,
        response_mode: "blocking",
        user: "telegram-user",
      },
      {
        headers: {
          Authorization: `Bearer ${DIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Dify完整返回：", JSON.stringify(res.data, null, 2));

    // ====== 兼容不同返回结构 ======
    return (
      res.data?.answer ||
      res.data?.data?.outputs?.text ||
      res.data?.data?.outputs?.result ||
      res.data?.outputs?.text ||
      "（没有返回内容）"
    );

  } catch (err) {
    console.log(
      "❌ Dify请求失败：",
      err?.response?.data || err.message || err
    );
    return "AI服务暂时异常，请稍后再试";
  }
}

// ====== Webhook入口 ======
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const userText = message.text;

    console.log("📩 收到消息：", userText);

    const reply = await callDify(userText);

    await sendMessage(chatId, reply);

  } catch (err) {
    console.log("❌ 主流程错误：", err.message || err);
  }

  res.sendStatus(200);
});

// ====== health check ======
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

// ====== 启动服务 ======
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
