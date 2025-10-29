package com.example.task_management_server.service;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;
import com.example.task_management_server.model.TaskMessage;
import com.example.task_management_server.repository.AccountRepository;
import com.example.task_management_server.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final AccountRepository userRepo;
    private final MessageService messageService;

    public TaskService(TaskRepository taskRepo, AccountRepository userRepo, MessageService messageService) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.messageService = messageService;
    }

    public Set<Task> getTasksByUser(String username) {
        Account account = userRepo
                .findById(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        Set<Task> tasks = new HashSet<>();
        tasks.addAll(taskRepo.findByOwner(account));
        tasks.addAll(taskRepo.findByAssignees(account));
        return tasks;
    }

    public Task createTask(
            String username,
            String title,
            String description,
            String endDateStr,
            String statusStr,
            List<String> assigneeUsernames) {
        Account owner = userRepo.findById(username).orElseThrow(() -> new IllegalArgumentException("user not found"));

        Task.TaskStatus status = Optional
                .ofNullable(statusStr)
                .map(Task.TaskStatus::valueOf)
                .orElse(Task.TaskStatus.TODO);
        Instant endDate = Optional
                .ofNullable(endDateStr)
                .map(OffsetDateTime::parse)
                .map(OffsetDateTime::toInstant)
                .orElse(null);
        Set<Account> assignees = Optional
                .ofNullable(assigneeUsernames)
                .map(usernames -> userRepo
                        .findAllById(usernames)
                        .stream()
                        .collect(Collectors.toSet()))
                .orElse(Set.of());

        Task task = Task.builder()
                .title(title)
                .description(description)
                .endDate(endDate)
                .status(status)
                .owner(owner)
                .assignees(assignees)
                .build();

        return taskRepo.save(task);
    }

    public Optional<Task> updateTaskIfAllowed(
            String username,
            Long id,
            String title,
            String description,
            String endDateStr,
            String statusStr,
            List<String> assigneeUsernames) {

        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty()) {
            return Optional.empty();
        }

        Task task = taskOpt.get();

        Boolean isOwner = task.getOwner().getUsername().equals(username);
        Boolean isAssignee = task.getAssignees()
                .stream()
                .anyMatch(assignee -> assignee.getUsername().equals(username));

        if (!isOwner && !isAssignee) {
            return Optional.empty();
        }

        String newTitle = Optional
                .ofNullable(title)
                .orElse(task.getTitle());
        Task.TaskStatus newStatus = Optional
                .ofNullable(statusStr)
                .map(Task.TaskStatus::valueOf)
                .orElse(task.getStatus());
        Instant newEndDate = Optional
                .ofNullable(endDateStr)
                .map(OffsetDateTime::parse)
                .map(OffsetDateTime::toInstant)
                .orElse(null);
        Set<Account> assignees = Optional
                .ofNullable(assigneeUsernames)
                .map(usernames -> userRepo
                        .findAllById(usernames)
                        .stream()
                        .collect(Collectors.toSet()))
                .orElse(Set.of());

        Task updated = task.toBuilder()
                .title(newTitle)
                .description(description)
                .endDate(newEndDate)
                .status(newStatus)
                .assignees(assignees)
                .build();
        Task savedTask = taskRepo.save(updated);

        messageService.sendTaskUpdate(task, savedTask, TaskMessage.MessageType.UPDATED);

        return Optional.of(savedTask);
    }

    public boolean deleteIfOwner(String username, Long id) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty()) {
            return false;
        }

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username)) {
            return false;
        }

        taskRepo.delete(task);
        return true;
    }

}
