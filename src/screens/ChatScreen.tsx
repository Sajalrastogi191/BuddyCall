import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import { useAppContext } from '../contexts/AppContext';

const ChatScreen = () => {
  const {
    friends,
    chats,
    activeChatId,
    chatInput,
    setChatInput,
    setScreen,
    setActiveTab,
    sendChatMessage,
    startCall,
  } = useAppContext();

  const friendUser = activeChatId ? friends[activeChatId] : null;
  const messages = activeChatId ? (chats[activeChatId] || []) : [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => {
            setScreen('friends');
            setActiveTab('friends');
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backBtnText}>❮</Text>
        </TouchableOpacity>
        <Avatar name={friendUser?.name} size={38} style={{ marginRight: 12 }} />
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{friendUser?.name || activeChatId}</Text>
          <Text style={styles.chatHeaderSub}>Active now</Text>
        </View>
        <TouchableOpacity style={styles.chatHeaderCallBtn} onPress={() => friendUser && startCall(friendUser)} activeOpacity={0.7}>
          <Text style={styles.chatHeaderCallIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.chatMessages}
        renderItem={({ item, index }) => {
          const isLast = index === messages.length - 1;
          return (
            <View
              style={[
                styles.bubbleWrapper,
                item.mine ? styles.bubbleWrapperMine : styles.bubbleWrapperTheirs,
                isLast && { marginBottom: 10 },
              ]}
            >
              <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>{item.text}</Text>
              </View>
              <Text style={styles.bubbleTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          );
        }}
      />

      <View style={styles.chatInputContainer}>
        <View style={styles.chatInputWrapper}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendChatMessage}
            returnKeyType="send"
            multiline={false}
            selectionColor="#6366F1"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !chatInput.trim() && { opacity: 0.5 }]}
            onPress={sendChatMessage}
            disabled={!chatInput.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendBtnIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: { marginRight: 16 },
  backBtnText: { fontSize: 20, color: '#64748B', fontWeight: '800' },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  chatHeaderSub: { fontSize: 13, color: '#10B981', fontWeight: '500', marginTop: 2 },
  chatHeaderCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E915',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderCallIcon: { fontSize: 20, color: '#0EA5E9' },
  chatMessages: { padding: 20, paddingBottom: 40 },
  bubbleWrapper: { marginBottom: 16, maxWidth: '80%' },
  bubbleWrapperMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapperTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
  },
  bubbleMine: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 16, lineHeight: 22, color: '#1E293B' },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTime: { fontSize: 11, color: '#94A3B8', marginTop: 6, marginHorizontal: 4 },
  chatInputContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  chatInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendBtnIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});

export default ChatScreen;
