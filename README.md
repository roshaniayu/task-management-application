# Manado: Task Management and To-Do List Application

This repository contains the source code for _Manado_, a task management and to-do list application, created by **Roshani Ayu Pranasti (G2504973A)**. This individual project is part of the IN6206 Internet & Web Applications Development, Wee Kim Wee School of Communication and Information, Nanyang Technological University, 2025.

## Application Definition

Manado is a modern task management application that combines the visual efficiency of a Kanban board with the convenience of Telegram notifications. It helps users and teams organize tasks, track progress, and stay updated through an intuitive drag-and-drop interface and integrated messaging system.

### Key Features
- Interactive Kanban board with real-time updates
- Multi-user task assignment and collaboration
- Telegram integration for task notifications and summaries
- Dark/light theme support
- Responsive design for all devices

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Java JDK 17 or higher
- Maven
- Telegram Bot Token (for notifications)

### Backend Setup
1. Navigate to server directory:
   \`\`\`bash
   cd task-management-server
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   mvn clean install
   \`\`\`

3. Configure application.properties:
   ```properties
   # Database
   spring.h2.console.enabled=true
   spring.datasource.url=jdbc:h2:file:./testdb;MODE=PostgreSQL
   
   # JWT
   app.jwt.secret=your-secret-key
   app.jwt.expiration-seconds=2592000
   
   # Telegram Bot
   telegram.bot.token=your-bot-token
   telegram.bot.username=your-bot-username
   ```

### Frontend Setup
1. Navigate to client directory:
   \`\`\`bash
   cd task-management-client
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   yarn install
   \`\`\`

## Build and Run

### Backend
1. Start the Spring Boot server:
   \`\`\`bash
   cd task-management-server
   mvn spring-boot:run
   \`\`\`
   Server will start on http://localhost:8080

### Frontend
1. Start the development server:
   \`\`\`bash
   cd task-management-client
   npx vite
   \`\`\`
   Application will be available at http://localhost:5173

## Environment Links

- **Frontend Development Server**: http://localhost:5173
- **Backend API Server**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
- **API Documentation**: http://localhost:8080/swagger-ui.html (when enabled)

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn/ui for UI components
- DND Kit for drag-and-drop
- Vite for build tooling

### Backend
- Java Spring Boot
- H2 Database
- JWT Authentication
- REST API
- Telegram Bot API integration

## Application Objectives

1. **Efficient Task Management**
   - Provide an intuitive Kanban board interface
   - Enable easy task creation, assignment, and tracking
   - Create tasks with title, description, and due date
   - Support real-time status updates through drag-and-drop

2. **Enhanced Collaboration**
   - Allow multiple user assignments per task
   - Facilitate team coordination through shared task views

3. **Seamless Communication**
   - Integrate with Telegram for instant notifications

4. **User Experience**
   - Implement a clean, modern interface
   - Support both dark and light themes
   - Ensure responsive design across devices

5. **Security**
   - JWT-based authentication
   - Secure password handling
   - Protected API endpoints