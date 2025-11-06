import { useState } from 'react';
import { Sparkles, Calendar, Trash2, ChevronDown, ChevronUp, FileText, Hash } from 'lucide-react';
import type { ContentHistory as ContentHistoryType } from '../types';

interface GeneratedPostsLibraryProps {
  history: ContentHistoryType[];
  onSchedulePost: (content: ContentHistoryType) => void;
  onDeleteContent: (id: string) => void;
}

export function GeneratedPostsLibrary({ history, onSchedulePost, onDeleteContent }: GeneratedPostsLibraryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const togglePostExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Generated Posts Yet</h3>
        <p className="text-gray-600 text-sm">
          Generate content from the main page to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800">Generated Posts</h2>
            <p className="text-sm text-gray-500">{history.length} unscheduled post{history.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {history.map((item) => {
            const isPostExpanded = expandedPosts.has(item.id);

            return (
              <div
                key={item.id}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all hover:shadow-md"
              >
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Generated on {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => togglePostExpanded(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200"
                    >
                      {isPostExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          View
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSchedulePost(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Post
                    </button>
                    <button
                      onClick={() => onDeleteContent(item.id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete this post"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {isPostExpanded && (
                  <div className="p-4 bg-white border-t-2 border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Available Captions
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                              Professional
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {item.formal_caption}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                              Casual
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {item.casual_caption}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                              Fun & Playful
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {item.funny_caption}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.hashtags && item.hashtags.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Hashtags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.hashtags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.image_url && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Image
                        </h4>
                        <img
                          src={item.image_url}
                          alt="Post"
                          className="w-full max-w-sm rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
