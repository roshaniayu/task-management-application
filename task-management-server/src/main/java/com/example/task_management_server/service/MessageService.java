package com.example.task_management_server.service;

import com.example.task_management_server.config.MQConfig;
import com.example.task_management_server.model.TaskMessage;
import com.example.task_management_server.model.TaskRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private final JmsTemplate jmsTemplate;

    @Autowired
    public MessageService(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void sendTaskUpdate(TaskRecord oldTaskRecord, TaskRecord newTaskRecord, TaskMessage.MessageType type) {
        try {
            TaskMessage message = new TaskMessage(
                    oldTaskRecord,
                    newTaskRecord,
                    type
            );

            jmsTemplate.convertAndSend(MQConfig.TASK_UPDATE_QUEUE, message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
