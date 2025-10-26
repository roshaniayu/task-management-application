package com.example.task_management_server.model;

import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "user", schema = "public")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class User {

    @Id
    @Column(nullable = false, length = 64)
    private String username;

    @Column(nullable = false, length = 128)
    private String password;

    @OneToMany(mappedBy = "owner", orphanRemoval = true)
    private Set<Task> ownedTasks;

    @ManyToMany(mappedBy = "assignees")
    private Set<Task> assignedTasks;

}