import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

const LOBSTER_TAG_COLORS = [
  {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-700/50",
    hover: "hover:text-cyan-900 dark:hover:text-cyan-100"
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/50",
    hover: "hover:text-amber-900 dark:hover:text-amber-100"
  },
  {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-700/50",
    hover: "hover:text-red-900 dark:hover:text-red-100"
  }
];

export function getTagColor(tag: string) {
  const hash = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return LOBSTER_TAG_COLORS[hash % LOBSTER_TAG_COLORS.length];
}

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div>
      <Label className="text-slate-700 dark:text-white">Tags</Label>
      <div className="flex gap-2 mt-1">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="pl-10 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddTag}
          className="px-3 dark:border-slate-600"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-1 ${color.bg} ${color.text} rounded-full text-sm border ${color.border}`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={color.hover}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
