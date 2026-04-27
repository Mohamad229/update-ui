"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DynamicArrayField } from "@/components/admin/dynamic-array-field";

interface Stat {
  id: string;
  number: string;
  label: string;
  unit?: string;
}

interface StatsSectionData {
  title: string;
  stats: Stat[];
}

interface StatsSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: StatsSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Stats Section Editor
 * Handles editing of statistics section with numeric values and labels.
 */
export function StatsSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: StatsSectionEditorProps) {
  // Validate section type
  if (section.type !== "STATS") {
    return null;
  }

  const initialData = section.data as StatsSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [stats, setStats] = useState<Stat[]>(initialData?.stats || []);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (stats.length === 0) errs.stats = "At least one statistic is required";
    return errs;
  }, [title, stats]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      stats,
    });
  };

  // Stat management
  const addStat = () => {
    if (stats.length < 6) {
      setStats([
        ...stats,
        {
          id: uuidv4(),
          number: "",
          label: "",
          unit: "",
        },
      ]);
    }
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, updates: Partial<Stat>) => {
    setStats(
      stats.map((stat, i) => (i === index ? { ...stat, ...updates } : stat)),
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="stats-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="stats-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="By The Numbers"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Stats */}
      <DynamicArrayField
        items={stats}
        onAdd={addStat}
        onRemove={removeStat}
        renderItem={(item: Record<string, any>, index: number) => (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Number</Label>
              <Input
                value={item.number}
                onChange={(e) => updateStat(index, { number: e.target.value })}
                placeholder="50+"
                disabled={isLoading}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={item.label}
                onChange={(e) => updateStat(index, { label: e.target.value })}
                placeholder="Countries"
                disabled={isLoading}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <Input
                value={item.unit || ""}
                onChange={(e) => updateStat(index, { unit: e.target.value })}
                placeholder="%"
                disabled={isLoading}
                className="mt-1 text-sm"
              />
            </div>
          </div>
        )}
        label="Statistics"
        help="Add up to 6 statistics"
        maxItems={6}
        addLabel="Add Statistic"
        disabled={isLoading}
      />
      {errors.stats && (
        <p className="text-xs text-red-500 mt-1">{errors.stats}</p>
      )}

      {/* Preview */}
      {stats.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Preview
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">{title || "Section Title"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {stats.slice(0, 3).map((stat) => (
                <div
                  key={stat.id}
                  className="p-3 rounded-lg border border-border bg-card text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-2xl font-bold text-primary">
                    {stat.number}
                    {stat.unit && (
                      <span className="text-base">{stat.unit}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            {stats.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                + {stats.length - 3} more statistics
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-border mt-6">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isLoading || Object.keys(errors).length > 0}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default StatsSectionEditor;
