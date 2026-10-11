import React, { useState } from 'react';
import { Star, MessageSquarePlus, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Review } from '../types/index.ts';

interface ReviewsPageProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  onReviewSubmitted: (newReview: Review) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  reviews,
  averageRating,
  reviewCount,
  onReviewSubmitted,
}) => {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reviewerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage('Please write at least a few words about your meal.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          rating,
          comment,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setSubmitSuccess(true);
      setReviewerName('');
      setComment('');
      setRating(5);
      onReviewSubmitted(data.review);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
          Customer Reviews & Experiences
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Read genuine feedback from Best Food Cottage diners in Sialkot, or share your own thoughts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Overall Rating & Approved Reviews List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rating Summary Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="font-heading font-black text-5xl text-stone-950 tabular-nums">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 justify-center sm:justify-start mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-500 mt-1 block">
                Based on {reviewCount} verified approved {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="h-16 w-px bg-stone-200 hidden sm:block" />

            <div className="flex-1 text-xs text-stone-600 space-y-1 text-center sm:text-left">
              <span className="font-bold text-stone-800 block">Authentic Feedback Policy</span>
              <p className="text-stone-500 leading-relaxed">
                All submitted reviews undergo verification before public display to keep ratings genuine and transparent for the Sialkot community.
              </p>
            </div>
          </div>

          {/* Approved Reviews List */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-stone-900">
              Approved Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-2">
                <p className="font-heading font-bold text-stone-800 text-base">
                  Be the first to review Best Food Cottage!
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Ordered from us recently? Let fellow pizza and zinger lovers know about your experience.
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-heading font-bold text-stone-900 text-sm">
                      {rev.reviewer_name}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="text-[11px] text-stone-400 pt-1">
                    {new Date(rev.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Write a Review Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <MessageSquarePlus className="w-5 h-5 text-red-800" />
            <div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Write a Review
              </h3>
              <p className="text-xs text-stone-500">Share your experience with our kitchen</p>
            </div>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Review Submitted!</span>
              </div>
              <p className="text-emerald-800">
                Thank you! Your feedback will appear publicly once approved by Best Food Cottage management.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Bilal Sialkot"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Star Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-stone-300 hover:text-amber-400 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-700 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste, packaging, and delivery time?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Reviews are held for moderation before public display.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
