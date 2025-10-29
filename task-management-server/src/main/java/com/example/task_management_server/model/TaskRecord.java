package com.example.task_management_server.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

// Inner record to represent task state
public record TaskRecord(
        Long taskId,
        String title,
        String status,
        String owner,
        String description,
        String endDate,
        Set<String> telegramIds
) implements Serializable {
    public static TaskRecord build(Task task) {
        return new TaskRecord(
                task.getId(),
                task.getTitle(),
                task.getStatus().name(),
                task.getOwner().getUsername(),
                task.getDescription(),
                task.getEndDate() != null ? task.getEndDate().toString() : null,
                getTelegramIds(task.getOwner(), task.getAssignees())
        );
    }

    private static Set<String> getTelegramIds(Account owner, Set<Account> assignees) {
        Set<String> ids = new HashSet<>();
        ids.add(owner.getTelegramId());
        ids.addAll(assignees.stream().map(Account::getTelegramId).collect(Collectors.toSet()));
        return ids;
    }

}
