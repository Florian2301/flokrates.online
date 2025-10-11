import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Actor } from '../types/ActorStyles';
import { Message } from '../types/Message';
import { RootState } from './store';

type MessagesState = {
  selectedmessages: Message[];
  loading: boolean;
  error?: string | null;
};

const initialState: MessagesState = {
  selectedmessages: [],
  loading: false,
  error: null,
};

// get all messages
export const fetchMessages = createAsyncThunk<Message[]>(
  'messages/fetch',
  async () => {
    const res = await fetch(`${process.env.API_BASE_URL}/api/messages`);
    const data = await res.json();
    return data as Message[];
  }
);

// get one message
export const saveSingleMessage = createAsyncThunk(
  'messages/saveSingle',
  async (payload: {
    messageId: number;
    messageNumber: number;
    respId: number | null;
    actor: Actor;
    messageText: string;
  }) => {
    await fetch(
      `${process.env.API_BASE_URL}/api/messages/${payload.messageId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageNumber: payload.messageNumber,
          respId: payload.respId,
          actor: payload.actor,
          messageText: payload.messageText,
        }),
      }
    );
    return payload;
  }
);

// create message
export const createMessage = createAsyncThunk<
  Message,
  Omit<Message, 'messageId'>,
  { rejectValue: string }
>('messages/createMessage', async (newMessage, { rejectWithValue }) => {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    });

    if (!res.ok) throw new Error('Fehler beim Erstellen der Nachricht');
    const created = await res.json();
    return created as Message;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Erstellen der Nachricht');
  }
});

// patch message
export const patchMessage = createAsyncThunk<
  Message,
  { messageId: number; updates: Partial<Message> },
  { rejectValue: string }
>(
  'messages/patchMessage',
  async ({ messageId, updates }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.API_BASE_URL}/api/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) throw new Error('Fehler beim Patchen der Nachricht');
      const updated = await res.json();
      return updated as Message;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Fehler beim Patchen der Nachricht');
    }
  }
);

// put message
export const putMessage = createAsyncThunk<
  Message,
  Message,
  { rejectValue: string }
>('messages/putMessage', async (message, { rejectWithValue }) => {
  try {
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/messages/${message.messageId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }
    );

    if (!res.ok) throw new Error('Fehler beim Aktualisieren (PUT)');
    const updated = await res.json();
    return updated as Message;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Aktualisieren (PUT)');
  }
});

// delete message
export const deleteMessageThunk = createAsyncThunk(
  'messages/delete',
  async (messageId: number) => {
    await fetch(`${process.env.API_BASE_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
    });
    return messageId;
  }
);

// save all messages
export const saveAllMessages = createAsyncThunk(
  'messages/saveAll',
  async (msgs: Message[]) => {
    await Promise.all(
      msgs.map((msg) =>
        fetch(`${process.env.API_BASE_URL}/api/messages/${msg.messageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageNumber: msg.messageNumber,
            respId: msg.respId,
            actor: msg.actor,
            messageText: msg.messageText,
          }),
        })
      )
    );
    return msgs;
  }
);

// check if messages has changed and sort if messagenumber has changed
export const changeMessage = createAsyncThunk<
  void,
  {
    messageId: number;
    updatedText: string;
    newActor: Actor;
    newMessageNumber: number;
    oldMessageNumber: number;
    responseId: number | null;
  },
  { state: RootState }
>(
  'messages/changeMessage',
  async (
    {
      messageId,
      updatedText,
      newActor,
      newMessageNumber,
      oldMessageNumber,
      responseId,
    },
    { dispatch, getState }
  ) => {
    const state = getState();
    const messages = state.messages.selectedmessages;

    let messagesChanged = false;

    const updatedMessages = messages.map((msg) => {
      // check if property has changed
      if (msg.messageId === messageId) {
        const messageChanged =
          msg.messageText !== updatedText ||
          msg.actor !== newActor ||
          msg.respId !== responseId ||
          msg.messageNumber !== newMessageNumber;

        // if it has changed update all properties except messagenumber
        if (messageChanged) {
          messagesChanged = true;
          return {
            ...msg,
            messageText:
              msg.messageText !== updatedText ? updatedText : msg.messageText,
            actor: msg.actor !== newActor ? newActor : msg.actor,
            respId: msg.respId !== responseId ? responseId : msg.respId,
          };
        }
      }
      return msg;
    });

    if (!messagesChanged) return;

    // if messagenumber has changed
    if (oldMessageNumber !== newMessageNumber) {
      const sorted = updatedMessages
        .map((msg) => {
          // if oldnumber is bigger than newnumber check if number of iterated message is bigger or even newnumber
          // and number is smaller than oldnumber
          // e.g. change from number 7 to 3, iterate through messages and find the messages that go from 3 to max
          // 7, numbers below 3 or higher than 7 should not be sorted new, it is not necessary
          // but the numbers in between 3 to 7 should be sorted new and get new numbers
          // if 7 will be 3, than original 3 should become 4 and so on until message number 6 will become 7
          if (oldMessageNumber > newMessageNumber) {
            if (
              msg.messageNumber >= newMessageNumber &&
              msg.messageNumber < oldMessageNumber
            ) {
              return { ...msg, messageNumber: msg.messageNumber + 1 };
            }
          }

          if (oldMessageNumber < newMessageNumber) {
            if (
              msg.messageNumber <= newMessageNumber &&
              msg.messageNumber > oldMessageNumber
            ) {
              return { ...msg, messageNumber: msg.messageNumber - 1 };
            }
          }
          return msg;
        })
        .map((msg) =>
          msg.messageId === messageId
            ? { ...msg, messageNumber: newMessageNumber }
            : msg
        )
        // in database they are not sorted by messagenumber, so they have to be sorted before providing
        .sort((a, b) => a.messageNumber - b.messageNumber);

      dispatch(setMessages(sorted));
      await dispatch(saveAllMessages(sorted));
    } else {
      dispatch(setMessages(updatedMessages));
      await dispatch(
        saveSingleMessage({
          messageId,
          messageNumber: oldMessageNumber,
          respId: responseId,
          actor: newActor,
          messageText: updatedText,
        })
      );
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.selectedmessages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.selectedmessages.push(action.payload);
    },
    updateMessage(
      state,
      action: PayloadAction<{ messageId: number; changes: Partial<Message> }>
    ) {
      const idx = state.selectedmessages.findIndex(
        (m) => m.messageId === action.payload.messageId
      );
      if (idx !== -1)
        state.selectedmessages[idx] = {
          ...state.selectedmessages[idx],
          ...action.payload.changes,
        };
    },
    removeMessage(state, action: PayloadAction<number>) {
      state.selectedmessages = state.selectedmessages.filter(
        (m) => m.messageId !== action.payload
      );
    },
    reorderMessages(state, action: PayloadAction<Message[]>) {
      state.selectedmessages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedmessages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Fehler beim Laden';
      })
      .addCase(saveSingleMessage.fulfilled, (state, action) => {
        const { messageId, ...changes } = action.payload;
        const idx = state.selectedmessages.findIndex(
          (m) => m.messageId === messageId
        );
        if (idx !== -1)
          state.selectedmessages[idx] = {
            ...state.selectedmessages[idx],
            ...changes,
          };
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.selectedmessages.push(action.payload);
      })
      .addCase(deleteMessageThunk.fulfilled, (s, a) => {
        s.selectedmessages = s.selectedmessages.filter(
          (m) => m.messageId !== a.payload
        );
      })
      .addCase(saveAllMessages.fulfilled, (s, a) => {
        s.selectedmessages = a.payload;
      })
      .addCase(patchMessage.fulfilled, (state, action) => {
        const idx = state.selectedmessages.findIndex(
          (m) => m.messageId === action.payload.messageId
        );
        if (idx !== -1) {
          state.selectedmessages[idx] = {
            ...state.selectedmessages[idx],
            ...action.payload,
          };
        }
      })
      .addCase(putMessage.fulfilled, (state, action) => {
        const idx = state.selectedmessages.findIndex(
          (m) => m.messageId === action.payload.messageId
        );
        if (idx !== -1) {
          state.selectedmessages[idx] = action.payload;
        }
      });
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  reorderMessages,
} = messagesSlice.actions;
export default messagesSlice.reducer;
