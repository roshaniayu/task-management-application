package com.example.task_management_server.service;

import com.example.task_management_server.config.MQConfig;
import com.example.task_management_server.dto.TaskMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class MessageListenerService {

    private final TelegramService telegramService;

    @Autowired
    public MessageListenerService(TelegramService telegramService) {
        this.telegramService = telegramService;
    }

    @JmsListener(destination = MQConfig.TASK_UPDATE_QUEUE)
    public void handleTaskUpdate(TaskMessage message) {
        // For updates, only send if there are important changes
        if (message.type() == TaskMessage.MessageType.UPDATED && !message.hasImportantChanges()) {
            return;
        }

        String notification = message.getChangeDescription();
        Set<String> telegramIds = message.getTelegramIds();

        for (String telegramId : telegramIds) {
            if (telegramId != null) {
                telegramService.sendMessage(telegramId, notification);
            }
        }
    }

}
