import { apiRequest } from './api';

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: 'user' | 'ai';
  message: string;
  createdAt?: string;
};

type ChatThreadResponse = {
  data: {
    threadId: string;
    messages: ChatMessage[];
  };
};

type ChatSendResponse = {
  data: {
    threadId: string;
    reply: string;
  };
};

export const fetchChatThread = async () => {
  const response = await apiRequest<ChatThreadResponse>('/chat/thread');
  return response.data;
};

export const sendChatMessage = async (message: string) => {
  const response = await apiRequest<ChatSendResponse>('/chat/messages', {
    method: 'POST',
    body: { message },
  });
  return response.data;
};
