import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../../api/ai.api';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import ChatMessage from './ChatMessage';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi, I'm the PharmaCare Medical Assistant. Ask me about general health questions, medicines, first aid, or wellness tips. I can't diagnose conditions or replace a doctor — for emergencies, please call your local emergency number right away.",
};

/*
 * Renders on every page (mounted once in App.jsx, outside the route tree)
 * so guests and logged in users on any dashboard get the same assistant.
 * Conversation state lives in memory only, refreshing clears it, which
 * is an intentional, simple privacy default for a health adjacent chat.
 */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);
  const scrollRef = useRef(null);

  const { isSupported: sttSupported, isListening, transcript, startListening, stopListening } =
    useSpeechRecognition();
  const { isSupported: ttsSupported, isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  const mutation = useMutation({
    mutationFn: ({ message, history }) => aiApi.chat(message, history).then((r) => r.data.data),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.configured === false) setNotConfigured(true);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't process that. Please try again in a moment." },
      ]);
    },
  });

  // Feed live speech to text into the input box as the user talks
  useEffect(() => {
    if (isListening) setInput(transcript);
  }, [transcript, isListening]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, mutation.isPending]);

  const handleSend = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    mutation.mutate({ message: trimmed, history });
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) handleSend(transcript);
    } else {
      stopSpeaking();
      startListening();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white shadow-lg transition hover:bg-brand-600 hover:scale-105"
        aria-label="Open AI Medical Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-500 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">PharmaCare AI Assistant</p>
              <p className="text-[11px] opacity-90">General health info • Not a substitute for a doctor</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-lg opacity-90 hover:opacity-100">✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                content={m.content}
                onSpeak={speak}
                isSpeaking={isSpeaking}
                ttsSupported={ttsSupported}
              />
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2.5 text-sm text-ink-500 dark:bg-slate-800">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {notConfigured && (
            <p className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
              AI assistant needs a GEMINI_API_KEY configured on the server to give real answers.
            </p>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
            {sttSupported && (
              <button
                onClick={handleMicClick}
                title={isListening ? 'Stop listening' : 'Speak your question'}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition ${
                  isListening ? 'animate-pulse bg-rose-500 text-white' : 'bg-slate-100 text-ink-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                🎤
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening…' : 'Ask a health question…'}
              className="input-field flex-1 py-2 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || mutation.isPending}
              className="btn-primary h-9 w-9 shrink-0 rounded-full p-0 text-sm"
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
