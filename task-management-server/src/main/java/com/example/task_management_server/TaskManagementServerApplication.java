package com.example.task_management_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaskManagementServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskManagementServerApplication.class, args);
    }
}
