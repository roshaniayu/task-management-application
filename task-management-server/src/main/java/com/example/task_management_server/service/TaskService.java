package com.example.task_management_server.service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.task_management_server.model.Task;
import com.example.task_management_server.model.User;
import com.example.task_management_server.repository.TaskRepository;
import com.example.task_management_server.repository.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public TaskService(TaskRepository taskRepo, UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    public Task createTask(
            String username,
            String title,
            String description,
            String deadlineStr,
            String statusStr) {

        User owner = userRepo.findById(username).orElseThrow(() -> new IllegalArgumentException("user not found"));

        Task.TaskStatus status = Optional
                .ofNullable(statusStr)
                .map(Task.TaskStatus::valueOf)
                .orElse(Task.TaskStatus.TODO);
        Instant deadline = Optional
                .ofNullable(deadlineStr)
                .map(OffsetDateTime::parse)
                .map(OffsetDateTime::toInstant)
                .orElse(null);

        Task task = Task.builder()
                .title(title)
                .description(description)
                .deadline(deadline)
                .status(status)
                .owner(owner)
                .build();

        return taskRepo.save(task);
    }

    public Set<Task> listTasksForUser(String username) {
        User user = userRepo
                .findById(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        Set<Task> tasks = new HashSet<>();
        tasks.addAll(taskRepo.findByOwner(user));
        tasks.addAll(taskRepo.findByAssignees(user));
        return tasks;
    }

    public Optional<Task> updateTaskIfOwner(
            String username,
            Long id,
            String title,
            String description,
            String deadlineStr,
            String statusStr) {

        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty())
            return Optional.empty();

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username))
            return Optional.empty();

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
        Instant newDeadline = Optional
                .ofNullable(deadlineStr)
                .map(OffsetDateTime::parse)
                .map(OffsetDateTime::toInstant)
                .orElse(task.getDeadline());

        Task updated = task.toBuilder()
                .title(newTitle)
                .description(newDescription)
                .deadline(newDeadline)
                .status(newStatus)
                .build();

        return Optional.of(taskRepo.save(updated));
    }

    public boolean deleteIfOwner(String username, Long id) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty())
            return false;

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username))
            return false;

        taskRepo.delete(task);
        return true;
    }

    public Optional<Task> assignTask(String username, Long id, String targetUsername) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty())
            return Optional.empty();

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username))
            return Optional.empty();

        Optional<User> target = userRepo.findById(targetUsername);
        if (target.isEmpty())
            return Optional.empty();

        task.getAssignees().add(target.get());
        return Optional.of(taskRepo.save(task));
    }

    public Optional<Task> unassignTask(String username, Long id, String targetUsername) {
        Optional<Task> taskOpt = taskRepo.findById(id);
        if (taskOpt.isEmpty())
            return Optional.empty();

        Task task = taskOpt.get();
        if (!task.getOwner().getUsername().equals(username))
            return Optional.empty();

        Optional<User> target = userRepo.findById(targetUsername);
        if (target.isEmpty())
            return Optional.empty();

        task.getAssignees().remove(target.get());
        return Optional.of(taskRepo.save(task));
    }

}