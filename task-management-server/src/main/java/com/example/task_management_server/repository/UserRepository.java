package com.example.task_management_server.repository;

import com.example.task_management_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Only use findById provided by jpa
}