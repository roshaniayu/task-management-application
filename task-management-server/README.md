# Manado Task Management Server

This is the backend server for the Manado Task Management application. It provides RESTful APIs for task management, user authentication, and Telegram integration.

## Architecture Overview

### Project Structure
```
src/main/java/com/example/task_management_server/
├── TaskManagementServerApplication.java   # Main application with @EnableScheduling
├── config/
│   └── WebConfig.java                    # CORS and auth interceptor config
├── controller/
│   ├── LoginController.java             # Authentication endpoints (/auth/*)
│   ├── UserController.java              # Get all accounts (/usernames/*)
│   ├── TaskController.java              # Task CRUD operations (/tasks/*)
│   └── TelegramController.java          # Telegram notifications (/telegram/*)
├── model/
│   ├── Account.java                    # User entity with tasks relationships
│   └── Task.java                       # Task entity with status enum
├── repository/
│   ├── AccountRepository.java          # User data access (JPA)
│   └── TaskRepository.java             # Task queries by owner/assignee
├── service/
│   ├── AccountService.java            # User management logic
│   ├── JwtService.java                # Token generation/validation
│   ├── TaskService.java               # Task business logic
│   ├── TelegramService.java           # Bot message handling
│   └── ChatbotService.java            # Board summary formatting
├── interceptor/
│   └── AuthInterceptor.java          # JWT validation interceptor
└── exception/
    └── GlobalExceptionHandler.java    # Centralized error handling
```

## Controller Details (APIs)
- **LoginController**: Handles user registration and authentication
  - POST `/auth/register` - User registration with validation
  - POST `/auth/login` - User authentication with JWT
  - Parameters validated with annotations (@Email, @Size, etc.)

- **UserController**: Handles user listing
  - GET `/usernames` - Get list of all usernames for task assignment
  - Returns usernames of all registered users
  - Requires valid JWT token

- **TaskController**: Manages task operations
  - GET `/tasks` - List tasks (owned and assigned)
  - POST `/tasks` - Create task with assignees
  - PUT `/tasks/{id}` - Update task (owner and assignees only)
  - DELETE `/tasks/{id}` - Delete task (owner only)
  - All endpoints require valid JWT token

- **TelegramController**: Handles Telegram integration
  - POST `/telegram/register` - Link Telegram chat with user account
  - GET `/telegram/board-summary` - Get current board state summary
  - Both endpoints require valid JWT token
  - Manages Telegram notifications and updates
