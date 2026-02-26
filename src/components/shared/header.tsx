"use client";

import { Bell, Search, LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/shared/command-palette";
import { logout } from "@/app/(auth)/actions";
import { useState } from "react";

export function Header() {
    const { theme, setTheme } = useTheme();
    const [commandOpen, setCommandOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
                {/* Left — Page title area (placeholder) */}
                <div className="flex items-center gap-4 pl-8 lg:pl-0">
                    {/* Search trigger */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommandOpen(true)}
                        className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg border border-border bg-muted/50"
                    >
                        <Search className="w-4 h-4" strokeWidth={1.75} />
                        <span className="text-sm">Search...</span>
                        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                            ⌘K
                        </kbd>
                    </Button>
                </div>

                {/* Right — Actions */}
                <div className="flex items-center gap-1">
                    {/* Mobile search */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCommandOpen(true)}
                                className="sm:hidden text-muted-foreground hover:text-foreground p-2"
                            >
                                <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Search (⌘K)</TooltipContent>
                    </Tooltip>

                    {/* Dark mode toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-muted-foreground hover:text-foreground p-2"
                            >
                                <Sun
                                    className="w-[18px] h-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                                    strokeWidth={1.75}
                                />
                                <Moon
                                    className="absolute w-[18px] h-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                                    strokeWidth={1.75}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle theme</TooltipContent>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground p-2 relative"
                            >
                                <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 rounded-full ml-1"
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                                        U
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" strokeWidth={1.75} />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/settings")}>
                                <Settings className="w-4 h-4 mr-2" strokeWidth={1.75} />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
                                <LogOut className="w-4 h-4 mr-2" strokeWidth={1.75} />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Command palette */}
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </>
    );
}
