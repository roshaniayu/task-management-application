package com.example.task_management_server.controller;

import java.util.Map;

import com.example.task_management_server.model.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.task_management_server.service.JwtService;
import com.example.task_management_server.service.AccountService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/auth")
public class LoginController {

    private final AccountService accountService;
    private final JwtService jwtService;

    @Autowired
    public LoginController(AccountService accountService, JwtService jwtService) {
        this.accountService = accountService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        try {
            Account account = accountService.register(req.username(), req.password());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("username", account.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Account account = accountService.authenticate(req.username(), req.password());
        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid credentials"));
        }
        String token = jwtService.generateToken(account.getUsername());
        return ResponseEntity.ok(Map.of("username", account.getUsername(), "token", token));
    }

    public static record RegisterRequest(String username, String password) {
    }

    public static record LoginRequest(String username, String password) {
    }
}