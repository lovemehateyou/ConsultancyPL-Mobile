import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { fetchChatThread, sendChatMessage, type ChatMessage } from '@/services/chat';
import { fetchProfile } from '@/services/profile';

type UiMessage = ChatMessage & {
  pending?: boolean;
  failed?: boolean;
};

const MAX_MESSAGE_CHARS = 2000;

const buildLocalMessage = (message: string): UiMessage => ({
  id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  threadId: 'local',
  sender: 'user',
  message,
  createdAt: new Date().toISOString(),
  pending: true,
});

const buildAiMessage = (message: string, threadId: string): UiMessage => ({
  id: `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  threadId,
  sender: 'ai',
  message,
  createdAt: new Date().toISOString(),
});

export default function ChatScreen() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const listRef = useRef<FlatList<UiMessage>>(null);

  const trimmedInput = input.trim();
  const isOverLimit = trimmedInput.length > MAX_MESSAGE_CHARS;
  const isEmpty = trimmedInput.length === 0;
  const canSend = !isLoading && !isSending && !isOverLimit && !isEmpty && role === 'user';
  const accessDenied = role !== null && role !== 'user';

  useEffect(() => {
    let isActive = true;

    const loadChat = async () => {
      setIsLoading(true);
      setLoadError(null);
      setSendError(null);

      try {
        const profile = await fetchProfile();
        if (!isActive) return;
        setRole(profile.role ?? null);

        if (profile.role !== 'user') {
          setMessages([]);
          return;
        }

        const thread = await fetchChatThread();
        if (!isActive) return;

        setMessages(thread.messages ?? []);
      } catch (err) {
        if (!isActive) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load chat.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadChat();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!messages.length) return;
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length, isSending]);

  const handleSend = async () => {
    if (!canSend) {
      if (isEmpty) {
        setSendError('Message cannot be empty.');
      } else if (isOverLimit) {
        setSendError('Message must be 2000 characters or fewer.');
      }
      return;
    }

    const optimisticMessage = buildLocalMessage(trimmedInput);
    const optimisticId = optimisticMessage.id;

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendChatMessage(trimmedInput);
      setMessages((prev) => {
        const nextMessages = prev.map((item) =>
          item.id === optimisticId ? { ...item, pending: false } : item,
        );
        return [...nextMessages, buildAiMessage(response.reply, response.threadId)];
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === optimisticId ? { ...item, pending: false, failed: true } : item,
        ),
      );
      setSendError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (sendError) {
      setSendError(null);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((prev) => prev + 1);
  };

  const footerTyping = useMemo(() => {
    if (!isSending || accessDenied) return null;
    return (
      <View style={[styles.bubbleRow, styles.aiRow]}>
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={styles.aiText}>AI is typing...</Text>
        </View>
      </View>
    );
  }, [isSending, accessDenied]);

  const renderMessage = ({ item }: { item: UiMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.userRow : styles.aiRow]}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
            item.failed ? styles.failedBubble : null,
          ]}
        >
          <Text style={isUser ? styles.userText : styles.aiText}>{item.message}</Text>
          {item.pending ? <Text style={styles.metaText}>Sending...</Text> : null}
          {item.failed ? <Text style={styles.failedText}>Failed to send</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>MERI AI Assistant</Text>
          <Text style={styles.subheading}>Ask about tasks, bookings, or platform guidance.</Text>
        </View>

        <View style={styles.chatBody}>
          {isLoading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={MERI_COLORS.accent} />
              <Text style={styles.stateText}>Loading chat...</Text>
            </View>
          ) : accessDenied ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>Chat is available for user accounts only.</Text>
            </View>
          ) : loadError ? (
            <View style={styles.stateCard}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable style={styles.retryButton} onPress={handleReload}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={messages.length ? styles.chatList : styles.emptyList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Start a conversation</Text>
                  <Text style={styles.emptyText}>Ask MERI AI anything about your business journey.</Text>
                </View>
              }
              ListFooterComponent={footerTyping}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, isOverLimit ? styles.inputError : null]}
              placeholder="Type your message..."
              placeholderTextColor={MERI_COLORS.mutedText}
              value={input}
              onChangeText={handleInputChange}
              editable={!accessDenied && !isLoading}
              multiline
            />
            <Pressable
              style={[styles.sendButton, !canSend ? styles.sendButtonDisabled : null]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Ionicons name="send" color={canSend ? '#FFFFFF' : MERI_COLORS.mutedText} size={18} />
            </Pressable>
          </View>
          <View style={styles.helperRow}>
            <Text style={[styles.charCount, isOverLimit ? styles.charCountError : null]}>
              {trimmedInput.length}/{MAX_MESSAGE_CHARS}
            </Text>
            {sendError ? <Text style={styles.errorText}>{sendError}</Text> : null}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  heading: {
    color: MERI_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    color: MERI_COLORS.mutedText,
    fontSize: 13,
  },
  chatBody: {
    flex: 1,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: MERI_COLORS.card,
  },
  chatList: {
    paddingBottom: 8,
    gap: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
  },
  userBubble: {
    backgroundColor: MERI_COLORS.accent,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#EEF2FF',
    borderTopLeftRadius: 4,
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: MERI_COLORS.danger,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  aiText: {
    color: MERI_COLORS.text,
    fontSize: 14,
  },
  metaText: {
    color: '#D1D5F6',
    fontSize: 11,
  },
  failedText: {
    color: MERI_COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  stateCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  stateText: {
    color: MERI_COLORS.mutedText,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  emptyTitle: {
    color: MERI_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: MERI_COLORS.mutedText,
    textAlign: 'center',
    fontSize: 13,
  },
  inputContainer: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: MERI_COLORS.text,
    backgroundColor: MERI_COLORS.background,
  },
  inputError: {
    borderColor: MERI_COLORS.danger,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MERI_COLORS.accent,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  charCount: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  charCountError: {
    color: MERI_COLORS.danger,
  },
  errorText: {
    color: MERI_COLORS.danger,
    fontSize: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
});
