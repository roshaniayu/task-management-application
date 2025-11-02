package com.example.task_management_server.service;

public interface TelegramService {
    void pollMessages();

    void sendMessage(String chatId, String message);

    String getTelegramChat(String username);
}
