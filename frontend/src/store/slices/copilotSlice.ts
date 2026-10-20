import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CopilotMessage, Jersey } from '../../types';

export interface CopilotState {
  isOpen: boolean;
  isMinimized: boolean;
  isStreaming: boolean;
  isListening: boolean;
  isWorking: boolean;
  workingStage: string;
  voiceSynthesisEnabled: boolean;
  messages: CopilotMessage[];
  suggestedChips: string[];
  currentTool: {
    name: string;
    args?: Record<string, unknown>;
    result?: unknown;
    status: 'running' | 'done';
  } | null;
  pendingPrompt: string | null;
  aiCatalogJerseys: any[] | null;
  aiCatalogQuery: string | null;
}

const initialMessages: CopilotMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      'Welcome to the KitRoom. I am KitBot, your football kit curator and sizing specialist. Ask me anything—from vintage 90s European kits and classic Turin stripes to finding the ideal matchday fit or adding a jersey to your bag.',
    timestamp: new Date().toISOString(),
  },
];

const initialState: CopilotState = {
  isOpen: false,
  isMinimized: false,
  isStreaming: false,
  isListening: false,
  isWorking: false,
  workingStage: '',
  voiceSynthesisEnabled: false,
  messages: initialMessages,
  suggestedChips: [
    'Find 2019/20 Barcelona home shirt',
    'Show iconic black and white zebra stripes from Turin',
    'Recommend size for 180cm and 75kg',
    'Show me mint green away kits',
  ],
  currentTool: null,
  pendingPrompt: null,
  aiCatalogJerseys: null,
  aiCatalogQuery: null,
};

export const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    toggleCopilot: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.isMinimized = false;
      }
    },
    openCopilot: (state) => {
      state.isOpen = true;
      state.isMinimized = false;
    },
    openCopilotWithPrompt: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.isMinimized = false;
      state.pendingPrompt = action.payload;
    },
    clearPendingPrompt: (state) => {
      state.pendingPrompt = null;
    },
    closeCopilot: (state) => {
      state.isOpen = false;
    },
    toggleMinimize: (state) => {
      state.isMinimized = !state.isMinimized;
    },
    setMinimized: (state, action: PayloadAction<boolean>) => {
      state.isMinimized = action.payload;
    },
    setListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload;
    },
    toggleVoiceSynthesis: (state) => {
      state.voiceSynthesisEnabled = !state.voiceSynthesisEnabled;
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
      if (!action.payload) {
        state.isWorking = false;
        state.workingStage = '';
      }
    },
    setWorkingState: (
      state,
      action: PayloadAction<{ isWorking: boolean; stage?: string }>
    ) => {
      state.isWorking = action.payload.isWorking;
      state.workingStage = action.payload.stage || '';
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
      state.isWorking = true;
      state.workingStage = `KitBot is curating kits for "${action.payload}"...`;
    },
    startAssistantMessage: (state, action: PayloadAction<{ id: string }>) => {
      state.messages.push({
        id: action.payload.id,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        tools: [],
      });
      state.isStreaming = true;
      state.isWorking = true;
      if (!state.workingStage) {
        state.workingStage = 'KitBot is preparing recommendations...';
      }
    },
    appendAssistantChunk: (state, action: PayloadAction<{ id: string; chunk: string }>) => {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.content += action.payload.chunk;
      }
    },
    setToolCall: (
      state,
      action: PayloadAction<{ name: string; args?: Record<string, unknown> }>
    ) => {
      state.currentTool = {
        name: action.payload.name,
        args: action.payload.args,
        status: 'running',
      };
      state.isWorking = true;
      if (action.payload.name === 'search_jerseys') {
        const queryText = (action.payload.args as any)?.query || 'your kit';
        state.workingStage = `⚡ KitBot is searching our matchday vault for "${queryText}"...`;
      } else if (action.payload.name === 'add_to_cart') {
        state.workingStage = '🛍️ KitBot is reserving your size and updating your bag...';
      } else if (action.payload.name === 'recommend_size') {
        state.workingStage = '📏 KitBot is analyzing player cut specifications & sizing...';
      } else {
        state.workingStage = 'KitBot is searching our matchday vault...';
      }
    },
    setToolResult: (
      state,
      action: PayloadAction<{ name: string; result?: unknown }>
    ) => {
      if (state.currentTool && state.currentTool.name === action.payload.name) {
        state.currentTool.result = action.payload.result;
        state.currentTool.status = 'done';
      }
      // Attach to the last assistant message
      const lastMsg = [...state.messages].reverse().find((m) => m.role === 'assistant');
      if (lastMsg) {
        if (!lastMsg.tools) lastMsg.tools = [];
        lastMsg.tools.push({
          name: action.payload.name,
          result: action.payload.result,
        });

        // If search_jerseys produced kits, directly populate aiCatalogJerseys for the Catalog!
        if (action.payload.name === 'search_jerseys') {
          const res = action.payload.result as any;
          const found = res?.jerseys || res?.results;
          if (Array.isArray(found) && found.length > 0) {
            lastMsg.suggestedJerseys = found;
            state.aiCatalogJerseys = found;
            state.aiCatalogQuery = res?.query || null;
            state.workingStage = `Found ${found.length} matching kits! Rendering in catalog...`;
          }
        }
      }
    },
    attachSuggestedJerseys: (
      state,
      action: PayloadAction<{ messageId: string; jerseys: Jersey[] }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.suggestedJerseys = action.payload.jerseys;
      }
    },
    setAiCatalogJerseys: (
      state,
      action: PayloadAction<{ jerseys: any[] | null; query?: string | null }>
    ) => {
      state.aiCatalogJerseys = action.payload.jerseys;
      state.aiCatalogQuery = action.payload.query || null;
    },
    clearAiCatalogJerseys: (state) => {
      state.aiCatalogJerseys = null;
      state.aiCatalogQuery = null;
    },
    finishAssistantMessage: (state) => {
      state.isStreaming = false;
      state.currentTool = null;
      state.isWorking = false;
      state.workingStage = '';
    },
    clearChatHistory: (state) => {
      state.messages = initialMessages;
      state.currentTool = null;
      state.aiCatalogJerseys = null;
      state.aiCatalogQuery = null;
      state.isWorking = false;
      state.workingStage = '';
    },
  },
});

export const {
  toggleCopilot,
  openCopilot,
  openCopilotWithPrompt,
  clearPendingPrompt,
  closeCopilot,
  toggleMinimize,
  setMinimized,
  setListening,
  toggleVoiceSynthesis,
  setStreaming,
  setWorkingState,
  addUserMessage,
  startAssistantMessage,
  appendAssistantChunk,
  setToolCall,
  setToolResult,
  attachSuggestedJerseys,
  setAiCatalogJerseys,
  clearAiCatalogJerseys,
  finishAssistantMessage,
  clearChatHistory,
} = copilotSlice.actions;

export default copilotSlice.reducer;
