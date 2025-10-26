package com.example.task_management_server.repository;

import com.example.task_management_server.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    // findById from JPA
}