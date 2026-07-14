const ChatMessage = ({ role, content, onSpeak, isSpeaking, ttsSupported }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isAssistant
            ? 'rounded-tl-sm bg-slate-100 text-ink-900 dark:bg-slate-800 dark:text-slate-100'
            : 'rounded-tr-sm bg-brand-500 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {isAssistant && ttsSupported && (
          <button
            onClick={() => onSpeak(content)}
            className="mt-1.5 text-xs text-ink-500 hover:text-brand-500 dark:text-slate-400"
            title="Read aloud"
          >
            {isSpeaking ? '🔊 Speaking…' : '🔈 Listen'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
