package com.example.task_management_server.model;

import java.io.Serializable;
import java.util.*;

public record TaskMessage(
        TaskRecord oldTaskRecord,
        TaskRecord newTaskRecord,
        MessageType type
) implements Serializable {

    public String getChangeDescription() {
        return switch (type) {
            case CREATED -> String.format("📢 New task created: %s", newTaskRecord.title());
            case UPDATED -> {
                List<String> changes = new ArrayList<>();
                if (!oldTaskRecord.title().equals(newTaskRecord.title())) {
                    changes.add("Title");
                }
                if (!oldTaskRecord.status().equals(newTaskRecord.status())) {
                    changes.add("Status");
                }
                if (!Objects.equals(oldTaskRecord.description(), newTaskRecord.description())) {
                    changes.add("Description");
                }
                if (!Objects.equals(oldTaskRecord.assignees(), newTaskRecord.assignees())) {
                    changes.add("Assignees");
                }
                if (!Objects.equals(oldTaskRecord.endDate(), newTaskRecord.endDate())) {
                    changes.add("End date");
                }

                if (changes.isEmpty()) {
                    yield "📝 Task updated with no field changes";
                }

                yield String.format("📝 Task '%s' updated: %s changed",
                        newTaskRecord.title(),
                        String.join(", ", changes));
            }
            case DELETED -> String.format("🗑️ Task deleted: %s", oldTaskRecord.title());
        };
    }

    public boolean hasImportantChanges() {
        if (type != MessageType.UPDATED) {
            return false;
        }

        return !oldTaskRecord.status().equals(newTaskRecord.status())
                || !oldTaskRecord.title().equals(newTaskRecord.title())
                || !Objects.equals(oldTaskRecord.description(), newTaskRecord.description())
                || !Objects.equals(oldTaskRecord.endDate(), newTaskRecord.endDate())
                || !Objects.equals(oldTaskRecord.assignees(), newTaskRecord.assignees());
    }

    public Set<String> getTelegramIds() {
        Set<String> users = new HashSet<>();
        switch (type) {
            case CREATED -> {
                users.addAll(newTaskRecord.telegramIds());
            }
            case UPDATED -> {
                users.addAll(newTaskRecord.telegramIds());
                users.addAll(oldTaskRecord.telegramIds());
            }
            case DELETED -> {
                users.addAll(oldTaskRecord.telegramIds());
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
