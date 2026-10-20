import { describe, it, expect } from 'vitest';
import copilotReducer, {
  toggleCopilot,
  openCopilot,
  closeCopilot,
  setListening,
  toggleVoiceSynthesis,
  addUserMessage,
  startAssistantMessage,
  appendAssistantChunk,
  finishAssistantMessage,
  setToolCall,
  setToolResult,
  clearChatHistory,
} from './copilotSlice';

describe('copilotSlice Reducer', () => {
  it('should toggle and control drawer visibility', () => {
    let state = copilotReducer(undefined, { type: 'unknown' });
    expect(state.isOpen).toBe(false);

    state = copilotReducer(state, toggleCopilot());
    expect(state.isOpen).toBe(true);

    state = copilotReducer(state, closeCopilot());
    expect(state.isOpen).toBe(false);

    state = copilotReducer(state, openCopilot());
    expect(state.isOpen).toBe(true);
  });

  it('should toggle voice synthesis and listening states', () => {
    let state = copilotReducer(undefined, { type: 'unknown' });
    expect(state.voiceSynthesisEnabled).toBe(false);
    expect(state.isListening).toBe(false);

    state = copilotReducer(state, toggleVoiceSynthesis());
    expect(state.voiceSynthesisEnabled).toBe(true);

    state = copilotReducer(state, setListening(true));
    expect(state.isListening).toBe(true);
  });

  it('should add user messages and append streaming assistant chunks', () => {
    let state = copilotReducer(undefined, { type: 'unknown' });
    const initialCount = state.messages.length;

    state = copilotReducer(state, addUserMessage('Find Arsenal 19/20 away shirt'));
    expect(state.messages.length).toBe(initialCount + 1);
    expect(state.messages[state.messages.length - 1].content).toBe('Find Arsenal 19/20 away shirt');
    expect(state.messages[state.messages.length - 1].role).toBe('user');

    const asstId = 'asst-test-1';
    state = copilotReducer(state, startAssistantMessage({ id: asstId }));
    expect(state.isStreaming).toBe(true);

    state = copilotReducer(state, appendAssistantChunk({ id: asstId, chunk: 'Here is the ' }));
    state = copilotReducer(state, appendAssistantChunk({ id: asstId, chunk: 'Bruised Banana kit.' }));

    const asstMsg = state.messages.find((m) => m.id === asstId);
    expect(asstMsg?.content).toBe('Here is the Bruised Banana kit.');

    state = copilotReducer(state, finishAssistantMessage());
    expect(state.isStreaming).toBe(false);
  });

  it('should handle tool call and tool result state transitions', () => {
    let state = copilotReducer(undefined, { type: 'unknown' });
    state = copilotReducer(state, startAssistantMessage({ id: 'asst-tool-test' }));

    state = copilotReducer(
      state,
      setToolCall({
        name: 'search_jerseys',
        args: { query: 'Turin zebra stripes' },
      })
    );
    expect(state.currentTool?.name).toBe('search_jerseys');
    expect(state.currentTool?.status).toBe('running');

    state = copilotReducer(
      state,
      setToolResult({
        name: 'search_jerseys',
        result: { count: 2, results: [] },
      })
    );
    expect(state.currentTool?.status).toBe('done');
  });

  it('should reset chat history on clearChatHistory', () => {
    let state = copilotReducer(undefined, { type: 'unknown' });
    state = copilotReducer(state, addUserMessage('Query 1'));
    state = copilotReducer(state, addUserMessage('Query 2'));

    state = copilotReducer(state, clearChatHistory());
    expect(state.messages.length).toBe(1); // Welcome message preserved
    expect(state.messages[0].id).toBe('welcome-1');
  });
});
