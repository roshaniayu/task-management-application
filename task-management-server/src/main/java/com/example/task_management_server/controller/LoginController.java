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
import jakarta.validation.constraints.Size;
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
                "token", token));

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Account account = accountService.authenticate(req.username(), req.password());
        if (account == null) {
            throw new AuthenticationException("Invalid username or password");
        }
        String token = jwtService.generateToken(account.getUsername());
        return ResponseEntity.ok(
                Map.of("username", account.getUsername(), "token", token));
    }

    public static record RegisterRequest(
            @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username can only contain alphanumeric characters") String username,

            @NotEmpty(message = "Email cannot be empty") @Email(message = "Please provide a valid email address") String email,

            @NotEmpty(message = "Password cannot be empty") @Size(min = 8, message = "Password must be at least 8 characters long") @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter") @Pattern(regexp = ".*[a-z].*", message = "Password must contain at least one lowercase letter") @Pattern(regexp = ".*\\d.*", message = "Password must contain at least one digit") @Pattern(regexp = ".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*", message = "Password must contain at least one special character") String password) {
    }

    public static record LoginRequest(
            @NotEmpty(message = "Username cannot be empty") String username,

            @NotEmpty(message = "Password cannot be empty") String password) {
    }
}