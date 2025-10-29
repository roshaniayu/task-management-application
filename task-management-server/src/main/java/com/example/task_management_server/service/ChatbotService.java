package com.example.task_management_server.service;

import com.example.task_management_server.model.Account;
import com.example.task_management_server.model.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ChatbotService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy")
            .withZone(ZoneId.systemDefault());

    @Autowired
    private TaskService taskService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TelegramService telegramService;

    private String formatDate(Instant instant) {
        return DATE_FORMATTER.format(instant);
    }

    public String sendBoardSummary(String token) {
        String username = jwtService.validateToken(token.substring(7));
        Set<Task> tasks = taskService.getTasksByUser(username);

        // Count tasks by status
        Map<String, Long> statusCounts = new HashMap<>();
        for (Task task : tasks) {
            Task.TaskStatus status = task.getStatus();
            statusCounts.merge(status.name(), 1L, Long::sum);
        }

        // Count tasks assigned to the current user
        long assignedToMe = 0;
        for (Task task : tasks) {
            Set<Account> assignees = task.getAssignees();
            if (assignees.stream().anyMatch(account -> account.getUsername().equals(username))) {
                assignedToMe++;
            }
        }

        // Count tasks owned by the current user
        long ownedByMe = 0;
        for (Task task : tasks) {
            Account owner = task.getOwner();
            if (owner.getUsername().equals(username)) {
                ownedByMe++;
            }
        }

        // Generate summary
        StringBuilder summary = new StringBuilder();
        summary.append("📋 Board Summary\n\n");

        // Overall stats
        summary.append("📊 Overall Status:\n");
        summary.append("• Todo: ").append(statusCounts.getOrDefault("TODO", 0L)).append("\n");
        summary.append("• In Progress: ").append(statusCounts.getOrDefault("IN_PROGRESS", 0L)).append("\n");
        summary.append("• Done: ").append(statusCounts.getOrDefault("DONE", 0L)).append("\n\n");

        // Personal stats
        summary.append("👤 Your Tasks:\n");
        summary.append("• Assigned to you: ").append(assignedToMe).append("\n");
        summary.append("• Created by you: ").append(ownedByMe).append("\n\n");

        // Task details by status
        summary.append("Your Task Details:\n");

        // To-do tasks
        summary.append("📌 To Do:\n");
        if (statusCounts.getOrDefault("TODO", 0L).equals(0L)) {
            summary.append("-\n");
        } else {
            tasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.TODO
                            && (task.getAssignees().stream().anyMatch(a -> a.getUsername().equals(username))
                            || task.getOwner().getUsername().equals(username)))
                    .forEach(task -> {
                        summary.append("• ").append(task.getTitle());
                        if (task.getEndDate() != null) {
                            summary.append(" (Due: ").append(formatDate(task.getEndDate())).append(")");
                        }
                        summary.append("\n");
                    });
        }
        summary.append("\n");

        // In Progress tasks
        summary.append("🔄 In Progress:\n");
        if (statusCounts.getOrDefault("IN_PROGRESS", 0L).equals(0L)) {
            summary.append("-\n");
        } else {
            tasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.IN_PROGRESS
                            && (task.getAssignees().stream().anyMatch(a -> a.getUsername().equals(username))
                            || task.getOwner().getUsername().equals(username)))
                    .forEach(task -> {
                        summary.append("• ").append(task.getTitle());
                        if (task.getEndDate() != null) {
                            summary.append(" (Due: ").append(formatDate(task.getEndDate())).append(")");
                        }
                        summary.append("\n");
                    });
        }
        summary.append("\n");

        // Done tasks
        summary.append("✅ Done:\n");
        if (statusCounts.getOrDefault("DONE", 0L).equals(0L)) {
            summary.append("-\n");
        } else {
            tasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.DONE
                            && (task.getAssignees().stream().anyMatch(a -> a.getUsername().equals(username))
                            || task.getOwner().getUsername().equals(username)))
                    .forEach(task -> {
                        summary.append("• ").append(task.getTitle());
                        if (task.getEndDate() != null) {
                            summary.append(" (Completed before: ").append(formatDate(task.getEndDate())).append(")");
                        }
                        summary.append("\n");
                    });
        }
        summary.append("\n");

        // Urgent tasks (due within 3 days)
        summary.append("⚠️ Urgent Tasks (Due within 3 days):\n");
        int urgentCount = 0;
        for (Task task : tasks) {
            Set<Account> assignees = task.getAssignees();
            if (!(assignees.stream().anyMatch(account -> account.getUsername().equals(username))
                    || task.getOwner().getUsername().equals(username))) {
                continue;
            }

            Instant endDate = task.getEndDate();
            if (endDate == null) {
                continue;
            }

            long daysUntilDue = (endDate.toEpochMilli() - System.currentTimeMillis()) / (1000 * 60 * 60 * 24);
            if (daysUntilDue <= 3 && daysUntilDue >= 0) {
                urgentCount++;
                summary.append("• ").append(task.getTitle())
                        .append(" (Due: ").append(formatDate(task.getEndDate())).append(")")
                        .append(" - ").append(daysUntilDue == 0 ? "Due today!" : daysUntilDue == 1 ? daysUntilDue + " day left" : daysUntilDue + " days left")
                        .append("\n");
            }
        }

        if (urgentCount == 0) {
            summary.append("-\n");
        }

        summary.append("\n");
        String summaryText = summary.toString();

        // Send to Telegram if user has registered their chat
        String chatId = telegramService.getTelegramChat(username);
        if (chatId != null) {
            telegramService.sendMessage(chatId, summaryText);
        }

        return summaryText;
    }

}