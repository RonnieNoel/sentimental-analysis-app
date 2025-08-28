import React, { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, ExternalLink, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Tweet } from '../lib/supabase'
import { format } from 'date-fns'

const TweetsTable: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'username' | 'date' | 'likes' | 'retweets'>('all')
=======
  const [tweetQuery, setTweetQuery] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchTweets()
<<<<<<< HEAD
  }, [searchTerm, filterType, currentPage])
=======
  }, [tweetQuery, userQuery, sentimentFilter, dateFrom, dateTo, currentPage])

  // Removed district fetching
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)

  const fetchTweets = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('nrm_tweets_kb')
        .select('*', { count: 'exact' })

<<<<<<< HEAD
      // Apply search based on selected filter type
      const term = searchTerm.trim()
      if (term) {
        if (filterType === 'all') {
          query = query.or(`text.ilike.%${term}%,username.ilike.%${term}%`)
        } else if (filterType === 'username') {
          query = query.ilike('username', `%${term}%`)
        } else if (filterType === 'date') {
          // Supported formats: 'YYYY-MM-DD', 'YYYY-MM-DD to YYYY-MM-DD', 'YYYY-MM-DD..YYYY-MM-DD'
          const toParts = term.includes(' to ') ? term.split(' to ') : term.split('..')
          if (toParts.length === 2) {
            const start = new Date(toParts[0])
            const end = new Date(toParts[1])
            if (!isNaN(start.getTime())) {
              query = query.gte('created_at', start.toISOString())
            }
            if (!isNaN(end.getTime())) {
              // include full end day
              end.setDate(end.getDate() + 1)
              query = query.lt('created_at', end.toISOString())
            }
          } else {
            const date = new Date(term)
            if (!isNaN(date.getTime())) {
              const next = new Date(date)
              next.setDate(next.getDate() + 1)
              query = query.gte('created_at', date.toISOString())
              query = query.lt('created_at', next.toISOString())
            }
          }
        } else if (filterType === 'likes' || filterType === 'retweets') {
          const column = filterType === 'likes' ? 'like_count' : 'retweet_count'
          const numRange = term.replace(/\s+/g, '')
          // Supported: 'min-max', '>=n', '<=n', '>n', '<n', '=n', 'n'
          let matched = false
          const rangeMatch = numRange.match(/^(\d+)[-](\d+)$/)
          if (rangeMatch) {
            const min = parseInt(rangeMatch[1], 10)
            const max = parseInt(rangeMatch[2], 10)
            if (!isNaN(min)) query = query.gte(column, min)
            if (!isNaN(max)) query = query.lte(column, max)
            matched = true
          }
          if (!matched) {
            const opMatch = numRange.match(/^(>=|<=|>|<|=)?(\d+)$/)
            if (opMatch) {
              const op = opMatch[1] || '='
              const val = parseInt(opMatch[2], 10)
              if (!isNaN(val)) {
                if (op === '>=') query = query.gte(column, val)
                else if (op === '<=') query = query.lte(column, val)
                else if (op === '>') query = query.gt(column, val)
                else if (op === '<') query = query.lt(column, val)
                else query = query.eq(column, val)
              }
            }
          }
        }
=======
      // Apply tweet text filter
      if (tweetQuery) {
        query = query.ilike('text', `%${tweetQuery}%`)
      }

      // Apply user filter
      if (userQuery) {
        query = query.ilike('username', `%${userQuery}%`)
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
      }

      // Apply sentiment filter
      if (sentimentFilter) {
        query = query.eq('sentiment_score', sentimentFilter)
      }

      // Apply date range filter
      if (dateFrom) {
        const fromIso = new Date(dateFrom).toISOString()
        query = query.gte('created_at', fromIso)
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        // set to end of day for inclusive filter
        toDate.setHours(23, 59, 59, 999)
        query = query.lte('created_at', toDate.toISOString())
      }

      // District filter removed

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

<<<<<<< HEAD
  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
=======
  // District selection removed

  const clearFilters = () => {
    setTweetQuery('')
    setUserQuery('')
    setSentimentFilter('')
    setDateFrom('')
    setDateTo('')
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
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
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
<<<<<<< HEAD
              placeholder={
                filterType === 'all' ? 'Search tweets or usernames...'
                : filterType === 'username' ? 'Search by username...'
                : filterType === 'date' ? 'Date (YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD)'
                : filterType === 'likes' ? 'Likes (e.g., 10-100, >=50)'
                : 'Retweets (e.g., 10-100, >=50)'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
=======
              placeholder="Filter by tweet text..."
              value={tweetQuery}
              onChange={(e) => setTweetQuery(e.target.value)}
              className="input-field pl-10 w-full"
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
            />
          </div>

          <div className="min-w-0">
            <input
              type="text"
              placeholder="Filter by user..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div className="min-w-0">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 min-w-0">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field w-full"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1) }}
            className="input-field min-w-[160px]"
          >
            <option value="all">All</option>
            <option value="username">Username</option>
            <option value="date">Date</option>
            <option value="likes">Likes</option>
            <option value="retweets">Retweets</option>
          </select>

          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear
          </button>
=======
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Apply</button>
          <button type="button" onClick={clearFilters} className="btn-secondary">Clear</button>
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
        </div>
      </form>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {tweets.length} tweets
<<<<<<< HEAD
          {searchTerm && ` for "${searchTerm}"`}
=======
          {tweetQuery && ` for tweet "${tweetQuery}"`}
          {userQuery && ` by user "${userQuery}"`}
          {sentimentFilter && ` with sentiment ${sentimentFilter}`}
          {(dateFrom || dateTo) && ` between ${dateFrom || '...'} and ${dateTo || '...'}`}
>>>>>>> a1974be (removed the districts from the twitter tab and updated filter)
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
