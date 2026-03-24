"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TOOLS } from "@/lib/tools";
import { useRouter } from "next/navigation";
import * as React from "react";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (toolName: string) => {
    const tool = TOOLS.find((t) => t.name === toolName);
    if (!tool) return;
    router.push(tool.href);
    setOpen(false);
  };

  // Group tools by category
  const toolsByCategory = TOOLS.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, typeof TOOLS>,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <Command>
            <CommandInput placeholder="Search tools... (Ctrl/⌘ + K)" />
            <CommandList className="max-h-75 overflow-y-auto">
              <CommandEmpty>No tools found.</CommandEmpty>

              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <CommandGroup
                  key={category}
                  heading={
                    category.charAt(0).toUpperCase() +
                    category.slice(1) +
                    " Tools"
                  }
                >
                  {tools.map((tool) => (
                    <CommandItem
                      key={tool.name}
                      value={tool.name}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{tool.icon}</span>
                      <div className="flex flex-col flex-1">
                        <span>{tool.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tool.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

