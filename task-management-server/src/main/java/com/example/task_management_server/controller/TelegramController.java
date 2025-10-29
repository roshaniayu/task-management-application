package com.example.task_management_server.controller;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.repository.AccountRepository;
import com.example.task_management_server.service.ChatbotService;
import com.example.task_management_server.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/telegram")
public class TelegramController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getTelegramKey(@RequestAttribute("username") String username) {
        Optional<Account> accountOpt = accountRepository.findById(username);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("key", ""));
        }

        String telegramKey = accountOpt.get().getTelegramId() == null ? jwtService.generateTelegramKey(username) : null;
        return ResponseEntity.ok(Map.of("key", telegramKey != null ? telegramKey : ""));
    }

    @PostMapping("/summary")
    public ResponseEntity<Map<String, String>> getBoardSummary(@RequestHeader("Authorization") String token) {
        String summary = chatbotService.sendBoardSummary(token);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

}