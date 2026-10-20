import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CopilotMessage, Jersey } from '../../types';

export interface CopilotState {
  isOpen: boolean;
  isStreaming: boolean;
  isListening: boolean;
  voiceSynthesisEnabled: boolean;
  messages: CopilotMessage[];
  suggestedChips: string[];
  currentTool: {
    name: string;
    args?: Record<string, unknown>;
    result?: unknown;
    status: 'running' | 'done';
  } | null;
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
  isStreaming: false,
  isListening: false,
  voiceSynthesisEnabled: false,
  messages: initialMessages,
  suggestedChips: [
    'Find 2019/20 Barcelona home shirt',
    'Show iconic black and white zebra stripes from Turin',
    'Recommend size for 180cm and 75kg',
    'Show me mint green away kits',
  ],
  currentTool: null,
};

export const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    toggleCopilot: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCopilot: (state) => {
      state.isOpen = true;
    },
    closeCopilot: (state) => {
      state.isOpen = false;
    },
    setListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload;
    },
    toggleVoiceSynthesis: (state) => {
      state.voiceSynthesisEnabled = !state.voiceSynthesisEnabled;
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
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
    finishAssistantMessage: (state) => {
      state.isStreaming = false;
      state.currentTool = null;
    },
    clearChatHistory: (state) => {
      state.messages = initialMessages;
      state.currentTool = null;
    },
  },
});

export const {
  toggleCopilot,
  openCopilot,
  closeCopilot,
  setListening,
  toggleVoiceSynthesis,
  setStreaming,
  addUserMessage,
  startAssistantMessage,
  appendAssistantChunk,
  setToolCall,
  setToolResult,
  attachSuggestedJerseys,
  finishAssistantMessage,
  clearChatHistory,
} = copilotSlice.actions;

export default copilotSlice.reducer;
