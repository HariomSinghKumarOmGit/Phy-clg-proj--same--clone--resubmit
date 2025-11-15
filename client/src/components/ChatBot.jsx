import { useState } from 'react'
import { useChemAI } from '../hooks/useChemAI'
import '../styles/ChatBot.css'

export default function ChatBot({ experimentContext }) {
  const [input, setInput] = useState('')
  const [chat, setChat] = useState([])
  const { loading, askChemAI } = useChemAI()

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = { from: 'user', text: input }
    setChat(prev => [...prev, userMsg])
    const query = input
    setInput('')

    const result = await askChemAI(query, 'explain', experimentContext)
    
    if (result && result.answer) {
      setChat(prev => [...prev, { 
        from: 'ai', 
        text: result.answer 
      }])
    } else {
      setChat(prev => [...prev, {
        from: 'ai',
        text: '⚠️ Error fetching response. Please try again.'
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chatbot">
      <h4 className="chatbot-title">💬 Chat with ChemAI</h4>
      <div className="chatbot-messages">
        {chat.length === 0 && (
          <div className="chatbot-empty">
            Ask me anything about this experiment!
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`chat-message ${m.from}`}>
            <span className="chat-role">{m.from === 'user' ? 'You' : 'ChemAI'}</span>
            <span className="chat-text">{m.text}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-message ai">
            <span className="chat-role">ChemAI</span>
            <span className="chat-text typing">Thinking...</span>
          </div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask ChemAI..."
          disabled={loading}
          className="chat-input-field"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="chat-send-button"
        >
          Send
        </button>
      </div>
    </div>
  )
}


