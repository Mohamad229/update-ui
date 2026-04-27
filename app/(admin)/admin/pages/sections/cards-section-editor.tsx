"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";

import { DynamicArrayField } from "@/components/admin/dynamic-array-field";
import { MediaField } from "@/components/admin/media-field";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

import type { MediaWithUser } from "@/lib/actions/media";

interface Card {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: MediaWithUser | null;
}

interface CardsSectionData {
  title: string;
  description?: string;
  cardsPerRow: number;
  cards: Card[];
}

interface CardsSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: CardsSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Cards Section Editor
 * Handles editing of card grid sections with multiple cards.
 */
export function CardsSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: CardsSectionEditorProps) {
  // Validate section type
  if (section.type !== "CARDS") {
    return null;
  }

  const initialData = section.data as CardsSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [cardsPerRow, setCardsPerRow] = useState<number>(
    initialData?.cardsPerRow || 3,
  );
  const [cards, setCards] = useState<Card[]>(initialData?.cards || []);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (cards.length === 0) errs.cards = "At least one card is required";
    return errs;
  }, [title, cards]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      cardsPerRow,
      cards,
    });
  };

  // Card management
  const addCard = () => {
    if (cards.length < 6) {
      setCards([
        ...cards,
        {
          id: uuidv4(),
          title: "",
          description: "",
          icon: undefined,
          image: null,
        },
      ]);
    }
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, updates: Partial<Card>) => {
    setCards(
      cards.map((card, i) => (i === index ? { ...card, ...updates } : card)),
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="cards-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="cards-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Our Strengths"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <TiptapEditor
          value={description}
          onChange={setDescription}
          label="Description"
          help="Optional section description"
          placeholder="What sets us apart"
          maxHeight="250px"
          mediaPickerEnabled={false}
          disabled={isLoading}
        />
      </div>

      {/* Cards Per Row */}
      <div>
        <Label htmlFor="cards-per-row" className="text-sm font-medium">
          Cards Per Row
        </Label>
        <Select
          id="cards-per-row"
          value={cardsPerRow.toString()}
          onChange={(e) => setCardsPerRow(parseInt(e.target.value))}
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="2">2 Cards</SelectOption>
          <SelectOption value="3">3 Cards</SelectOption>
          <SelectOption value="4">4 Cards</SelectOption>
        </Select>
      </div>

      {/* Cards */}
      <DynamicArrayField
        items={cards}
        onAdd={addCard}
        onRemove={removeCard}
        renderItem={(item: Record<string, any>, index: number) => (
          <div className="space-y-3">
            <Input
              value={item.title}
              onChange={(e) => updateCard(index, { title: e.target.value })}
              placeholder="Card Title"
              disabled={isLoading}
            />
            <div>
              <TiptapEditor
                value={item.description}
                onChange={(html) => updateCard(index, { description: html })}
                placeholder="Card Description"
                maxHeight="180px"
                mediaPickerEnabled={false}
                disabled={isLoading}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <MediaField
                value={item.image || null}
                onChange={(media) => updateCard(index, { image: media })}
                label="Card Image (Optional)"
                disabled={isLoading}
                aspectRatio={1}
              />
            </div>
          </div>
        )}
        label="Cards"
        help="Add up to 6 cards to display"
        maxItems={6}
        addLabel="Add Card"
        disabled={isLoading}
      />
      {errors.cards && (
        <p className="text-xs text-red-500 mt-1">{errors.cards}</p>
      )}

      {/* Preview */}
      {cards.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Preview
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">{title || "Section Title"}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div
              className="grid gap-3 mt-4"
              style={{ gridTemplateColumns: `repeat(${cardsPerRow}, 1fr)` }}
            >
              {cards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className="p-3 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow"
                >
                  {card.image && (
                    <div className="mb-2 relative h-24 rounded overflow-hidden">
                      {/* eslint-disable-next-line */}
                      <img
                        src={card.image.url}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
            {cards.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                + {cards.length - 3} more cards
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

export default CardsSectionEditor;
