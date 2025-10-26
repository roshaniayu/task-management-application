package com.example.task_management_server.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "account", schema = "public")
@Getter
@Builder
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

    @OneToMany(mappedBy = "owner", orphanRemoval = true)
    private Set<Task> ownedTasks;

    @ManyToMany(mappedBy = "assignees")
    private Set<Task> assignedTasks;

}