# Manado Task Management Server

This is the backend server for the Manado Task Management application. It provides RESTful APIs for task management, user authentication, and real-time notifications through an event-driven architecture using ActiveMQ.

## Architecture Overview

### Project Structure
```
src/main/java/com/example/task_management_server/
├── TaskManagementServerApplication.java   # Main application with @EnableJms
├── config/
│   ├── WebConfig.java                     # CORS and auth interceptor config
│   └── MQConfig.java                      # ActiveMQ broker configuration
├── controller/
│   ├── LoginController.java               # Authentication endpoints (/auth/*)
│   ├── UserController.java                # Get all accounts (/usernames/*)
│   ├── TaskController.java                # Task CRUD operations (/tasks/*)
│   └── TelegramController.java            # Telegram notifications (/telegram/*)
├── model/
│   ├── Account.java                       # User entity with tasks relationships
│   ├── Task.java                          # Task entity with status enum
│   ├── TaskRecord.java                    # Immutable task state for events
│   └── TaskMessage.java                   # Event message structure
├── repository/
│   ├── AccountRepository.java             # User data access (JPA)
│   └── TaskRepository.java                # Task queries by owner/assignee
├── service/
│   ├── AccountService.java                # User management logic
│   ├── JwtService.java                    # Token generation/validation
│   ├── TaskService.java                   # Task business logic + event publishing
│   ├── MessageService.java                # Event publishing service
│   ├── MessageListenerService.java        # Event handling and notification
│   ├── TelegramService.java               # Telegram message delivery
│   └── ChatbotService.java                # AI-powered task suggestions
├── interceptor/
│   └── AuthInterceptor.java               # JWT validation interceptor
└── exception/
    └── GlobalExceptionHandler.java        # Centralized error handling
```

## Controller Details (API Endpoints)

### LoginController
- Handles user registration and authentication
- POST `/auth/register` - User registration with validation
  - Username (alphanumeric only)
  - Email validation
  - Password (min 8 chars)
- POST `/auth/login` - User authentication with JWT
  - Returns JWT token valid for 30 days
  - Includes username in response

### UserController
- Handles user listing functionality
- GET `/usernames` - Get a list of all usernames
  - Used for task assignment
  - Returns all registered users
  - Requires a valid JWT token

### TaskController
- Manages task operations
- GET `/tasks` - List tasks (owned and assigned)
- POST `/tasks` - Create task with assignees
- PUT `/tasks/{id}` - Update task (owner and assignees only)
- DELETE `/tasks/{id}` - Delete task (owner only)
- All endpoints require a valid JWT token

### TelegramController
- Handles Telegram bot integration
- GET `/telegram/key` - Get connection token
  - Returns unique token for Telegram bot connection
  - Returns empty if already connected
  - Requires valid JWT token
- POST `/telegram/summary` - Send board summary
  - Sends task summary to connected Telegram chat
  - Returns summary text
  - Requires valid JWT token
- Auto-polling mechanism
  - Monitors bot messages every 1 second
  - Handles user connection requests
  - Stores chat IDs in user accounts

## Event-Driven Architecture

The server implements an event-driven architecture using ActiveMQ for real-time notifications:

### Message Flow
1. **Event Publishing** (TaskService):
   - Task Created: Notify owner and assignees
   - Task Updated: Notify if important fields changed (status, title, description, deadline)
   - Task Deleted: Notify all involved users

2. **Message Structure** (TaskMessage):
   - oldTaskRecord: Previous task state (null for creation)
   - newTaskRecord: New task state (null for deletion)
   - type: CREATED, UPDATED, or DELETED
   - Change tracking for important fields

3. **Event Processing** (MessageListenerService):
   - Listens to task_updates queue
   - Filters notifications based on change importance
   - Delivers personalized notifications via Telegram

### Event Types and Notifications

#### Task Creation
- Triggers CREATED event
- Notifies new owner and assignees
- Message: "📢 New task created: {title}"

#### Task Updates
- Triggers UPDATED event
- Notifies when important fields change:
  - Status changes
  - Title changes
  - Description changes
  - Deadline changes
  - Assignee changes
- Message: "📝 Task '{title}' updated: {changes} changed"

#### Task Deletion
- Triggers DELETED event
- Notifies owner and all assignees
- Message: "🗑️ Task deleted: {title}"