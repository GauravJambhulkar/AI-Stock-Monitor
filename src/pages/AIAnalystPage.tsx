import { useState } from 'react'
import { Bot, Copy, Loader2, Send, Trash2, User } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { SUGGESTED_PROMPTS } from '@/data/mockAiPrompts'
import { aiAnalystService } from '@/services/aiAnalystService'
import { stockService } from '@/services/stockService'
import type { ChatMessage } from '@/types/alerts'

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random()}`, role, content, timestamp: new Date().toISOString() }
}

export function AIAnalystPage() {
  const { showToast } = useToast()
  const [symbol, setSymbol] = useState('RELIANCE')
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      'assistant',
      'Hi, I am the StockPulse AI mock analyst. Ask me about technical signals for a stock, or try one of the suggested prompts below. My responses are generated from predefined templates using simulated data, not a live LLM.',
    ),
  ])

  const sendPrompt = (prompt: string) => {
    if (!prompt.trim()) return
    const userMessage = createMessage('user', prompt)
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)
    setTimeout(() => {
      const response = aiAnalystService.ask(prompt, symbol)
      setMessages((prev) => [...prev, createMessage('assistant', response)])
      setIsThinking(false)
    }, 700)
  }

  const handleCopy = (content: string) => {
    navigator.clipboard?.writeText(content)
    showToast('Response copied to clipboard', 'info')
  }

  const handleClear = () => {
    setMessages([])
    showToast('Conversation cleared', 'info')
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-100">AI Stock Analyst</p>
            <p className="text-xs text-gray-500">Informational mock assistant &middot; not financial advice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            aria-label="Select stock for analysis"
            className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-2 text-sm text-gray-200 focus:border-accent focus:outline-none"
          >
            {stockService.listStocks().map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs text-gray-400 hover:bg-surface-2 hover:text-gray-100"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-warn/40 bg-warn-soft px-4 py-2 text-xs text-amber-300">
        AI explanations are informational and are not financial advice.
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Bot size={14} />
                </span>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm ${
                  message.role === 'user' ? 'bg-accent text-white' : 'bg-surface-2 text-gray-200'
                }`}
              >
                <p>{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(message.content)}
                    className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-200"
                  >
                    <Copy size={12} /> Copy
                  </button>
                )}
              </div>
              {message.role === 'user' && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-gray-300">
                  <User size={14} />
                </span>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" /> Generating simulated response...
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendPrompt(prompt)}
            className="rounded-full border border-border-subtle bg-surface-2 px-3 py-1.5 text-xs text-gray-300 hover:border-accent/50 hover:text-gray-100"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendPrompt(input)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a stock's technical signals..."
          aria-label="Chat message"
          className="flex-1 rounded-lg border border-border-subtle bg-surface-2 px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Send size={15} /> Send
        </button>
      </form>
    </div>
  )
}
