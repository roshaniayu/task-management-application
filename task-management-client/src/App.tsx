import "./App.css";
import { useState } from "react";
import manadoLightLogo from './assets/manado-light.png'
import manadoDarkLogo from './assets/manado-dark.png'
import { RegisterForm } from "./components/auth/register-form";
import { LoginForm } from "./components/auth/login-form";
import { KanbanBoard } from "./components/board/kanban-board";
import { Button } from "./components/ui/button";
import { ThemeToggle } from "./components/theme-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { CircleUserRound } from "lucide-react";

function App() {
  const login = true; // todo: placeholder for login state
  const [authVariant, setAuthVariant] = useState<'register' | 'login'>('register');

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen flex flex-col">
          <header className="flex items-center justify-between w-full flex-row p-4">
            <div className="flex items-center justify-center relative">
              <img src={manadoLightLogo} className="h-[3rem] scale-100 transition-all dark:scale-0" alt="Manado Logo" />
              <img src={manadoDarkLogo} className="absolute h-[3rem] scale-0 transition-all  dark:scale-100" alt="Manado Logo" />
            </div>
            <div className="flex items-center justify-center relative gap-2">
              {
                login ? (
                  <Button variant="outline" className="relative">
                    <CircleUserRound className="mr-2" /> @username
                  </Button>
                ) : (<div />)
              }
              <ThemeToggle />
            </div>
          </header>
          <main className="mt-6 mx-4">
            {
              login ? (
                <div className="flex flex-col gap-10">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Drag and Drop Kanban Board
                  </h1>
                  <KanbanBoard />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center mb-10">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                      Welcome to Manado
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                      Your Personal <b>Task Management</b> ✅ and <b>To-Do List</b> 📋 Solution Using Kanban Board
                    </p>
                  </div>
                  {authVariant === 'register' ? (
                    <RegisterForm onSwitch={() => setAuthVariant('login')} />
                  ) : (
                    <LoginForm onSwitch={() => setAuthVariant('register')} />
                  )}
                </div>
              )
            }
          </main>
          <footer className="mt-10 mb-12 flex flex-col gap-6">
            <div className="leading-7 [&:not(:first-child)]:mt-6">
              <p className="font-bold ">
                Manado: Task Management and To-Do List Application
              </p>
              <p>💻 with ❤️ by Roshani Ayu Pranasti © 2025</p>
            </div>
            <Button variant="link" asChild className="scroll-m-20 text-xl font-semibold tracking-tight">
              <a href="https://github.com/roshaniayu/task-management-application/tree/main" target="_blank">GitHub Source Code</a>
            </Button>
          </footer>
        </div >
      </ThemeProvider >
    </>
  );
}

export default App;
