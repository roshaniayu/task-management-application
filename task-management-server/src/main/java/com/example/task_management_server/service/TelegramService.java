package com.example.task_management_server.service;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("unchecked")
public class TelegramService {
    private static final Logger logger = LoggerFactory.getLogger(TelegramService.class);
    private final RestTemplate restTemplate;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private JwtService jwtService;
    private Long lastUpdateId = -1L;

    @Value("${telegram.bot.token}")
    private String botToken;

    public TelegramService() {
        this.restTemplate = new RestTemplate();
    }

    @Scheduled(fixedDelay = 1000)
    public void pollMessages() {
        try {
            String url = String.format(
                    "https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=60",
                    botToken,
                    lastUpdateId + 1);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Boolean ok = (Boolean) response.get("ok");
            List<Map<String, Object>> updates = (List<Map<String, Object>>) response.get("result");

            if (response == null || !ok || updates == null) {
                return;
            }

            for (Map<String, Object> update : updates) {
                Number updateId = (Number) update.get("update_id");
                if (updateId != null) {
                    lastUpdateId = Math.max(lastUpdateId, updateId.longValue());
                }

                Map<String, Object> message = (Map<String, Object>) update.get("message");
                if (message == null) {
                    continue;
                }

                Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                Number chatId = (Number) chat.get("id");
                String text = (String) message.get("text");

                if (chatId == null || text == null) {
                    continue;
                }

                String chatIdStr = String.valueOf(chatId);

                String[] parts = text.split("\\s+");
                if (parts.length == 0) {
                    continue;
                }

                String token = parts[parts.length - 1];
                String username = jwtService.validateTelegramKey(token);
                if (username == null) {
                    continue;
                }

                Optional<Account> accountOpt = accountRepository.findById(username);
                if (accountOpt.isEmpty()) {
                    continue;
                }

                Account account = accountOpt
                        .get()
                        .toBuilder()
                        .telegramId(chatIdStr)
                        .build();
                accountRepository.save(account);

                String welcomeMsg = String.format("🎉 Welcome to Manado Task Management Bot!\n\n" +
                        "Your account (<code>@%s</code>) has been successfully connected. " +
                        "You'll now receive task updates here.", account.getUsername());

                sendMessage(chatIdStr, welcomeMsg);
            }

        } catch (

                Exception e) {
            logger.error("Error polling Telegram messages: {}", e.getMessage(), e);
        }
    }

    public void sendMessage(String chatId, String message) {
        String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);

        Map<String, String> body = new HashMap<>();
        body.put("chat_id", String.valueOf(chatId));
        body.put("text", message);
        body.put("parse_mode", "HTML");
        body.put("disable_web_page_preview", "true");

        try {
            restTemplate.postForObject(url, body, Object.class);
        } catch (Exception e) {
            logger.error("Error sending message to {}: {}", chatId, e.getMessage(), e);
        }
    }

    public String getTelegramChat(String username) {
        return accountRepository.findById(username)
                .map(Account::getTelegramId)
                .orElse(null);
    }

}