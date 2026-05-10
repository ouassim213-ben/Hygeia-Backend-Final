import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, X, Bot } from 'lucide-react';

// 1. تعريف الـ API برا الـ Component باش ما يصرى تكرار
const API_KEY = "AIzaSyAICUWe5hBQfPf7NwpgAITAOwGaMWVAD30"; 
const genAI = new GoogleGenerativeAI(API_KEY);

const HygeiaChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: "model", parts: [{ text: "How can I assist your health journey?" }] }
    ]);
    
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    // دالة الإرسال المعدلة
    const handleSendMessage = async (e) => {
        // منع أي سلوك تلقائي للمتصفح
        if (e) e.preventDefault();
        
        const messageText = input.trim();
        if (!messageText) return;

        console.log("Starting to send..."); // جرب شوف الـ Console إذا تخرج هادي

        // الخطوة 1: طلع الميساج في الشاشة فوراً (مستقل عن الـ API)
        const userMsg = { role: 'user', parts: [{ text: messageText }] };
        setChatHistory(prev => [...prev, userMsg]);
        setInput(""); // فرغ الخانة فوراً
        setIsTyping(true);

        // الخطوة 2: حاول تجيب الرد من Gemini
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(messageText);
            const response = await result.response;
            const text = response.text();

            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: text }] }]);
        } catch (error) {
            console.error("AI Error:", error);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Connection error. Please check your API key." }] }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans text-black">
            {!isOpen ? (
                <button onClick={() => setIsOpen(true)} className="bg-[#194459] p-4 rounded-full shadow-2xl text-white">
                    <Bot size={28} />
                </button>
            ) : (
                <div className="bg-white w-[350px] h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    <div className="bg-[#194459] p-4 text-white flex justify-between items-center">
                        <span className="font-bold flex items-center gap-2"><Bot size={20}/> Hygeia AI</span>
                        <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[80%] text-[13px] ${
                                    msg.role === 'user' ? 'bg-[#194459] text-white' : 'bg-white border text-gray-800'
                                }`}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-xs text-gray-400 animate-pulse">Thinking...</div>}
                        <div ref={scrollRef} />
                    </div>

                    {/* الفورم هو الحل الأمثل لضمان الإرسال */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
                        <input 
                            type="text"
                            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 outline-none text-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button 
                            type="submit"
                            className="bg-[#10B981] text-white p-2 rounded-xl"
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default HygeiaChatbot;