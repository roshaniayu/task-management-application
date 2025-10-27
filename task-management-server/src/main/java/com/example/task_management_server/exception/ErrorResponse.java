package com.example.task_management_server.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Object errorFields; // For field-specific errors

    public ErrorResponse(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;

        // Try to parse message into a proper map if it's in the format {field=message, field=message}
        if (message != null && message.startsWith("{") && message.endsWith("}")) {
            try {
                String content = message.substring(1, message.length() - 1); // Remove { }
                String[] pairs = content.split(", ");
                java.util.Map<String, String> errorMap = new java.util.HashMap<>();

                for (String pair : pairs) {
                    String[] keyValue = pair.split("=", 2);
                    if (keyValue.length == 2) {
                        errorMap.put(keyValue[0], keyValue[1]);
                    }
                }

                this.errorFields = errorMap;
            } catch (Exception e) {
                this.errorFields = null; // Keep the original message if parsing fails
            }
        }
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Object getErrorFields() {
        return errorFields;
    }

    public void setErrorFields(Object errorFields) {
        this.errorFields = errorFields;
    }
}
