import aboutsReducer from './aboutSlice';
import chatsReducer from './chatsSclice';
import commentsReducer from './commentsSlice';
import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';
import networksReducer from './networksSclice';

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    chats: chatsReducer,
    comments: commentsReducer,
    networks: networksReducer,
    about: aboutsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
