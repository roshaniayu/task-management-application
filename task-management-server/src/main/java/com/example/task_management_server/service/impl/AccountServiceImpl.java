package com.example.task_management_server.service.impl;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.repository.AccountRepository;
import com.example.task_management_server.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordHasher;

    @Autowired
    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
        this.passwordHasher = new BCryptPasswordEncoder();
    }

    /**
     * Register a new user with a BCrypt-hashed password.
     *
     * @throws IllegalArgumentException if user already exists or input invalid
     */
    public Account register(String username, String email, String rawPassword) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        if (accountRepository.existsById(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        String hashed = passwordHasher.encode(rawPassword);
        Account account = Account.builder()
                .username(username)
                .email(email)
                .password(hashed)
                .build();
        account = accountRepository.save(account);

        return account;
    }

    public Account authenticate(String username, String rawPassword) {
        if (username == null || username.isBlank() || rawPassword == null) {
            return null;
        }
        return accountRepository.findById(username)
                .filter(u -> passwordHasher.matches(rawPassword, u.getPassword()))
                .orElse(null);
    }

    public List<Account> findAll() {
        return accountRepository.findAll();
    }
}