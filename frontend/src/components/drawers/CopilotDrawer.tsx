import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Maximize2,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  openCopilot,
  closeCopilot,
  clearPendingPrompt,
  toggleMinimize,
  setMinimized,
  addUserMessage,
  startAssistantMessage,
  appendAssistantChunk,
  setToolCall,
  setToolResult,
  finishAssistantMessage,
  clearChatHistory,
  toggleVoiceSynthesis,
  setListening,
} from '../../store/slices/copilotSlice';
import { addToCartThunk, loadCartThunk } from '../../store/slices/cartSlice';
import { streamAIChat } from '../../services/api';
import type { Jersey } from '../../types';
import { Link, useNavigate } from 'react-router-dom';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const DEFAULT_KIT_IMAGE =
  'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80';

/**
 * Clean markdown formatter for AI assistant text.
 * Replaces raw markdown asterisks, bold tags, and price strings with styled elements.
 */
function renderFormattedMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Clean raw triple asterisks like ***Price:*** into clean bold
  const cleaned = text.replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**');
  const paragraphs = cleaned.split(/\n{2,}/);

  return (
    <div className="space-y-2 leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Check if bullet or numbered list item
              const isBullet = /^[-*]\s+/.test(trimmed);
              const isNumbered = /^\d+\.\s+/.test(trimmed);
              const contentToFormat = trimmed.replace(/^([-*]|\d+\.)\s+/, '');

              // Format bold segments (**bold**)
              const parts = contentToFormat.split(/(\*\*[^*]+\*\*)/g);
              const formattedLine = parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2);
                  return (
                    <strong
                      key={partIdx}
                      className="font-bold text-[var(--text-primary)]"
                    >
                      {boldText}
                    </strong>
                  );
                }
                return part;
              });

              if (isBullet || isNumbered) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="text-[var(--accent-primary)] font-bold text-xs mt-0.5">
                      {isNumbered ? `${trimmed.match(/^\d+/)?.[0]}.` : '•'}
                    </span>
                    <span className="flex-1">{formattedLine}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{formattedLine}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive visual card rendered inside the chat feed for discovered jerseys.
 */
interface JerseyCardProps {
  jersey: Jersey | any;
  onQuickAdd: (jersey: any, variantId?: string) => Promise<void>;
  onNavigateToCatalog: () => void;
}

const JerseyChatCard: React.FC<JerseyCardProps> = ({
  jersey,
  onQuickAdd,
  onNavigateToCatalog,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    jersey.images?.[0] || DEFAULT_KIT_IMAGE
  );

  const availableSizes = Array.isArray(jersey.availableSizes)
    ? jersey.availableSizes
    : [];

  const defaultVariant = availableSizes[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    defaultVariant?.id
  );
  const [selectedSizeName, setSelectedSizeName] = useState<string>(
    defaultVariant?.size || 'M'
  );

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    try {
      await onQuickAdd(jersey, selectedVariantId);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const priceValue =
    typeof jersey.priceUsd === 'number'
      ? jersey.priceUsd.toFixed(2)
      : typeof jersey.basePrice === 'number'
      ? jersey.basePrice.toFixed(2)
      : jersey.priceUsd || jersey.basePrice || '79.99';

  const similarityScore = jersey.similarityScore || jersey.similarity;

  return (
    <div className="group bg-white rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="p-2.5 flex items-start gap-3">
        {/* Kit Thumbnail */}
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-200/70 shrink-0 relative flex items-center justify-center p-1">
          <img
            src={imgSrc}
            alt={jersey.title}
            onError={() => setImgSrc(DEFAULT_KIT_IMAGE)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
          />
          {jersey.kitType && (
            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-black/70 backdrop-blur-xs text-white">
              {jersey.kitType}
            </span>
          )}
        </div>

        {/* Kit Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
              {jersey.club || jersey.league || 'Authentic Kit'}
            </span>
            {similarityScore && (
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50/60 px-1 py-0.2 rounded border border-emerald-200">
                {(similarityScore * 100).toFixed(0)}% match
              </span>
            )}
          </div>

          <h5 className="font-serif font-bold text-xs text-[var(--text-primary)] mt-1 line-clamp-1 leading-snug">
            {jersey.title}
          </h5>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono font-black text-xs text-[var(--text-primary)]">
              {priceValue} USD
            </span>
            {jersey.season && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {jersey.season}
              </span>
            )}
          </div>

          {/* Size Pills */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] font-mono text-[var(--text-muted)]">
                Size:
              </span>
              {availableSizes.map((v: any, idx: number) => {
                const sName = typeof v === 'string' ? v : v.size;
                const vId = typeof v === 'object' ? v.id : undefined;
                const isSelected = selectedSizeName === sName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSizeName(sName);
                      setSelectedVariantId(vId);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {sName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-2.5 py-2 bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/jerseys/${jersey.slug || jersey.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <span className="text-neutral-300">|</span>
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="text-[10px] font-mono text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
          >
            In Catalog
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            justAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[var(--accent-primary)] hover:bg-[var(--btn-hover)] text-white'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3 h-3" />
              <span>Add {selectedSizeName}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Main Floating KitBot Component
 * Floats non-intrusively in the bottom-right corner without blocking the website interface.
 */
export const CopilotDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    isOpen,
    isMinimized,
    messages,
    isStreaming,
    isListening,
    isWorking,
    workingStage,
    voiceSynthesisEnabled,
    suggestedChips,
    currentTool,
    pendingPrompt,
  } = useAppSelector((state) => state.copilot);

  const [inputText, setInputText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Click outside to close chat window
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Ignore clicks inside the chat window
      if (chatWindowRef.current && chatWindowRef.current.contains(target)) {
        return;
      }

      // Ignore clicks on elements explicitly designated to trigger or toggle KitBot
      if (target.closest('[data-copilot-trigger="true"]')) {
        return;
      }

      dispatch(closeCopilot());
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, [isOpen, isMinimized, dispatch]);

  // Press Escape to close chat window
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(closeCopilot());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMinimized, dispatch]);

  // Trigger pending prompt automatically if dispatched from external page components
  useEffect(() => {
    if (pendingPrompt) {
      const promptText = pendingPrompt;
      dispatch(clearPendingPrompt());
      handleSendMessage(promptText);
    }
  }, [pendingPrompt]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        dispatch(setListening(false));
      };

      recognition.onerror = () => {
        dispatch(setListening(false));
      };

      recognition.onend = () => {
        dispatch(setListening(false));
      };

      recognitionRef.current = recognition;
    }
  }, [dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, currentTool, isWorking, isOpen, isMinimized]);

  // Voice output via speechSynthesis
  const speakText = (text: string) => {
    if (!voiceSynthesisEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting before speaking
    const cleanSpeech = text
      .replace(/[*_#`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMic = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      dispatch(setListening(false));
    } else {
      try {
        recognitionRef.current.start();
        dispatch(setListening(true));
      } catch {
        dispatch(setListening(false));
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isStreaming) return;

    setInputText('');
    dispatch(addUserMessage(text));

    const assistantMsgId = `asst-${Date.now()}`;
    dispatch(startAssistantMessage({ id: assistantMsgId }));

    try {
      await streamAIChat(text, {
        onChunk: (chunk) => {
          dispatch(appendAssistantChunk({ id: assistantMsgId, chunk }));
        },
        onToolCall: (tool) => {
          dispatch(setToolCall(tool));
        },
        onToolResult: (tool) => {
          dispatch(setToolResult(tool));

          // If searching jerseys, navigate directly to catalog so user sees kits in the grid!
          if (tool.name === 'search_jerseys') {
            const res = tool.result as any;
            const found = res?.jerseys || res?.results;
            if (Array.isArray(found) && found.length > 0) {
              if (window.location.pathname !== '/jerseys') {
                navigate('/jerseys');
              }
            }
          }

          // If a tool modified the cart, reload cart from backend
          if (tool.name === 'add_to_cart') {
            dispatch(loadCartThunk());
          }
        },
        onComplete: (fullText) => {
          dispatch(finishAssistantMessage());
          speakText(fullText);
        },
        onError: (err) => {
          dispatch(
            appendAssistantChunk({
              id: assistantMsgId,
              chunk: `\n\n[KitBot Alert]: ${err}`,
            })
          );
          dispatch(finishAssistantMessage());
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Connection failed';
      dispatch(
        appendAssistantChunk({
          id: assistantMsgId,
          chunk: `\n\n[KitBot Network Alert]: ${errMsg}. Please verify that the backend server is running.`,
        })
      );
      dispatch(finishAssistantMessage());
    }
  };

  const handleQuickAddJersey = async (jersey: any, variantId?: string) => {
    let targetVariantId = variantId;

    if (!targetVariantId) {
      if (Array.isArray(jersey.availableSizes) && jersey.availableSizes.length > 0) {
        targetVariantId = jersey.availableSizes[0]?.id;
      } else if (Array.isArray(jersey.variants) && jersey.variants.length > 0) {
        targetVariantId = jersey.variants[0]?.id;
      }
    }

    if (!targetVariantId) return;

    await dispatch(
      addToCartThunk({
        payload: {
          jerseyVariantId: targetVariantId,
          quantity: 1,
        },
      })
    );
    dispatch(loadCartThunk());
  };

  const getFriendlyToolLabel = (toolName: string) => {
    switch (toolName) {
      case 'search_jerseys':
        return 'Searching authentic matchday kits';
      case 'recommend_size':
        return 'Analyzing fit and size recommendations';
      case 'add_to_cart':
        return 'Reserving size and updating bag';
      case 'get_cart_summary':
        return 'Checking your shopping bag';
      default:
        return 'Finding the best kits for you';
    }
  };

  return (
    <>
      {/* Floating Widget Root (Non-blocking, zero backdrop overlay) */}
      {!isOpen && (
        <button
          onClick={() => dispatch(openCopilot())}
          data-copilot-trigger="true"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[var(--text-primary)] text-white shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(4,120,87,0.4)] hover:scale-105 transition-all border border-emerald-500/40 group cursor-pointer"
          aria-label="Open AI KitBot Matchday Assistant"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-black text-xs tracking-wide group-hover:text-emerald-400 transition-colors">
              Ask KitBot
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Matchday Stylist
            </span>
          </div>
        </button>
      )}

      {/* Minimized Floating Dock Pill */}
      {isOpen && isMinimized && (
        <div
          data-copilot-trigger="true"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--text-primary)] text-white shadow-2xl border border-neutral-700/80 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => dispatch(setMinimized(false))}
          >
            <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-serif font-bold text-xs tracking-wide">
                KitBot Active
              </span>
              <span className="text-[10px] text-emerald-400 font-mono ml-2">
                {isWorking ? '⚡ Working...' : '● Online'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-neutral-700">
            <button
              onClick={() => dispatch(setMinimized(false))}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Expand KitBot"
              aria-label="Expand KitBot"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(closeCopilot())}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close KitBot"
              aria-label="Close KitBot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Full Floating Chat Window (Does NOT block the webpage) */}
      {isOpen && !isMinimized && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] md:w-[460px] h-[580px] max-h-[calc(100vh-80px)] bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.06)] border border-[var(--border-subtle)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        >
          {/* Window Header */}
          <div className="p-3.5 sm:p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--text-primary)] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs border border-emerald-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-sm tracking-wide text-white">
                    KITBOT MATCHDAY AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isWorking ? 'Searching Vault' : 'Online'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  {isWorking
                    ? '⚡ Searching matchday catalog in real time...'
                    : 'Tactile kit curator & sizing specialist'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Voice Readout Toggle */}
              <button
                onClick={() => dispatch(toggleVoiceSynthesis())}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  voiceSynthesisEnabled
                    ? 'text-emerald-400 bg-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={
                  voiceSynthesisEnabled
                    ? 'Voice Readout Enabled'
                    : 'Enable Voice Readout'
                }
              >
                {voiceSynthesisEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Clear History */}
              <button
                onClick={() => dispatch(clearChatHistory())}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Minimize Window */}
              <button
                onClick={() => dispatch(toggleMinimize())}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Minimize window"
                aria-label="Minimize KitBot"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Close Window */}
              <button
                onClick={() => dispatch(closeCopilot())}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close KitBot window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Tool Execution Pill (Live Feedback) */}
          {currentTool && (
            <div className="px-3.5 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-sans shrink-0 animate-in slide-in-from-top-1 duration-150">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
              <span>
                <strong>{getFriendlyToolLabel(currentTool.name)}</strong>...
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-[var(--bg-canvas)]">
            {(() => {
              const lastAssistantMsg = [...messages]
                .reverse()
                .find((m) => m.role === 'assistant');
              const lastAssistantMsgHasContent = Boolean(
                lastAssistantMsg &&
                  ((lastAssistantMsg.content &&
                    lastAssistantMsg.content.trim().length > 0) ||
                    (lastAssistantMsg.tools &&
                      lastAssistantMsg.tools.length > 0) ||
                    (lastAssistantMsg.suggestedJerseys &&
                      lastAssistantMsg.suggestedJerseys.length > 0))
              );

              return (
                <>
                  {messages.map((msg) => {
                    // Extract discovered jerseys from tools or suggestedJerseys
                    const searchTool = msg.tools?.find(
                      (t) => t.name === 'search_jerseys'
                    );
                    const toolResult = searchTool?.result as any;
                    const foundJerseys =
                      msg.suggestedJerseys ||
                      toolResult?.jerseys ||
                      toolResult?.results ||
                      [];

                    const hasContent = Boolean(
                      msg.content && msg.content.trim().length > 0
                    );
                    const hasTools = Boolean(msg.tools && msg.tools.length > 0);
                    const hasJerseys = foundJerseys.length > 0;

                    // Do not render empty assistant bubble while waiting for AI response/tools (prevents solitary dot/cursor)
                    if (
                      msg.role === 'assistant' &&
                      !hasContent &&
                      !hasTools &&
                      !hasJerseys
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            msg.role === 'user'
                              ? 'bg-[var(--accent-primary)] text-white rounded-tr-xs'
                              : 'bg-white text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-xs'
                          }`}
                        >
                          {/* Render message body with clean markdown styling */}
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            renderFormattedMarkdown(msg.content)
                          )}

                          {/* Discovered Jerseys Preview Inside Chat */}
                          {foundJerseys.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                  Discovered Kits ({foundJerseys.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => navigate('/jerseys')}
                                  className="text-emerald-700 hover:text-emerald-950 underline font-semibold cursor-pointer"
                                >
                                  View in Catalog &rarr;
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2 pt-0.5">
                                {foundJerseys.slice(0, 3).map((kit: any) => (
                                  <JerseyChatCard
                                    key={kit.id}
                                    jersey={kit}
                                    onQuickAdd={handleQuickAddJersey}
                                    onNavigateToCatalog={() =>
                                      navigate('/jerseys')
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Render Add to Cart Confirmation Badge */}
                          {msg.tools?.some((t) => t.name === 'add_to_cart') && (
                            <div className="mt-2.5 p-2 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Kit added to your shopping bag!
                              </span>
                              <Link
                                to="/cart"
                                className="text-emerald-900 underline font-bold"
                              >
                                View Bag &rarr;
                              </Link>
                            </div>
                          )}

                          {/* Render Size Recommendation Card */}
                          {msg.tools?.some(
                            (t) => t.name === 'recommend_size'
                          ) && (
                            <div className="mt-2.5 p-2 bg-blue-50 rounded-lg text-blue-900 text-xs border border-blue-200">
                              <span className="font-bold">
                                Recommended Fit:{' '}
                              </span>
                              {(
                                msg.tools.find(
                                  (t) => t.name === 'recommend_size'
                                )?.result as any
                              )?.recommendedSize}{' '}
                              —{' '}
                              {(
                                msg.tools.find(
                                  (t) => t.name === 'recommend_size'
                                )?.result as any
                              )?.reasoning}
                            </div>
                          )}

                          {/* Blinking cursor during streaming (only if message has text) */}
                          {isStreaming &&
                            hasContent &&
                            msg.id === messages[messages.length - 1]?.id && (
                              <span className="inline-block w-1.5 h-3.5 bg-[var(--accent-primary)] ml-1 animate-pulse align-middle" />
                            )}
                        </div>
                      </div>
                    );
                  })}

                  {/* HIGH-VISIBILITY ANIMATION WITH TEXT WHEN KITBOT IS WORKING */}
                  {isWorking &&
                    (!lastAssistantMsgHasContent || currentTool) && (
                      <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs relative">
                          <Bot className="w-4 h-4 animate-pulse" />
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>

                        <div className="max-w-[88%] rounded-2xl p-3.5 bg-white border border-emerald-500/40 text-xs sm:text-sm shadow-md rounded-tl-xs space-y-2.5">
                          <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold">
                            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                            <span className="tracking-wide">
                              {workingStage ||
                                'KitBot is searching our matchday vault...'}
                            </span>
                          </div>

                          <p className="text-[11px] text-[var(--text-muted)] font-sans leading-relaxed">
                            Searching authentic jerseys across clubs, retro eras, collar cuts & live inventory...
                          </p>

                          {/* Shimmering Animated Progress Bar */}
                          <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden relative">
                            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full w-3/4 animate-pulse" />
                          </div>

                          {/* Bouncing Soundwave Indicator Dots */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                            <span className="text-[10px] font-mono text-emerald-700 ml-1.5 font-bold">
                              Matchday Vault Search Active
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              );
            })()}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Zero scrollbar, sleek hover) */}
          <div className="p-2.5 bg-white border-t border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              Prompts:
            </span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isStreaming}
                className="px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] whitespace-nowrap hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input & Web Speech Mic Bar */}
          <div className="p-3 bg-white border-t border-[var(--border-subtle)] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Web Speech API Mic Toggle */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-2 rounded-full transition-all border shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-md ring-2 ring-red-300'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]'
                  }`}
                  title={
                    isListening
                      ? 'Listening... Click to stop'
                      : 'Speak your query via Web Speech'
                  }
                >
                  {isListening ? (
                    <Mic className="w-4 h-4 animate-bounce" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                placeholder={
                  isListening
                    ? 'Listening to your voice...'
                    : 'Ask for kits, sizing, vintage shirts...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:bg-white transition-all disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isStreaming}
                className="p-2 rounded-full bg-[var(--accent-primary)] text-white hover:bg-[var(--btn-hover)] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {isListening && (
              <div className="mt-1.5 text-center text-[10px] font-sans text-red-600 animate-pulse font-medium">
                🎙 Listening... Speak clearly into your microphone
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
