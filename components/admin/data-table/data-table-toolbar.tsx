/**
 * Data Table Toolbar Component
 *
 * Top toolbar with search, column visibility, and actions
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FilterIcon, Remove01Icon, Search01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterCount?: number;
  onClearFilters?: () => void;
  children?: React.ReactNode;
  table?: any;
}

export function DataTableToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <Skeleton className="h-10 w-[250px]" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Filter...",
  filterCount = 0,
  onClearFilters,
  children,
  table,
}: DataTableToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = () => {
    onSearchChange?.("");
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  // Expose focus function globally for keyboard shortcuts
  if (typeof window !== "undefined" && handleFocusSearch) {
    (window as any).__focusTableSearch = handleFocusSearch;
  }

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClearSearch}
            >
              <HugeiconsIcon icon={Remove01Icon} className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Badge */}
        {filterCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1" onClick={onClearFilters}>
            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
            {filterCount} filter{filterCount > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {children}

        {/* Column Visibility */}
        {table && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/**
 * Command Palette for Quick Filters
 * Activated with Cmd+K
 */
export function DataTableCommandPalette({
  commands,
  onSelect,
  open,
  onOpenChange,
}: {
  commands: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    keywords?: string[];
  }>;
  onSelect: (commandId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className={cn("z-50", open && "fixed inset-0 bg-black/20")}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  onSelect(command.id);
                  onOpenChange(false);
                }}
                keywords={command.keywords}
              >
                {command.icon && <command.icon className="mr-2 h-4 w-4" />}
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
