'use client'

import { useState, useEffect } from 'react'

type Review = {
  authorName: string
  rating: number
  text: string
  relativeTimeDescription: string
  sentiment: {
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
    keywords: string[]
  }
}

type SentimentSummary = {
  positive: number
  negative: number
  neutral: number
  overall: 'positive' | 'negative' | 'neutral'
  topKeywords: { word: string; count: number }[]
}

type Props = {
  placeId: string
  placeName?: string
}

export default function SentimentAnalysis({ placeId, placeName }: Props) {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<SentimentSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!placeId) return
    fetchReviews()
  }, [placeId])

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`http://localhost:3001/sentiment/competitors/${placeId}/reviews?limit=10`)
      const json = await res.json()

      if (!json.ok) {
        throw new Error(json.error || 'Failed to fetch reviews')
      }

      setReviews(json.data.reviews)
      setSummary(json.data.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😞'
      default:
        return '😐'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <p className="text-red-600 text-sm">⚠️ {error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-xs text-red-500 underline"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            📊 Analisis Sentimen {placeName && `- ${placeName}`}
          </h3>

          {/* Overall Sentiment */}
          <div className={`rounded-lg p-3 mb-3 border ${getSentimentColor(summary.overall)}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSentimentEmoji(summary.overall)}</span>
              <div>
                <p className="font-semibold capitalize">Sentimen {summary.overall}</p>
                <p className="text-xs opacity-80">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-green-600">{summary.positive}%</p>
              <p className="text-xs text-green-700">Positive</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-gray-600">{summary.neutral}%</p>
              <p className="text-xs text-gray-700">Neutral</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-red-600">{summary.negative}%</p>
              <p className="text-xs text-red-700">Negative</p>
            </div>
          </div>

          {/* Top Keywords */}
          {summary.topKeywords.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Kata kunci:</p>
              <div className="flex flex-wrap gap-1">
                {summary.topKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
                  >
                    {kw.word} ({kw.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">💬 Review Terbaru</h4>
        
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada review</p>
        ) : (
          reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm text-gray-800">{review.authorName}</p>
                  <p className="text-xs text-gray-400">{review.relativeTimeDescription}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">⭐</span>
                  <span className="text-sm font-medium">{review.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{review.text}</p>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${getSentimentColor(review.sentiment.sentiment)}`}
                >
                  {getSentimentEmoji(review.sentiment.sentiment)} {review.sentiment.sentiment}
                </span>

                {review.sentiment.keywords.length > 0 && (
                  <div className="flex gap-1">
                    {review.sentiment.keywords.slice(0, 3).map((kw, j) => (
                      <span
                        key={j}
                        className="text-xs text-gray-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
