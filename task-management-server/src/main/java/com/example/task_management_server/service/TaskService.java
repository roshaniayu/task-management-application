package com.example.task_management_server.service;

import com.example.task_management_server.model.Task;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TaskService {
    Set<Task> getTasksByUser(String username);

    Task createTask(
            String username,
            String title,
            String description,
            String endDateStr,
            String statusStr,
            List<String> assigneeUsernames);

    Optional<Task> updateTaskIfAllowed(
            String username,
            Long id,
            String title,
            String description,
            String endDateStr,
            String statusStr,
            List<String> assigneeUsernames);

    boolean deleteIfOwner(String username, Long id);

}
