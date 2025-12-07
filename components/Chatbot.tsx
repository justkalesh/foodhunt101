
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { generateBotResponse } from '../services/geminiService';
import { api } from '../services/mockDatabase';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Hey! Hungry? Ask me about cheap food, healthy options, or where to find pizza!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    // Get context for the bot
    const vendorsRes = await api.vendors.getAll();
    const context = JSON.stringify(vendorsRes.data?.map(v => ({ name: v.name, cuisine: v.cuisine, location: v.location, price: v.avg_price_per_meal })));

    const reply = await generateBotResponse(userMsg, context);

    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 h-[500px]">
          <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18} /> FoodieBot</h3>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 italic">Thinking...</div>}
          </div>

          <div className="p-3 border-t dark:border-gray-700 flex gap-2">
            <input
              className="flex-1 border dark:border-gray-600 dark:bg-dark-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ask about food..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="text-primary-600 hover:text-primary-700 p-2">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;