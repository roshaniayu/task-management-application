import "./App.css";
import manadoLightLogo from './assets/manado-light.png'
import manadoDarkLogo from './assets/manado-dark.png'
import { KanbanBoard } from "./components/kanban-board";
import { ThemeToggle } from "./components/theme-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { CircleUserRound } from "lucide-react";

const FooterLink = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button
      variant="link"
      asChild
      className="scroll-m-20 text-xl font-semibold tracking-tight"
    >
      {children}
    </Button>
  );
};

function App() {
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
              <ThemeToggle />
              <Button variant="outline" className="relative">
                <CircleUserRound className="mr-2" /> @username
              </Button>
            </div>
          </header>
          <main className="mt-6 mx-4 flex flex-col gap-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Drag and Drop Kanban Board
            </h1>
            <KanbanBoard />
            <div className="leading-7 [&:not(:first-child)]:mt-6">
              <p className="font-bold ">
                Manado: Task Management and To-Do List Application
              </p>
              <p>💻 with ❤️ by Roshani Ayu Pranasti © 2025</p>
            </div>
          </main>
          <footer className="mt-6">
            <ul className="flex items-center justify-center">
              <li>
                <FooterLink>
                  <a href="https://github.com/roshaniayu/task-management-application/tree/main" target="_blank">GitHub Source Code</a>
                </FooterLink>
              </li>
            </ul>
          </footer>
        </div >
      </ThemeProvider >
    </>
  );
}

export default App;
