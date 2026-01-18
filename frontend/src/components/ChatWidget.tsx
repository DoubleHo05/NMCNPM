import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { apiRequest } from '../services/api';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Alert {
    type: string;
    icon: string;
    message: string;
    details: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1,
                role: 'assistant',
                content: '👋 Xin chào! Tôi là trợ lý AI của nhà sách.\n\nBạn có thể hỏi tôi về:\n• 📦 Tra cứu kho sách\n• 📈 Xu hướng bán chạy\n• 💡 Tư vấn nhập hàng\n• ⚠️ Thông báo quan trọng',
                timestamp: new Date()
            }]);
            loadAlerts();
        }
    }, [isOpen]);

    // Scroll to bottom when new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadAlerts = async () => {
        try {
            const response = await apiRequest<{ success: boolean; data: Alert[] }>('/chat/alerts');
            if (response.success) {
                setAlerts(response.data);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await apiRequest<{ message: string }>('/chat/message', {
                method: 'POST',
                body: JSON.stringify({ message: input })
            });

            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.message || 'Xin lỗi, tôi không hiểu câu hỏi.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { label: 'Sách bán chạy', icon: TrendingUp, query: 'Sách nào bán chạy nhất?' },
        { label: 'Cần nhập hàng', icon: Package, query: 'Nên nhập sách nào để tăng doanh thu?' },
        { label: 'Thông báo', icon: AlertTriangle, query: 'Có thông báo quan trọng gì không?' },
    ];

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                    {alerts.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                            {alerts.length}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Trợ lý AI</h3>
                                <p className="text-white/70 text-xs">Hỗ trợ quản lý nhà sách</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md">
                                    <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2 flex gap-2 flex-wrap">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(action.query);
                                        setTimeout(() => sendMessage(), 100);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-xs hover:bg-violet-100 dark:hover:bg-violet-900/50 transition"
                                >
                                    <action.icon className="w-3 h-3" />
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Nhập câu hỏi..."
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-full flex items-center justify-center transition"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
