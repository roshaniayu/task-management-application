package com.example.task_management_server.repository;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Set<Task> findByOwner(Account account);
    Set<Task> findByAssignees(Account account);

}