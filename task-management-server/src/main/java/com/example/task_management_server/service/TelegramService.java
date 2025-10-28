package com.example.task_management_server.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TelegramService {
    private static final Logger logger = LoggerFactory.getLogger(TelegramService.class);

    // In-memory storage for demo purposes. In production, this should be in a database
    private final Map<String, String> userTelegramChats = new HashMap<>();

    private final RestTemplate restTemplate;
    private Long lastUpdateId = -1L;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.webhook.url:http://127.0.0.1:4040}")
    private String webhookUrl;

    public TelegramService() {
        this.restTemplate = new RestTemplate();
    }

    // Run continuously with a 1-second delay between polls
    @Scheduled(fixedDelay = 1000)
    @SuppressWarnings("unchecked")
    public void pollMessages() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                // Build the getUpdates URL with offset and timeout for long polling
                String url = String.format("https://api.telegram.org/bot%s/getUpdates", botToken);

                // Add query parameters for long polling (30 seconds timeout)
                url += String.format("?offset=%d&timeout=30", lastUpdateId + 1);

                // Make the request and get the response
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);

                if (response != null && response.get("ok") == Boolean.TRUE && response.get("result") != null) {
                    List<Map<String, Object>> updates = (List<Map<String, Object>>) response.get("result");

                    for (Map<String, Object> update : updates) {
                        // Get the update ID
                        Number updateId = (Number) update.get("update_id");
                        if (updateId != null) {
                            lastUpdateId = Math.max(lastUpdateId, updateId.longValue());
                        }

                        // Process message if present
                        Map<String, Object> message = (Map<String, Object>) update.get("message");

                        if (message != null) {
                            Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                            String text = (String) message.get("text");
                            String chatId = String.valueOf(chat.get("id"));

                            if (chat != null && text != null) {
                                // Handle commands
                                if (text.startsWith("/start")) {
                                    // Send welcome message with the chat ID
                                    String welcomeMessage = String.format(
                                            "🎉 Welcome to Manado Task Management Bot!\n\n"
                                                    + "Your Chat ID is: %s\n\n"
                                                    + "Copy this ID and paste it in the application to receive task updates.",
                                            chatId);
                                    sendMessage(chatId, welcomeMessage);
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                break;
            }
        }
    }

    public void sendMessage(String chatId, String message) {
        String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);

        Map<String, String> body = new HashMap<>();
        body.put("chat_id", chatId);
        body.put("text", message);
        body.put("parse_mode", "HTML");
        body.put("disable_web_page_preview", "true");

        try {
            restTemplate.postForObject(url, body, Object.class);
        } catch (Exception e) {
            logger.error("Error sending message to {}: {}", chatId, e.getMessage(), e);
        }
    }

    public void storeTelegramChat(String username, String chatId) {
        userTelegramChats.put(username, chatId);
    }

    public String getTelegramChat(String username) {
        return userTelegramChats.get(username);
    }

}
