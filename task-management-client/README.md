# Manado Task Management Client

This is the frontend client for the Manado Task Management application. It provides a modern, responsive interface for task management with Kanban board visualization, built using React, TypeScript, and Tailwind CSS.

Developed from a base project: https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui/tree/main 

## Architecture Overview

### Project Structure
```
src/
├── App.tsx                      # Root component with routing
├── main.tsx                     # Application entry point
├── assets/                      # Static assets and images
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx       # Login form with validation
│   │   └── register-form.tsx    # Registration form
│   ├── board/                   # Kanban board components
│   │   ├── kanban-board.tsx     # Main board with DnD
│   │   ├── board-column.tsx     # Column for task status
│   │   ├── task-card.tsx        # Draggable task card
│   │   └── telegram-button.tsx  # Telegram sharing
│   ├── navbar/                  # Navigation components
│   │   ├── header.tsx           # App header with auth state
│   │   └── theme-toggle.tsx     # Dark/light mode switch
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx           # Styled button component
│   │   ├── input.tsx            # Form input component
│   │   ├── card.tsx             # Card container
│   │   ├── dialog.tsx           # Modal dialog
│   │   └── others...            # Other UI components
│   └── theme-provider.tsx       # Theme context provider
└── lib/
    ├── api.ts                   # API client and types
    ├── auth.ts                  # Auth state management
    └── utils.ts                 # Helper functions
```