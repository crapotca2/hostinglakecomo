"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Theme toggle removed — light mode only

export function Header() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-40 h-14 glass border-b border-border/40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5 bg-background/80 rounded-xl px-3.5 py-2 border border-border/60 w-80 hover:border-border transition-colors">
          <Search className="h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cerca proprieta, prenotazione..."
            className="text-sm bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="relative h-9 w-9 rounded-xl flex items-center justify-center hover:bg-background/80 transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifiche</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/60 mx-1" />

          <button className="flex items-center gap-2.5 hover:bg-background/80 rounded-xl px-2 py-1.5 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-[#1B3A6B] to-[#3470C7] text-white text-xs font-semibold">
                AC
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium">Andrei C.</div>
              <div className="text-[10px] text-muted-foreground leading-none">Admin</div>
            </div>
          </button>
        </div>
      </header>
    </TooltipProvider>
  );
}
