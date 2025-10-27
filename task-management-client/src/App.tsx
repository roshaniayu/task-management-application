import "./App.css";
import { useState, useEffect } from "react";
import { RegisterForm } from "./components/auth/register-form";
import { LoginForm } from "./components/auth/login-form";
import { KanbanBoard } from "./components/board/kanban-board";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { getAuth, clearAuth, saveAuth } from "./lib/auth";
import { Header } from "./components/navbar/header";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [authVariant, setAuthVariant] = useState<'register' | 'login'>('login');

  const handleAuthSuccess = (token: string, username: string) => {
    saveAuth(token, username);
    setIsLoggedIn(true);
    setUsername(username);
  };

  useEffect(() => {
    const auth = getAuth();
    if (auth.token && auth.username) {
      setIsLoggedIn(true);
      setUsername(auth.username);
    }
  }, [isLoggedIn, username]);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen flex flex-col">
          <Header
            isLoggedIn={isLoggedIn}
            username={username}
            onLogout={handleLogout}
          />
          <main className="mt-6 mx-4">
            {
              isLoggedIn ? (
                <div className="flex flex-col gap-10">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Drag and Drop Kanban Board
                  </h1>
                  <KanbanBoard />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center mb-10">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                      Welcome to Manado
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                      Your Personal <b>Task Management</b> ✅ and <b>To-Do List</b> 📋 Solution Using Kanban Board
                    </p>
                  </div>
                  {authVariant === 'register' ? (
                    <RegisterForm
                      onSwitch={() => setAuthVariant('login')}
                      onAuthSuccess={handleAuthSuccess}
                    />
                  ) : (
                    <LoginForm
                      onSwitch={() => setAuthVariant('register')}
                      onAuthSuccess={handleAuthSuccess}
                    />
                  )}
                </div>
              )
            }
          </main>
          <footer className="mt-10 mb-12 flex flex-col gap-2">
            <Button variant="link" asChild className="scroll-m-20 text-xl font-semibold tracking-tight">
              <a href="https://github.com/roshaniayu/task-management-application/tree/main" target="_blank">GitHub Source Code</a>
            </Button>
            <p className="text-s">💻 with ❤️ by Roshani Ayu Pranasti © 2025</p>
          </footer>
        </div >
      </ThemeProvider >
    </>
  );
}

export default App;
