package com.example.task_management_server.model;

import java.io.Serializable;
import java.util.*;

public record TaskMessage(
        TaskRecord oldTask,
        TaskRecord newTask,
        MessageType type
) implements Serializable {

    public String getChangeDescription() {
        return switch (type) {
            case CREATED -> String.format("New task created: %s", newTask.title());
            case UPDATED -> {
                List<String> changes = new ArrayList<>();
                if (!oldTask.title().equals(newTask.title())) {
                    changes.add("title");
                }
                if (!oldTask.status().equals(newTask.status())) {
                    changes.add("status");
                }
                if (!oldTask.owner().equals(newTask.owner())) {
                    changes.add("owner");
                }
                if (!Objects.equals(oldTask.description(), newTask.description())) {
                    changes.add("description");
                }
                if (!Objects.equals(oldTask.endDate(), newTask.endDate())) {
                    changes.add("endDate");
                }

                if (changes.isEmpty()) {
                    yield "Task updated with no field changes";
                }
                yield String.format("Task '%s' updated: %s changed",
                        newTask.title(),
                        String.join(", ", changes));
            }
            case DELETED -> String.format("Task deleted: %s", oldTask.title());
        };
    }

    public boolean hasImportantChanges() {
        if (type != MessageType.UPDATED) {
            return false;
        }

        return !oldTask.status().equals(newTask.status())
                || !oldTask.title().equals(newTask.title())
                || !Objects.equals(oldTask.description(), newTask.description())
                || !Objects.equals(oldTask.endDate(), newTask.endDate());
    }

    public Set<String> getTelegramIds() {
        Set<String> users = new HashSet<>();
        switch (type) {
            case CREATED -> {
                users.addAll(newTask.telegramIds());
            }
            case UPDATED -> {
                users.addAll(oldTask.telegramIds());
                users.addAll(newTask.telegramIds());
            }
            case DELETED -> {
                users.addAll(oldTask.telegramIds());
            }
        }
        return users;
    }

    public enum MessageType {
        CREATED, // oldTask will be null
        UPDATED, // both oldTask and newTask will have values
        DELETED  // newTask will be null
    }

}
