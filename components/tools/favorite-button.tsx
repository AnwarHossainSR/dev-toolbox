'use client';

import { addFavorite, removeFavorite } from '@/lib/tool-actions';
import { Heart } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  toolName: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ toolName, initialFavorited }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggleFavorite = () => {
    startTransition(async () => {
      if (isFavorited) {
        await removeFavorite(toolName);
      } else {
        await addFavorite(toolName);
      }
      setIsFavorited(!isFavorited);
      // Notify dashboard and favorites section to re-fetch
      window.dispatchEvent(new CustomEvent('favorites-changed'));
    });
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isPending}
      variant={isFavorited ? 'default' : 'outline'}
      size="sm"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
      {isFavorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
