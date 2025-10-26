import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { CircleUserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import manadoLightLogo from '../../assets/manado-light.png';
import manadoDarkLogo from '../../assets/manado-dark.png';

interface HeaderProps {
  isLoggedIn: boolean;
  username: string | null;
  onLogout: () => void;
}

export function Header({ isLoggedIn, username, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full flex-row p-4">
      <div className="flex items-center justify-center relative">
        <img src={manadoLightLogo} className="h-[3rem] scale-100 transition-all dark:scale-0" alt="Manado Logo" />
        <img src={manadoDarkLogo} className="absolute h-[3rem] scale-0 transition-all dark:scale-100" alt="Manado Logo" />
      </div>
      <div className="flex items-center justify-center relative gap-2">
        {isLoggedIn ? (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                  <CircleUserRound className="mr-2" /> @{username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={onLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : <div />}
        <ThemeToggle />
      </div>
    </header>
  );
}