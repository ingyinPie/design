import { useState } from 'react';
import { ThumbsUp, X, Calendar as CalendarIcon, Clock, Sparkles, CheckCircle } from 'lucide-react';

interface PlannedPost {
  id: string;
  title: string;
  suggested_date: string;
  suggested_time: string;
  rationale: string;
  platforms: string[];
  caption: string;
  hashtags: string[];
}

interface ContentPlanApprovalProps {
  planName: string;
  startDate: string;
  endDate: string;
  frequency: string;
  posts: PlannedPost[];
  onApproveAll: () => void;
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
}

export function ContentPlanApproval({
  planName,
  startDate,
  endDate,
  frequency,
  posts,
  onApproveAll,
  onApprovePost,
  onRejectPost
}: ContentPlanApprovalProps) {
  const [rejectedPosts, setRejectedPosts] = useState<Set<string>>(new Set());
  const [approvedPosts, setApprovedPosts] = useState<Set<string>>(new Set());

  const handleReject = (postId: string) => {
    setRejectedPosts(prev => new Set(prev).add(postId));
    onRejectPost(postId);
  };

  const handleApprove = (postId: string) => {
    setApprovedPosts(prev => new Set(prev).add(postId));
    onApprovePost(postId);
  };

  const visiblePosts = posts.filter(post => !rejectedPosts.has(post.id));
  const allApproved = visiblePosts.length > 0 && visiblePosts.every(post => approvedPosts.has(post.id));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{planName}</h3>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {posts.length} posts • {frequency}
              </span>
            </div>
          </div>
          {allApproved && (
            <button
              onClick={onApproveAll}
              className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Approve All & Continue
            </button>
          )}
        </div>
        <p className="text-white/80 text-sm">
          Review each post suggestion below. Approve the ones you like or reject to remove them from the plan.
        </p>
      </div>

      {visiblePosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">All posts have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visiblePosts.map((post, index) => {
            const isApproved = approvedPosts.has(post.id);
            const dateObj = new Date(post.suggested_date);

            return (
              <div
                key={post.id}
                className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
                  isApproved ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-b-2 border-gray-100">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.suggested_time}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.platforms.map(platform => (
                          <span key={platform} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium capitalize">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {post.rationale && (
                    <div className="bg-blue-50/80 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold text-blue-600">AI Insight:</span> {post.rationale}
                      </p>
                    </div>
                  )}
                </div>

                {(post.caption || post.hashtags?.length > 0) && (
                  <div className="p-6 space-y-3 bg-gray-50">
                    {post.caption && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Suggested Caption</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{post.caption}</p>
                      </div>
                    )}

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Hashtags</p>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 5).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-white border-t-2 border-gray-100 flex gap-2">
                  {!isApproved ? (
                    <>
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(post.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      Approved
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!allApproved && approvedPosts.size > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-800 text-sm">
            You've approved {approvedPosts.size} of {visiblePosts.length} posts.
            Approve the remaining posts to continue.
          </p>
        </div>
      )}
    </div>
  );
}
