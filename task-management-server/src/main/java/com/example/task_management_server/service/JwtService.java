package com.example.task_management_server.service;

public interface JwtService {
    String generateToken(String username);

    String validateToken(String token);

    String generateTelegramKey(String username);

    String validateTelegramKey(String encTelegramKey);
}
