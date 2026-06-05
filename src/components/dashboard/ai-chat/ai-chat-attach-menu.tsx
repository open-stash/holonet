"use client";

import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { attachMenuOptions } from "./ai-chat-config";

export function AiChatAttachMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-8 shrink-0 rounded-full border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100"
          aria-label="Attach"
        >
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {attachMenuOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="gap-2"
            onSelect={(event) => {
              if (option.hasSubmenu) event.preventDefault();
            }}
          >
            <option.icon className="size-4 text-muted-foreground" />
            <span className="flex-1">{option.label}</span>
            {option.hasSubmenu ? (
              <ChevronRight className="size-4 text-muted-foreground" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
