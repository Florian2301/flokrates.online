import chatsReducer from './chatsSclice';
import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    chats: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
