package com.example.task_management_server.controller;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;
import com.example.task_management_server.service.TaskService;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    @Transactional
    public ResponseEntity<?> createTask(
            @RequestAttribute("username") String username,
            @RequestBody CreateTaskRequest req) {

        Task saved;
        try {
            saved = taskService.createTask(username, req.title(), req.description(), req.deadline(), req.status());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "unknown error"));
        }

        Optional<String> description = Optional.ofNullable(saved.getDescription());
        Optional<String> deadline = Optional.ofNullable(saved.getDeadline()).map(d -> d.toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "description", description,
                "deadline", deadline,
                "status", saved.getStatus().name()));
    }

    @GetMapping
    public ResponseEntity<?> listTasks(@RequestAttribute("username") String username) {
        Set<Task> tasks;
        try {
            tasks = taskService.listTasksForUser(username);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "unknown error"));
        }

        return ResponseEntity.ok(
                tasks.stream()
                        .map(task -> {
                            Optional<String> description = Optional.ofNullable(task.getDescription());
                            Optional<String> deadline = Optional.ofNullable(task.getDeadline()).map(d -> d.toString());
                            List<String> assignees = Optional.ofNullable(task.getAssignees())
                                    .map(t -> t.stream().map(u -> u.getUsername()).toList())
                                    .orElse(List.of());

                            return Map.of(
                                    "id", task.getId(),
                                    "title", task.getTitle(),
                                    "description", description,
                                    "deadline", deadline,
                                    "status", task.getStatus().name(),
                                    "owner", task.getOwner().getUsername(),
                                    "assignees", assignees);
                        }).toList());
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
                req.deadline(),
                req.status());

        if (savedOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "not allowed to update this task"));
        }
        Task saved = savedOpt.get();

        Optional<String> description = Optional.ofNullable(saved.getDescription());
        Optional<String> deadline = Optional.ofNullable(saved.getDeadline()).map(d -> d.toString());
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "description", description,
                "deadline", deadline,
                "status", saved.getStatus().name()));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTask(
            @RequestAttribute("username") String username,
            @PathVariable("id") Long id) {
        boolean ok = taskService.deleteIfOwner(username, id);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "not allowed to delete this task"));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    @Transactional
    public ResponseEntity<?> assignTaskToUser(
            @RequestAttribute("username") String username,
            @PathVariable("id") Long id,
            @RequestBody AssignUnassignTaskRequest req) {

        Optional<Task> savedOpt = taskService.assignTask(username, id, req.username());
        if (savedOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "not allowed to assign this task"));
        }
        Task saved = savedOpt.get();

        List<String> assignees = Optional.ofNullable(saved.getAssignees())
                .map(t -> t.stream().map(Account::getUsername).toList())
                .orElse(List.of());
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "assignees", assignees));
    }

    @PostMapping("/{id}/unassign")
    @Transactional
    public ResponseEntity<?> unassignTaskFromUser(
            @RequestAttribute("username") String username,
            @PathVariable("id") Long id,
            @RequestBody AssignUnassignTaskRequest req) {

        Optional<Task> savedOpt = taskService.unassignTask(username, id, req.username());
        if (savedOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed to unassign this task"));
        }
        Task saved = savedOpt.get();

        List<String> assignees = Optional.ofNullable(saved.getAssignees())
                .map(t -> t.stream().map(Account::getUsername).toList())
                .orElse(List.of());
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "assignees", assignees));
    }

    public static record CreateTaskRequest(
            @NotEmpty String title,
            String description,
            String deadline,
            String status) {
    }

    public static record UpdateTaskRequest(
            String title,
            String description,
            String deadline,
            String status) {
    }

    public static record AssignUnassignTaskRequest(List<String> username) {
    }

}