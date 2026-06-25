import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { BUYER_SUGGESTIONS, SELLER_SUGGESTIONS } from '../../utils/messageSuggestions';
import { ChevronLeft, MessageCircle } from 'lucide-react';

interface MessageSuggestionsProps {
  onSelectSuggestion: (message: string) => void;
}

export const MessageSuggestions = ({ onSelectSuggestion }: MessageSuggestionsProps) => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const suggestions = user?.role === 'buyer' ? BUYER_SUGGESTIONS : SELLER_SUGGESTIONS;

  const handleSelectOption = (option: string) => {
    onSelectSuggestion(option);
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    const categoryData = suggestions.find((s) => s.category === selectedCategory);
    return (
      <div className="p-3 border-t border-dark-border bg-dark-card/50">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-1 hover:bg-dark-hover rounded-full transition-colors flex items-center justify-center text-muted hover:text-white"
            aria-label="Back to categories"
          >
            <ChevronLeft size={18} />
          </button>
          <span>{selectedCategory}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryData?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectOption(option)}
              className="text-xs px-3 py-1.5 rounded-full border border-dark-border bg-dark hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted hover:text-white text-left"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-dark-border bg-dark-card/50 flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => setSelectedCategory(suggestion.category)}
          className="whitespace-nowrap flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-dark-border bg-dark hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted hover:text-white"
        >
          <MessageCircle size={12} className="text-primary/70" />
          {suggestion.category}
        </button>
      ))}
    </div>
  );
};
