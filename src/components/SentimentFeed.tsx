
import { SentimentPost, ViewMode } from '@/pages/Index';
import { PostCard } from '@/components/PostCard';
import { PostTable } from '@/components/PostTable';

interface SentimentFeedProps {
  posts: SentimentPost[];
  viewMode: ViewMode;
}

export function SentimentFeed({ posts, viewMode }: SentimentFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No posts match your current filters</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <PostTable posts={posts} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
