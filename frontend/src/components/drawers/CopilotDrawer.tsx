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
  Cpu,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closeCopilot,
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
import { Link } from 'react-router-dom';

// TypeScript declarations for browser Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const CopilotDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isOpen,
    messages,
    isStreaming,
    isListening,
    voiceSynthesisEnabled,
    suggestedChips,
    currentTool,
  } = useAppSelector((state) => state.copilot);

  const [inputText, setInputText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, currentTool]);

  // Voice output via speechSynthesis
  const speakText = (text: string) => {
    if (!voiceSynthesisEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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

  const handleQuickAddJersey = async (jersey: Jersey) => {
    if (!jersey.variants || jersey.variants.length === 0) return;
    // Default to 'M' or first variant
    const variant =
      jersey.variants.find((v) => v.size === 'M') || jersey.variants[0];

    await dispatch(
      addToCartThunk({
        payload: {
          jerseyVariantId: variant.id,
          quantity: 1,
        },
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(closeCopilot())}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[var(--border-subtle)] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--text-primary)] text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-base tracking-wide text-white">
                    KitBot Matchday AI
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    pgvector v16
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Tactile football kit curator & sizing specialist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Readout Toggle */}
              <button
                onClick={() => dispatch(toggleVoiceSynthesis())}
                className={`p-2 rounded-full transition-colors ${
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
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Drawer */}
              <button
                onClick={() => dispatch(closeCopilot())}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                aria-label="Close KitBot Copilot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Tool Execution Pill (Live Feedback) */}
          {currentTool && (
            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-mono animate-in slide-in-from-top-1 duration-150">
              <Cpu className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
              <span>
                Running Tool:{' '}
                <strong>
                  {currentTool.name}
                  {currentTool.name === 'search_jerseys'
                    ? ' (pgvector cosine search)'
                    : ''}
                </strong>
                ...
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-canvas)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent-primary)] text-white rounded-tr-xs'
                      : 'bg-white text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Render Tool Results Badges */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                      {msg.tools.map((t, idx) => {
                        const isSearch = t.name === 'search_jerseys';
                        const isAddToCart = t.name === 'add_to_cart';
                        const isSize = t.name === 'recommend_size';
                        const searchResults = (t.result as any)?.results as
                          | Jersey[]
                          | undefined;

                        return (
                          <div key={idx} className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-mono text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Tool: {t.name}</span>
                            </div>

                            {/* Render search results cards directly in chat bubble */}
                            {isSearch &&
                              searchResults &&
                              searchResults.length > 0 && (
                                <div className="grid grid-cols-1 gap-2 pt-1">
                                  {searchResults.slice(0, 3).map((kit) => (
                                    <div
                                      key={kit.id}
                                      className="flex items-center gap-2.5 p-2 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-all"
                                    >
                                      <img
                                        src={
                                          kit.images[0] ||
                                          'https://images.unsplash.com/photo-1577223625816-7546f13df25d'
                                        }
                                        alt={kit.title}
                                        className="w-12 h-14 object-cover rounded shrink-0 bg-white"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-serif font-bold text-xs text-[var(--text-primary)] truncate">
                                          {kit.title}
                                        </h5>
                                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                                          <span className="font-mono font-bold text-[var(--accent-primary)]">
                                            {Number(kit.basePrice).toFixed(2)}{' '}
                                            USD
                                          </span>
                                          {kit.similarity && (
                                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                                              {(
                                                kit.similarity * 100
                                              ).toFixed(0)}
                                              % match
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Link
                                          to={`/jerseys/${kit.slug}`}
                                          onClick={() =>
                                            dispatch(closeCopilot())
                                          }
                                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded bg-white border border-[var(--border-subtle)]"
                                          title="View Details"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        <button
                                          onClick={() =>
                                            handleQuickAddJersey(kit)
                                          }
                                          className="p-1.5 bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--btn-hover)] transition-colors shadow-xs"
                                          title="Add to Bag"
                                        >
                                          <ShoppingBag className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Render Add to cart success card */}
                            {isAddToCart && (
                              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between">
                                <span>Jersey added to your shopping bag!</span>
                                <Link
                                  to="/cart"
                                  onClick={() => dispatch(closeCopilot())}
                                  className="text-emerald-900 underline font-bold"
                                >
                                  View Bag &rarr;
                                </Link>
                              </div>
                            )}

                            {/* Render Size Recommendation */}
                            {isSize && (
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-900 text-xs">
                                <span className="font-bold">
                                  Recommended Size:{' '}
                                </span>
                                {(t.result as any)?.recommendedSize} —{' '}
                                {(t.result as any)?.reasoning}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Blinking cursor during streaming */}
                  {isStreaming &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-3.5 bg-[var(--accent-primary)] ml-1 animate-pulse align-middle" />
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Chips */}
          <div className="p-3 bg-white border-t border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              Prompts:
            </span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isStreaming}
                className="px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] whitespace-nowrap hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input & Web Speech Mic Bar */}
          <div className="p-4 bg-white border-t border-[var(--border-subtle)]">
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
                  className={`p-2.5 rounded-full transition-all border ${
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
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:bg-white transition-all disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isStreaming}
                className="p-2.5 rounded-full bg-[var(--accent-primary)] text-white hover:bg-[var(--btn-hover)] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {isListening && (
              <div className="mt-2 text-center text-[10px] font-mono text-red-600 animate-pulse">
                🎙 Web Speech Active: Speak clearly into your microphone...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
