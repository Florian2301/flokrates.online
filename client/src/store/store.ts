import aboutsReducer from './aboutSlice';
import authReducer from './authSlice';
import chatsReducer from './chatsSclice';
import commentsReducer from './commentsSlice';
import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import messagesReducer from './messagesSlice';
import networksReducer from './networksSclice';

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    chats: chatsReducer,
    comments: commentsReducer,
    networks: networksReducer,
    about: aboutsReducer,
    language: languageReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
