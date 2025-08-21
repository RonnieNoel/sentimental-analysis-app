import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, MapPin, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Tweet } from '../lib/supabase'
import { format } from 'date-fns'

const TweetsTable: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [districts, setDistricts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchDistricts()
    fetchTweets()
  }, [searchTerm, selectedDistrict, currentPage])

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('nrm_tweets_kb')
        .select('district')
        .not('district', 'is', null)
        .not('district', 'eq', '')

      if (!error && data) {
        const uniqueDistricts = [...new Set(data.map(item => item.district))].sort()
        setDistricts(uniqueDistricts)
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
    }
  }

  const fetchTweets = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('nrm_tweets_kb')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`text.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
      }

      // Apply district filter
      if (selectedDistrict) {
        query = query.eq('district', selectedDistrict)
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching tweets:', error)
        return
      }

      setTweets(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error processing tweets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'text-gray-500'
    if (sentiment === 'Positive') return 'text-success-600'
    if (sentiment === 'Negative') return 'text-danger-600'
    if (sentiment === 'Neutral') return 'text-warning-600'
    return 'text-gray-500'
  }

  const getSentimentLabel = (sentiment?: string) => {
    if (!sentiment) return 'N/A'
    return sentiment
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDistrict('')
    setCurrentPage(1)
  }

  if (loading && tweets.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tweets or usernames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {tweets.length} tweets
          {searchTerm && ` for "${searchTerm}"`}
          {selectedDistrict && ` in ${selectedDistrict}`}
        </span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Tweet</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">District</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Sentiment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Engagement</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {tweets.map((tweet) => (
              <tr key={tweet.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {tweet.text}
                    </p>
                    {tweet.url && (
                      <a
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 mt-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Tweet
                      </a>
                    )}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {tweet.username}
                    </span>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  {tweet.district ? (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{tweet.district}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unknown</span>
                  )}
                </td>
                
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${getSentimentColor(tweet.sentiment_score || undefined)}`}>
                    {getSentimentLabel(tweet.sentiment_score || undefined)}
                  </span>
                </td>
                
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center space-x-4">
                      <span>❤️ {tweet.like_count}</span>
                      <span>🔄 {tweet.retweet_count}</span>
                      <span>💬 {tweet.reply_count}</span>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {format(new Date(tweet.created_at), 'MMM dd, yyyy')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {tweets.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No tweets found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default TweetsTable
