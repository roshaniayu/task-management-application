package com.example.task_management_server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "account", schema = "public")
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Account {

    @Id
    @Column(nullable = false, length = 64)
    private String username;

    @Column(nullable = false, columnDefinition = "text")
    private String email;

    @Column(nullable = false, length = 128)
    private String password;

    @Column(nullable = true, length = 64)
    private String telegramId;

}