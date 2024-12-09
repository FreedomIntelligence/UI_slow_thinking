import { createStore } from "zustand/vanilla";

type Conversation = {
  id: string;
  name: string;

};

export type ConversionStore = {
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
};

export const conversationStore = createStore<ConversionStore>((set) => ({
  conversations: [],
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),
}));
