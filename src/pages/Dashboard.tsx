import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Search, Filter, TrendingUp, Users, MapPin, BarChart3 } from 'lucide-react'
import SentimentTimeline from '../components/SentimentTimeline'
import SentimentPieChart from '../components/SentimentPieChart'
import TweetsTable from '../components/TweetsTable'
import UgandaMap from '../components/UgandaMap'
// import AIAssistant from '../components/AIAssistant'
import { supabase } from '../lib/supabase'
import { Tweet, SentimentData, SentimentDistribution } from '../lib/supabase'

interface AgentTweetResponse {
  "Tweet by": string;
  "Text Content": string;
  "Reply Count": string;
  "Like Count": string;
  "Tweet URL": string;
  "Date": string;
  "Profile User Name": string;
  "Profile Description": string;
  "Sentiment": string;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTweets: 0,
    totalUsers: 0,
    averageSentiment: 0,
    districtsCovered: 0
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Get total tweets count
      const { count: tweetsCount } = await supabase
        .from('nrm_tweets_kb')
        .select('*', { count: 'exact', head: true })

      // Get unique users count
      const { count: usersCount } = await supabase
        .from('nrm_tweets_kb')
        .select('username', { count: 'exact', head: true })

      // Get unique districts count
      const { count: districtsCount } = await supabase
        .from('nrm_tweets_kb')
        .select('district', { count: 'exact', head: true })

      // Get average sentiment (sentiment_score is now categorical)
      const { data: sentimentData } = await supabase
        .from('nrm_tweets_kb')
        .select('sentiment_score')
        .not('sentiment_score', 'is', null)
        .not('sentiment_score', 'eq', '')

      const avgSentiment = sentimentData && sentimentData.length > 0
        ? sentimentData.reduce((sum, item) => {
            // Convert categorical sentiment to numeric values for calculations
            let score = 0
            if (item.sentiment_score === 'Positive') {
              score = 1
            } else if (item.sentiment_score === 'Negative') {
              score = -1
            } else if (item.sentiment_score === 'Neutral') {
              score = 0
            }
            return sum + score
          }, 0) / sentimentData.length
        : 0

      setStats({
        totalTweets: tweetsCount || 0,
        totalUsers: usersCount || 0,
        averageSentiment: Math.round(avgSentiment * 100) / 100,
        districtsCovered: districtsCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tweets', label: 'Tweets', icon: BarChart3 },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'custom-search', label: 'Custom Search', icon: Search }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Uganda Sentiment Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tweets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalTweets.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-xl">
                <Users className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.averageSentiment}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-xl">
                <MapPin className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Districts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.districtsCovered}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-2xl shadow-soft">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sentiment Timeline
                </h3>
                <SentimentTimeline />
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sentiment Distribution
                </h3>
                <SentimentPieChart />
              </div>
            </div>
          )}

          {activeTab === 'tweets' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tweets Analysis
              </h3>
              <TweetsTable />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Geographic Distribution
              </h3>
              <UgandaMap />
            </div>
          )}

          {activeTab === 'custom-search' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Custom Search
              </h3>
              <CustomSearchTab />
            </div>
          )}
        </div>
      </main>

      {/* AI Assistant - Fixed position overlay (now provided by @n8n/chat) */}
      {/* <AIAssistant /> */}
    </div>
  )
}

const CustomSearchTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [webhookResponse, setWebhookResponse] = useState<AgentTweetResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setWebhookResponse(null)
    try {
      const response = await fetch(`https://nrm-agent.app.n8n.cloud/webhook/myagent?message=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AgentTweetResponse[] = await response.json()
      setWebhookResponse(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          className="input-field flex-grow"
          placeholder="Enter your search query..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          onClick={handleSearch} 
          className="btn-primary flex items-center space-x-2"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </div>
      {error && <p className="text-danger-600">Error: {error}</p>}
      {webhookResponse && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {webhookResponse.map((tweet, index) => (
            <TweetCard key={index} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  )
}

interface TweetCardProps {
  tweet: AgentTweetResponse;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-success-100 text-success-800';
      case 'negative':
        return 'bg-danger-100 text-danger-800';
      case 'neutral':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card p-4 flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-primary-700">@{tweet["Profile User Name"]}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(tweet.Sentiment)}`}>
          {tweet.Sentiment}
        </span>
      </div>
      <p className="text-gray-800 text-sm flex-grow">{tweet["Text Content"]}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Likes: {tweet["Like Count"]}</span>
        <span>Replies: {tweet["Reply Count"]}</span>
        <span>Date: {new Date(tweet.Date).toLocaleDateString()}</span>
      </div>
      {tweet["Tweet URL"] && (
        <a 
          href={tweet["Tweet URL"]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline text-sm self-start"
        >
          Read more on Twitter
        </a>
      )}
    </div>
  );
};

export default Dashboard
