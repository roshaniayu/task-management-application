package com.example.task_management_server.service;

import com.example.task_management_server.model.Account;

import java.util.List;

public interface AccountService {
    Account register(String username, String email, String rawPassword);

    Account authenticate(String username, String rawPassword);

    List<Account> findAll();
}
