
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { ViewMode } from '@/pages/Index';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-gray-800/60 rounded-lg p-1 border border-gray-600">
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('cards')}
        className={`h-8 w-8 p-0 ${
          viewMode === 'cards' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className={`h-8 w-8 p-0 ${
          viewMode === 'table' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
