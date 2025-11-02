package com.example.task_management_server.service;

import com.example.task_management_server.dto.TaskMessage;
import com.example.task_management_server.dto.TaskRecord;

public interface MessageService {
    void sendTaskUpdate(TaskRecord oldTaskRecord, TaskRecord newTaskRecord, TaskMessage.MessageType type);
}
