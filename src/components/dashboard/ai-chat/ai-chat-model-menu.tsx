"use client";

import { Check, ChevronDown, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getModelLabel, modelOptions, type ModelId } from "./ai-chat-config";

interface AiChatModelMenuProps {
  modelId: ModelId;
  onModelChange: (id: ModelId) => void;
}

export function AiChatModelMenu({ modelId, onModelChange }: AiChatModelMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 max-w-[160px] gap-1.5 truncate rounded-full border-slate-200 bg-slate-50 px-3 text-xs font-medium text-foreground hover:bg-slate-100"
        >
          <span className="truncate">{getModelLabel(modelId)}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {modelOptions.map((option) => {
          const isActive = option.id === modelId;

          return (
            <DropdownMenuItem
              key={option.id}
              disabled={option.locked}
              className={cn("gap-2", option.locked && "opacity-60")}
              onSelect={(event) => {
                if (option.locked) {
                  event.preventDefault();
                  return;
                }
                onModelChange(option.id);
              }}
            >
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{option.label}</span>
              {option.badge ? (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  {option.badge}
                </Badge>
              ) : null}
              {option.locked ? (
                <Lock className="size-3.5 text-muted-foreground" />
              ) : isActive ? (
                <Check className="size-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
