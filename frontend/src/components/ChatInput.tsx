import React, { useState, useRef, useEffect } from "react";
import { FormatType } from "../types/index.js";
import { KohlerButton } from "../design-system/KohlerButton.js";
import { KohlerTabs } from "../design-system/KohlerTabs.js";
import { Send, Sparkles, Trash2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedFormat: FormatType;
  onFormatChange: (format: FormatType) => void;
  onClear: () => void;
}

const FORMAT_OPTIONS: FormatType[] = ["prose", "json", "xml", "xlsx", "email"];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedFormat,
  onFormatChange,
  onClear
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input.trim());
        setInput("");
      }
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="bg-surface-muted/95 backdrop-blur-md border-t border-border-low p-4 space-y-3 z-10">
      {/* Top action row: Format Tabs & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-primary uppercase tracking-wider text-content-tertiary">
            Output Format:
          </span>
          <KohlerTabs
            formats={FORMAT_OPTIONS}
            activeFormat={selectedFormat}
            onChange={onFormatChange}
          />
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-content-tertiary hover:text-white hover:bg-surface-subtle border border-transparent hover:border-border-low transition-colors rounded-none"
          title="Clear active conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="font-primary uppercase text-[10px] tracking-wider">Reset Chat</span>
        </button>
      </div>

      {/* Textarea container */}
      <div className="relative max-w-5xl mx-auto bg-surface-subtle border border-border-low focus-within:border-brand-600 transition-all shadow-card">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any Kohler policy inquiry across HR, Finance, Customer Care, Privacy, or Legal..."
          rows={2}
          disabled={isLoading}
          className="w-full bg-transparent p-3.5 pr-28 text-sm text-white placeholder-content-tertiary focus:outline-none resize-none font-sans font-light"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <KohlerButton
            variant="brand"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            icon={isLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 text-white" />}
          >
            Submit
          </KohlerButton>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-content-tertiary font-mono max-w-5xl mx-auto px-1">
        <span>Press <kbd className="bg-surface-muted border border-border-low px-1 py-0.2 text-white">Enter</kbd> to submit • <kbd className="bg-surface-muted border border-border-low px-1 py-0.2 text-white">Shift + Enter</kbd> for newline</span>
        <span className="text-brand-500 font-semibold uppercase tracking-wider">Grounded Foundations Policy Core</span>
      </div>
    </div>
  );
};
