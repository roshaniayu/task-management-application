package com.example.task_management_server.controller;

import com.example.task_management_server.exception.ForbiddenException;
import com.example.task_management_server.exception.ResourceNotFoundException;
import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;
import com.example.task_management_server.service.TaskService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<?> getTasks(@RequestAttribute("username") String username) {
        Set<Task> tasks;
        try {
            tasks = taskService.getTasksByUser(username);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }

        return ResponseEntity.ok(Map.of("tasks", tasks.stream()
                .map(task -> {
                    Optional<String> description = Optional.ofNullable(task.getDescription());
                    Optional<String> endDate = Optional.ofNullable(task.getEndDate()).map(Instant::toString);
                    Optional<String> createdAt = Optional.ofNullable(task.getCreatedAt()).map(Instant::toString);
                    List<String> assignees = Optional.ofNullable(task.getAssignees())
                            .map(t -> t.stream().map(Account::getUsername).toList())
                            .orElse(List.of());

                    return Map.of(
                            "id", task.getId(),
                            "title", task.getTitle(),
                            "description", description,
                            "endDate", endDate,
                            "createdAt", createdAt,
                            "status", task.getStatus().name(),
                            "owner", task.getOwner().getUsername(),
                            "assignees", assignees
                    );
                }).toList()
        ));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createTask(
            @RequestAttribute("username") String username,
            @Valid @RequestBody CreateTaskRequest req) {

        Task saved;
        try {
            saved = taskService.createTask(
                    username,
                    req.title(),
                    req.description(),
                    req.endDate(),
                    req.status(),
                    req.assignees()
            );
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }

        Optional<String> description = Optional.ofNullable(saved.getDescription());
        Optional<String> endDate = Optional.ofNullable(saved.getEndDate()).map(Instant::toString);
        Optional<String> createdAt = Optional.ofNullable(saved.getCreatedAt()).map(Instant::toString);
        List<String> assignees = Optional.ofNullable(saved.getAssignees())
                .map(t -> t.stream().map(Account::getUsername).toList())
                .orElse(List.of());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "description", description,
                "endDate", endDate,
                "createdAt", createdAt,
                "owner", saved.getOwner().getUsername(),
                "status", saved.getStatus().name(),
                "assignees", assignees
        ));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateTask(
            @RequestAttribute("username") String username,
            @PathVariable("id") Long id,
            @RequestBody UpdateTaskRequest req) {

        Optional<Task> savedOpt = taskService.updateTaskIfOwner(
                username,
                id,
                req.title(),
                req.description(),
                req.endDate(),
                req.status(),
                req.assignees()
        );

        if (savedOpt.isEmpty()) {
            throw new ForbiddenException("Only owner is allowed to update this task");
        }
        Task saved = savedOpt.get();

        Optional<String> description = Optional.ofNullable(saved.getDescription());
        Optional<String> createdAt = Optional.ofNullable(saved.getCreatedAt()).map(Instant::toString);
        Optional<String> endDate = Optional.ofNullable(saved.getEndDate()).map(Instant::toString);
        List<String> assignees = Optional.ofNullable(saved.getAssignees())
                .map(t -> t.stream().map(Account::getUsername).toList())
                .orElse(List.of());

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "createdAt", createdAt,
                "title", saved.getTitle(),
                "description", description,
                "endDate", endDate,
                "owner", saved.getOwner().getUsername(),
                "status", saved.getStatus().name(),
                "assignees", assignees)
        );
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTask(
            @RequestAttribute("username") String username,
            @PathVariable("id") Long id) {
        boolean ok = taskService.deleteIfOwner(username, id);
        if (!ok) {
            throw new ForbiddenException("Only owner is allowed to update this task");
        }
        return ResponseEntity.noContent().build();
    }

    public static record CreateTaskRequest(
            @NotEmpty(message = "Title cannot be empty") String title,
            String description,
            String endDate,
            String status,
            List<String> assignees) {
    }

    public static record UpdateTaskRequest(
            String title,
            String description,
            String endDate,
            String status,
            List<String> assignees) {
    }

}
