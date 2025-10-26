package com.example.task_management_server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.task_management_server.model.User;
import com.example.task_management_server.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Register a new user with a BCrypt-hashed password.
     *
     * @throws IllegalArgumentException if user already exists or input invalid
     */
    public User register(String username, String rawPassword) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("username is required");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("password is required");
        }
        if (userRepository.existsById(username)) {
            throw new IllegalArgumentException("user already exists");
        }

        String hashed = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                .username(username)
                .password(hashed)
                .build();
        user = userRepository.save(user);

        return user;
    }

    public User authenticate(String username, String rawPassword) {
        if (username == null || username.isBlank() || rawPassword == null) {
            return null;
        }
        return userRepository.findById(username)
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPassword()))
                .orElse(null);
    }

}