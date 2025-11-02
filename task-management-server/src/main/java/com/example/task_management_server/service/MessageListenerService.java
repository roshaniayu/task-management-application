package com.example.task_management_server.service;

import com.example.task_management_server.dto.TaskMessage;

public interface MessageListenerService {
    void handleTaskUpdate(TaskMessage message);
}
