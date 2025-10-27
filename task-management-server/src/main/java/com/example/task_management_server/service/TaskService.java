package com.example.task_management_server.service;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;
import com.example.task_management_server.repository.AccountRepository;
import com.example.task_management_server.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final AccountRepository userRepo;

    public TaskService(TaskRepository taskRepo, AccountRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    public Task createTask(
            String username,
            String title,
            String description,
            String endDateStr,
            String statusStr) {

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

        Task task = Task.builder()
                .title(title)
                .description(description)
                .endDate(endDate)
                .status(status)
                .owner(owner)
                .build();

        return taskRepo.save(task);
    }

    public Set<Task> listTasksForUser(String username) {
        Account account = userRepo
                .findById(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        Set<Task> tasks = new HashSet<>();
        tasks.addAll(taskRepo.findByOwner(account));
        tasks.addAll(taskRepo.findByAssignees(account));
        return tasks;
    }

    public Optional<Task> updateTaskIfOwner(
            String username,
            Long id,
            String title,
            String description,
            String endDateStr,
            String statusStr) {

        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty()) {
            return Optional.empty();
        }

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username)) {
            return Optional.empty();
        }

        String newTitle = Optional
                .ofNullable(title)
                .orElse(task.getTitle());
        String newDescription = Optional
                .ofNullable(description)
                .orElse(task.getDescription());
        Task.TaskStatus newStatus = Optional
                .ofNullable(statusStr)
                .map(Task.TaskStatus::valueOf)
                .orElse(task.getStatus());
        Instant newEndDate = Optional
                .ofNullable(endDateStr)
                .map(OffsetDateTime::parse)
                .map(OffsetDateTime::toInstant)
                .orElse(task.getEndDate());

        Task updated = task.toBuilder()
                .title(newTitle)
                .description(newDescription)
                .endDate(newEndDate)
                .status(newStatus)
                .build();

        return Optional.of(taskRepo.save(updated));
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

    public Optional<Task> assignTask(String username, Long id, List<String> targetUsernames) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty()) {
            return Optional.empty();
        }

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username)) {
            return Optional.empty();
        }

        List<Account> targets = userRepo.findAllById(targetUsernames);
        if (targets.isEmpty()) {
            return Optional.empty();
        }

        task.getAssignees().addAll(targets);
        return Optional.of(taskRepo.save(task));
    }

    public Optional<Task> unassignTask(String username, Long id, List<String> targetUsernames) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty()) {
            return Optional.empty();
        }

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username)) {
            return Optional.empty();
        }

        List<Account> targets = userRepo.findAllById(targetUsernames);
        if (targets.isEmpty()) {
            return Optional.empty();
        }

        task.getAssignees().removeAll(targets);
        return Optional.of(taskRepo.save(task));
    }

}
