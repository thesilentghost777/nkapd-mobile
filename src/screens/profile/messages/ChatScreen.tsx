import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

interface Message {
  id: number;
  conversation_id: number;
  expediteur_id: number;
  contenu: string;
  lu: boolean;
  created_at: string;
}

export const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { conversationId, userId, participant: routeParticipant } = route.params || {};
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const { user } = useAuthStore();
  const {
    currentMessages,
    currentConversation,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage,
    startNewConversation,
    markAsRead,
    clearMessages,
  } = useMessageStore();

  const participant = currentConversation?.participant || routeParticipant;

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
    return () => clearMessages();
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const trimmedMessage = message.trim();
    setMessage('');

    if (conversationId) {
      await sendMessage(conversationId, trimmedMessage);
    } else if (userId) {
      const newConvId = await startNewConversation(userId, trimmedMessage);
      if (newConvId) {
        navigation.setParams({ conversationId: newConvId, userId: undefined });
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.expediteur_id === user?.id;
    const showDate =
      index === 0 ||
      formatDate(currentMessages[index - 1].created_at) !== formatDate(item.created_at);

    return (
      <>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.contenu}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                {formatTime(item.created_at)}
              </Text>
              {isMe && (
                <Ionicons
                  name={item.lu ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color={item.lu ? COLORS.info : COLORS.white + '80'}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => participant && navigation.navigate('ProfilDetail', { profil: participant })}
        >
          <View style={styles.headerAvatar}>
            {participant?.avatar ? (
              <Image source={{ uri: participant.avatar }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[COLORS.secondary, COLORS.secondaryLight]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitial}>
                  {participant?.prenom?.charAt(0) || '?'}
                </Text>
              </LinearGradient>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>
              {participant ? `${participant.prenom} ${participant.nom}` : 'Nouvelle conversation'}
            </Text>
            <Text style={styles.headerStatus}>En ligne</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading && currentMessages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.gray300} />
                <Text style={styles.emptyText}>Commencez la conversation</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={24} color={COLORS.gray500} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.gray400}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  headerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerStatus: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white + 'AA',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  messageRow: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    lineHeight: 22,
  },
  messageTextMe: {
    color: COLORS.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  timeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
  timeTextMe: {
    color: COLORS.white + '80',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 3,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray400,
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: SPACING.sm,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    maxHeight: 100,
    color: COLORS.black,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
});
