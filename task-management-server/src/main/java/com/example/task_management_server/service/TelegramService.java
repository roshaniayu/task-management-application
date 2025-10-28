package com.example.task_management_server.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TelegramService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramService.class);

    private final RestTemplate restTemplate;
    // In-memory storage for demo purposes. In production, this should be in a database
    private final Map<String, String> userTelegramChats = new HashMap<>();

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.webhook.url:http://127.0.0.1:4040}")
    private String webhookUrl;

    public TelegramService() {
        this.restTemplate = new RestTemplate();
    }

    @PostConstruct
    public void init() {
        logger.info("Initializing Telegram bot: @{}", botUsername);

        if (webhookUrl != null && !webhookUrl.isEmpty()) {
            try {
                setWebhook(webhookUrl);
                logger.info("Webhook set successfully to: {}", webhookUrl);
            } catch (Exception e) {
                logger.error("Failed to set webhook: {}", e.getMessage());
            }
        } else {
            logger.warn("No webhook URL configured. Bot will not receive messages.");
            logger.info("To set up webhook, add telegram.webhook.url to application.properties");
        }
    }

    public void setWebhook(String webhookUrl) {
        String url = String.format("https://api.telegram.org/bot%s/setWebhook", botToken);
        Map<String, String> body = new HashMap<>();
        body.put("url", webhookUrl);
        restTemplate.postForObject(url, body, Object.class);
    }

    public void sendMessage(String chatId, String message) {
        String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);

        Map<String, String> body = new HashMap<>();
        body.put("chat_id", chatId);
        body.put("text", message);
        body.put("parse_mode", "HTML");
        body.put("disable_web_page_preview", "true");

        restTemplate.postForObject(url, body, Object.class);
    }

    public void storeTelegramChat(String username, String chatId) {
        userTelegramChats.put(username, chatId);
    }

    public String getTelegramChat(String username) {
        return userTelegramChats.get(username);
    }

}
