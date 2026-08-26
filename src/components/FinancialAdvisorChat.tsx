import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
  BrainCircuit,
  SlidersHorizontal,
  RefreshCw,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ChatMessage, Transaction, Budget, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';

interface FinancialAdvisorChatProps {
  messages: ChatMessage[];
  onSendMessage: (userText: string, model: string, systemRole: string) => Promise<void>;
  onClearChat: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  currency: CurrencyCode;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

const CHATBOT_ROLES = [
  {
    id: 'general_advisor',
    name: 'المستشار المالي الشامل',
    desc: 'توجيه مالي متوازن، تخطيط مالي شامل، ونصائح مستدامة',
    icon: Sparkles,
    systemInstruction:
      'أنت مستشار مالي شخصي شامل. هدفك مساعدة المستخدم في فهم وضعه المالي بدقة، تقديم حلول منطقية وواقعية لترشيد الإنفاق، واستثمار المدخرات، بأسلوب داعم ومبسط.',
  },
  {
    id: 'cost_cutter',
    name: 'خبير تقليص النفقات والتوفير',
    desc: 'كشف تسريبات الصرف اليومية وحلول توفير 20-30%',
    icon: TrendingDown,
    systemInstruction:
      'أنت خبير متخصص في خفض المصاريف والهدر المالي. حلل مصاريف المستخدم بصرامة وذكاء، واقترح بدائل ذكية للمطاعم، الكافيهات، الاشتراكات، مع الحفاظ على جودة الحياة.',
  },
  {
    id: 'accountant',
    name: 'المحاسب والمدقق المالي',
    desc: 'حسابات دقيقة، نسب مئوية، ومراجعة ميزانيات',
    icon: BrainCircuit,
    systemInstruction:
      'أنت محاسب قانوني وخبير تدقيق مالي شخصي. قدم تحليلات رقمية دقيقة، مقارنات شهرية، نسب مئوية، وتوزيعات محاسبية وفق المعايير المالية السليمة.',
  },
  {
    id: 'fast_assistant',
    name: 'المساعد السريع الفوري',
    desc: 'إجابات موجزة ومباشرة للمهام السريعة والحسابات الخاطفة',
    icon: Zap,
    systemInstruction:
      'أنت مساعد محاسبي سريع جداً. أجب بأسلوب مكثف في نقاط سريعة ومختصرة ومباشرة دون إطالة.',
  },
];

const MODEL_OPTIONS = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'عام ومتوازن (موصى به)',
    desc: 'استجابة سريعة وذكية للمهام العامة وتحليل المصاريف',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'فائق السرعة ⚡',
    desc: 'إجابات فورية فائقة السرعة للمهام البسيطة والاستفسارات الخاطفة',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'تفكير محاسبي عميق 🧠',
    desc: 'تحليل مالي استراتيجي متقدم للمهام المعقدة والتخطيط طويل المدى',
  },
];

export const FinancialAdvisorChat: React.FC<FinancialAdvisorChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  transactions,
  budgets,
  currency,
  totalIncome,
  totalExpenses,
  netBalance,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState('general_advisor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompt injection
  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      const activeRole = CHATBOT_ROLES.find((r) => r.id === selectedRole);
      await onSendMessage(
        text,
        selectedModel,
        activeRole?.systemInstruction || CHATBOT_ROLES[0].systemInstruction
      );
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentRoleObj = CHATBOT_ROLES.find((r) => r.id === selectedRole) || CHATBOT_ROLES[0];

  const quickPrompts = [
    '📊 حلل مصاريفي هذا الشهر وأين يذهب أكثر مالي؟',
    '💡 كيف أوفر 20% من مصاريفي الحالية بدون حرمان؟',
    '⚖️ كيف أوزع راتبي وفق ميزانية 50/30/20؟',
    '☕ ما أثر مصاريف الكافيهات والمطاعم على ميزانيتي؟',
    '🛡️ ما هي أفضل طريقة لبناء صندوق طوارئ؟',
  ];

  return (
    <div className="bg-[#121214] rounded-3xl border border-zinc-800/80 shadow-2xl shadow-black/40 overflow-hidden flex flex-col h-[780px]">
      
      {/* Chat Top Header: Role & Model Pickers */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Role Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">{currentRoleObj.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/50 font-black">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-1">{currentRoleObj.desc}</p>
          </div>
        </div>

        {/* Model & Role Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role selector dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-hidden cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
          >
            {CHATBOT_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                الدور: {r.name}
              </option>
            ))}
          </select>

          {/* Model selector dropdown */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-purple-300 focus:outline-hidden cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>

          {/* Clear history */}
          <button
            onClick={onClearChat}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
            title="مسح سجل المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Awareness Banner */}
      <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            المستشار متصل بسجل حساباتك: (المصاريف: {totalExpenses} | الدخل: {totalIncome} | الرصيد: {netBalance})
          </span>
        </div>
        <span className="text-[10px] text-emerald-300 bg-emerald-900/60 border border-emerald-700/50 px-2 py-0.5 rounded-md font-bold">
          مزامنة حية
        </span>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0a0c]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-[#18181b] text-zinc-200 border border-zinc-800/80 rounded-tl-xs'
                }`}
              >
                {/* Content with simple formatting */}
                <div className="whitespace-pre-wrap space-y-1 font-medium">{msg.content}</div>

                {/* Bubble Footer */}
                <div
                  className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-emerald-500 text-emerald-100'
                      : 'border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString('ar-SA-u-nu-latn', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {msg.model && (
                        <span className="text-[9px] text-purple-300 bg-purple-950/70 border border-purple-800/40 px-1.5 py-0.2 rounded font-bold">
                          {msg.model}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-zinc-200 text-zinc-400 transition-colors cursor-pointer"
                        title="نسخ النص"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#18181b] rounded-2xl p-4 border border-zinc-800 text-xs text-zinc-400 font-medium flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>جاري التفكير وتحليل بياناتك المحاسبية بواسطة {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        <span className="text-[11px] font-bold text-zinc-500 shrink-0 ml-1">اقتراحات:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 border border-zinc-700/60 text-[11px] font-bold text-zinc-300 whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-[#121214] border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="اسأل المستشار المالي (مثال: كيف أوزع مصاريفي، حلل إيجاري، اقترح خطة ادخار...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-purple-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
