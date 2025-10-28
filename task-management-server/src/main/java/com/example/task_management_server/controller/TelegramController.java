package com.example.task_management_server.controller;

import com.example.task_management_server.service.ChatbotService;
import com.example.task_management_server.service.JwtService;
import com.example.task_management_server.service.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/telegram")
public class TelegramController {

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/register")
    public ResponseEntity<Void> registerTelegramChat(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        String chatId = payload.get("chatId");
        String username = jwtService.validateToken(token.substring(7));

        telegramService.storeTelegramChat(username, chatId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/board-summary")
    public ResponseEntity<Map<String, String>> getBoardSummary(@RequestHeader("Authorization") String token) {
        String summary = chatbotService.generateBoardSummary(token);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

}
