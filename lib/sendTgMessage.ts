// utils/sendTelegramMessage.ts
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

/**
 * Sends a message to a specific Telegram chat.
 * @param chatId - Telegram chat ID
 * @param text - Message text
 * @param parseMode - Optional parse mode ("Markdown" or "HTML")
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
) {
  try {
    await bot.telegram.sendMessage(chatId, text, { parse_mode: parseMode });
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}
