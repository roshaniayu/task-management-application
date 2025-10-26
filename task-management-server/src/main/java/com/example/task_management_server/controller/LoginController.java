package com.example.task_management_server.controller;

import com.example.task_management_server.exception.AuthenticationException;
import com.example.task_management_server.exception.BadRequestException;
import com.example.task_management_server.model.Account;
import com.example.task_management_server.service.AccountService;
import com.example.task_management_server.service.JwtService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        Account account;
        try {
            account = accountService.register(req.username(), req.email(), req.password());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        }
        String token = jwtService.generateToken(account.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "username", account.getUsername(),
                "email", account.getEmail(),
                "token", token
        ));

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Account account = accountService.authenticate(req.username(), req.password());
        if (account == null) {
            throw new AuthenticationException("invalid username or password");
        }
        String token = jwtService.generateToken(account.getUsername());
        return ResponseEntity.ok(Map.of("username", account.getUsername(), "token", token));
    }

    public static record RegisterRequest(
            @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username can only contain alphanumeric characters") String username,
            @Email(message = "Email address is invalid") String email,
            @NotEmpty(message = "Password cannot be empty") String password
    ) {

    }

    public static record LoginRequest(
            @NotEmpty(message = "username cannot be empty") String username,
            @NotEmpty(message = "password cannot be empty") String password) {
    }
}
