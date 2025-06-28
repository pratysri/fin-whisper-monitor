
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder="Search by ticker or company..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-800/80 backdrop-blur-sm border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800 transition-all"
      />
    </div>
  );
}
