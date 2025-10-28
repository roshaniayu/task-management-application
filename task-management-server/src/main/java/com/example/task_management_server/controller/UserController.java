package com.example.task_management_server.controller;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usernames")
public class UserController {

    private final AccountService accountService;

    @Autowired
    public UserController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<?> getUsernames() {
        List<Account> accounts = accountService.findAll();
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("usernames", accounts.stream().map(Account::getUsername)));
    }

}
