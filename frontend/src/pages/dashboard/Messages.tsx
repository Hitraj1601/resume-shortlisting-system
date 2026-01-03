import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Send, 
  User,
  Briefcase,
  Clock,
  ArrowLeft
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { chatAPI } from '@/lib/api'
import { toast } from 'sonner'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    role: string
  }
  content: string
  createdAt: string
  readAt: string | null
}

interface Chat {
  _id: string
  participants: Array<{
    _id: string
    name: string
    email: string
    role: string
    company?: string
  }>
  vacancy: {
    _id: string
    title: string
    company: string
  }
  application: {
    _id: string
    status: string
  }
  messages: Message[]
  lastMessage: string
  status: string
}

const Messages = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getAll()
      if (response.success && response.data) {
        setChats(response.data as Chat[])
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChat = async (chat: Chat) => {
    try {
      const response = await chatAPI.getById(chat._id)
      if (response.success && response.data) {
        setSelectedChat(response.data as Chat)
        // Mark messages as read
        await chatAPI.markAsRead(chat._id)
      }
    } catch (error) {
      console.error('Error loading chat:', error)
      toast.error('Failed to load chat')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    try {
      const response = await chatAPI.sendMessage(selectedChat._id, newMessage.trim())
      if (response.success && response.data) {
        const messageData = response.data as { _id: string; content: string; createdAt: string; readAt: string | null }
        // Add message to selected chat
        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, {
            _id: messageData._id,
            content: messageData.content,
            createdAt: messageData.createdAt,
            readAt: messageData.readAt,
            sender: {
              _id: user?.id || '',
              name: user?.name || '',
              role: user?.role || ''
            }
          }]
        } : null)
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p._id !== user?.id)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-180px)]"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'hr' 
              ? 'Communicate with job candidates'
              : 'Chat with hiring managers about your applications'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100%-100px)]">
          {/* Chat List */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-60px)]">
              {chats.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">
                    {user?.role === 'hr'
                      ? 'Start a chat when reviewing applications'
                      : 'You\'ll receive messages when HR is interested in your application'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {chats.map(chat => {
                    const other = getOtherParticipant(chat)
                    const hasUnread = chat.messages.some(m => 
                      m.sender._id !== user?.id && !m.readAt
                    )
                    return (
                      <button
                        key={chat._id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {other?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{other?.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(chat.lastMessage)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.vacancy.title}
                            </p>
                            {hasUnread && (
                              <Badge variant="default" className="mt-1 text-xs">New</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Messages */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b py-4">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Avatar>
                      <AvatarFallback>
                        {getOtherParticipant(selectedChat)?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {getOtherParticipant(selectedChat)?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {selectedChat.vacancy.title} at {selectedChat.vacancy.company}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => {
                      const isOwn = message.sender._id === user?.id
                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                {selectedChat.status === 'active' ? (
                  <form 
                    onSubmit={handleSendMessage}
                    className="border-t p-4 flex gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isSending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="border-t p-4 text-center text-muted-foreground">
                    This conversation has been closed
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Messages
