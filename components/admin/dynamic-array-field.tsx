"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface DynamicArrayFieldProps {
  /** Array items */
  items: Array<Record<string, any>>;
  /** Add new item callback */
  onAdd: () => void;
  /** Remove item callback */
  onRemove: (index: number) => void;
  /** Update item callback */
  onUpdate?: (index: number, item: Record<string, any>) => void;
  /** Render function for each item */
  renderItem: (item: Record<string, any>, index: number) => React.ReactNode;
  /** Field label */
  label?: string;
  /** Help text */
  help?: string;
  /** Max items allowed */
  maxItems?: number;
  /** Add button text */
  addLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Reusable component for managing dynamic arrays of items.
 * Used for cards, stats, features, etc.
 */
export function DynamicArrayField({
  items,
  onAdd,
  onRemove,
  onUpdate,
  renderItem,
  label,
  help,
  maxItems = 6,
  addLabel = "Add Item",
  disabled = false,
}: DynamicArrayFieldProps) {
  const isAtMax = items.length >= maxItems;

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium block">
          {label}
          <span className="text-muted-foreground ml-2">
            ({items.length}/{maxItems})
          </span>
        </label>
      )}

      {/* Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No items yet. Click "{addLabel}" to add one.
          </div>
        ) : (
          items.map((item, index) => (
            <Card
              key={`${index}-${item.id || Math.random()}`}
              className="p-3 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-3">
                {/* Content */}
                <div className="flex-1">{renderItem(item, index)}</div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Button */}
      <Button
        variant="outline"
        onClick={onAdd}
        disabled={disabled || isAtMax}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
        {isAtMax && (
          <span className="ml-auto text-xs text-muted-foreground">
            (Max reached)
          </span>
        )}
      </Button>

      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
