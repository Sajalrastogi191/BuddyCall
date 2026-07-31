import 'react-native-get-random-values';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  PermissionsAndroid,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

import { API_URL, WS_BASE } from './config';

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: number;
  mine: boolean;
}

type Screen = 'setup' | 'people' | 'friends' | 'chat' | 'call';

// ─── APP ───────────────────────────────────────────────────────────────────────
const App = () => {
  // ── Identity ──────────────────────────────────────────────────────────────
  const [myId, setMyId] = useState('');
  const [myName, setMyName] = useState('');
  const [connected, setConnected] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('setup');
  const [activeTab, setActiveTab] = useState<'people' | 'friends'>('people');

  // Auth state
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // App data state
  const [token, setToken] = useState('');

  // ── Social State ──────────────────────────────────────────────────────────
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<{ [id: string]: User }>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [pendingRequests, setPendingRequests] = useState<{ [id: string]: User }>(
    {},
  );
  const [chats, setChats] = useState<{ [id: string]: Message[] }>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // ── WebRTC ────────────────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [calling, setCalling] = useState(false);
  const [callTarget, setCallTarget] = useState<User | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const myIdRef = useRef('');
  const myNameRef = useRef('');
  const friendsRef = useRef<{ [id: string]: User }>({});
  const handleIncomingRef = useRef<Function | null>(null);

  // Keep refs in sync so closures always have latest values
  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);
  useEffect(() => {
    myNameRef.current = myName;
  }, [myName]);
  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  // ── Permissions & cleanup ─────────────────────────────────────────────────
  useEffect(() => {
    requestPermissions();
    return () => {
      hangup();
      ws.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          startLocalStream();
        } else {
          Alert.alert('Permissions required', 'Camera & microphone needed.');
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    } else {
      startLocalStream();
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480, frameRate: 30, facingMode: 'user' },
      });
      setLocalStream(stream);
    } catch (err) {
      console.error('Failed to get local stream', err);
    }
  };

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connect = (userToken: string) => {
    const url = `${WS_BASE}/${userToken}`;
    console.log('Connecting to:', url);
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      setScreen('people');
    };

    ws.current.onmessage = (e: any) => {
      try {
        const msg = JSON.parse(e.data);
        if (handleIncomingRef.current) {
          handleIncomingRef.current(msg);
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.current.onerror = () => {
      Alert.alert('Connection Error', 'Could not reach server. Check IP.');
      setConnected(false);
    };

    ws.current.onclose = (e: any) => {
      console.log('WS Disconnected', e.code, e.reason);
      setConnected(false);
      if (screen !== 'setup') setScreen('setup');
    };
  };

  // ── Auth Actions ─────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) return;
    setAuthLoading(true);
    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setToken(data.access_token);
        setMyId(data.user_id);
        setMyName(loginUsername.toUpperCase());
        connect(data.access_token);
      } else {
        Alert.alert('Login Failed', data.detail || 'check your credentials');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regName || !regId) {
      Alert.alert('Missing Fields', 'Please fill all registration fields');
      return;
    }
    setAuthLoading(true);
    try {
      const resp = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: regId,
          username: regUsername,
          name: regName,
          password: regPassword,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        Alert.alert('Success', 'Profile created! Now login.');
        setIsRegistering(false);
      } else {
        Alert.alert('Failed', data.detail || 'try another username/ID');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const send = (msg: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ ...msg, from: myIdRef.current, fromName: myNameRef.current }));
    }
  };

  // ── Incoming message router ───────────────────────────────────────────────
  const handleIncoming = (msg: any) => {
      switch (msg.type) {
        case 'online_users': {
          const others: User[] = (msg.users as User[]).filter(
            u => u.id !== myIdRef.current,
          );
          setOnlineUsers(others);
          break;
        }
        case 'friend_request': {
          setPendingRequests(prev => ({
            ...prev,
            [msg.from]: { id: msg.from, name: msg.fromName },
          }));
          break;
        }
        case 'friend_accept': {
          const newFriend: User = { id: msg.from, name: msg.fromName };
          setFriends(prev => ({ ...prev, [msg.from]: newFriend }));
          setSentRequests(prev => {
            const next = new Set(prev);
            next.delete(msg.from);
            return next;
          });
          break;
        }
        case 'friend_reject': {
          setSentRequests(prev => {
            const next = new Set(prev);
            next.delete(msg.from);
            return next;
          });
          Alert.alert('Friend Request', `${msg.fromName} declined your request.`);
          break;
        }
        case 'chat': {
          const chatMsg: Message = {
            id: `${Date.now()}-${msg.from}`,
            from: msg.from,
            fromName: msg.fromName,
            text: msg.text,
            timestamp: msg.timestamp,
            mine: false,
          };
          setChats(prev => ({
            ...prev,
            [msg.from]: [...(prev[msg.from] || []), chatMsg],
          }));
          break;
        }
        case 'offer':
          handleOffer(msg);
          break;
        case 'answer':
          handleAnswer(msg);
          break;
        case 'candidate':
          handleCandidate(msg);
          break;
      }
  };

  useEffect(() => {
    handleIncomingRef.current = handleIncoming;
  }, [handleIncoming]);

  // ── Friend actions ────────────────────────────────────────────────────────
  const sendFriendRequest = (user: User) => {
    send({ type: 'friend_request', target: user.id });
    setSentRequests(prev => new Set(prev).add(user.id));
  };

  const acceptRequest = (user: User) => {
    send({ type: 'friend_accept', target: user.id });
    setFriends(prev => ({ ...prev, [user.id]: user }));
    setPendingRequests(prev => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });
  };

  const rejectRequest = (user: User) => {
    send({ type: 'friend_reject', target: user.id });
    setPendingRequests(prev => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });
  };

  // ── Chat actions ──────────────────────────────────────────────────────────
  const openChat = (friendId: string) => {
    setActiveChatId(friendId);
    setScreen('chat');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !activeChatId) return;
    const msg: Message = {
      id: `${Date.now()}-me`,
      from: myIdRef.current,
      fromName: myNameRef.current,
      text: chatInput.trim(),
      timestamp: Date.now(),
      mine: true,
    };
    send({ type: 'chat', target: activeChatId, text: chatInput.trim(), timestamp: Date.now() });
    setChats(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), msg],
    }));
    setChatInput('');
  };

  // ── WebRTC call ───────────────────────────────────────────────────────────
  const setupPeerConnection = (targetId: string) => {
    const peerConn = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pc.current = peerConn;

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        peerConn.addTrack(track, localStream as any);
      });
    }

    peerConn.addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        send({ type: 'candidate', candidate: event.candidate, target: targetId });
      }
    });

    peerConn.addEventListener('track', (event: any) => {
      if (event.streams?.[0]) setRemoteStream(event.streams[0]);
    });

    peerConn.addEventListener('connectionstatechange', () => {
      if (peerConn.connectionState === 'failed') hangup();
    });
  };

  const startCall = async (user: User) => {
    setCallTarget(user);
    setCalling(true);
    setScreen('call');
    setupPeerConnection(user.id);
    try {
      const offer = await pc.current?.createOffer();
      await pc.current?.setLocalDescription(offer);
      send({ type: 'offer', offer, target: user.id });
    } catch (err) {
      console.error('Offer error', err);
      hangup();
    }
  };

  const handleOffer = async (msg: any) => {
    const caller: User = { id: msg.from, name: msg.fromName };
    setCallTarget(caller);
    setCalling(true);
    setScreen('call');
    setupPeerConnection(msg.from);
    try {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(msg.offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      send({ type: 'answer', answer, target: msg.from });
    } catch (err) {
      console.error('Answer error', err);
    }
  };

  const handleAnswer = async (msg: any) => {
    try {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(msg.answer));
    } catch (err) {
      console.error('Set remote desc error', err);
    }
  };

  const handleCandidate = async (msg: any) => {
    try {
      if (pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    } catch (err) {
      console.error('Ice candidate error', err);
    }
  };

  const hangup = () => {
    pc.current?.close();
    pc.current = null;
    setRemoteStream(null);
    setCalling(false);
    setCallTarget(null);
    if (screen === 'call') setScreen('friends');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI COMPONENTS & RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const Avatar = ({ name, size = 46, style }: any) => (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );

  // ── Setup Screen ──────────────────────────────────────────────────────────
  const renderSetup = () => (
    <KeyboardAvoidingView
      style={styles.setupContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.setupCard}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconBg}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.logoText}>Connecta</Text>
          <Text style={styles.logoSub}>Experience seamless connection.</Text>
        </View>

        <View style={styles.formContainer}>
          {isRegistering ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="#64748B"
                value={regName}
                onChangeText={setRegName}
                selectionColor={PRIMARY}
              />
              <TextInput
                style={styles.input}
                placeholder="Unique ID (e.g. alice123)"
                placeholderTextColor="#64748B"
                value={regId}
                onChangeText={setRegId}
                autoCapitalize="none"
                selectionColor={PRIMARY}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#64748B"
                value={regUsername}
                onChangeText={setRegUsername}
                autoCapitalize="none"
                selectionColor={PRIMARY}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#64748B"
                value={regPassword}
                onChangeText={setRegPassword}
                selectionColor={PRIMARY}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, authLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={authLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{authLoading ? 'Creating Account...' : 'Sign Up'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsRegistering(false)} style={styles.switchBtn} activeOpacity={0.6}>
                <Text style={styles.switchBtnText}>Already have an account? <Text style={{ fontWeight: '700' }}>Log In</Text></Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#64748B"
                value={loginUsername}
                onChangeText={setLoginUsername}
                autoCapitalize="none"
                selectionColor={PRIMARY}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#64748B"
                value={loginPassword}
                onChangeText={setLoginPassword}
                selectionColor={PRIMARY}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, authLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={authLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{authLoading ? 'Logging in...' : 'Log In'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsRegistering(true)} style={styles.switchBtn} activeOpacity={0.6}>
                <Text style={styles.switchBtnText}>New here? <Text style={{ fontWeight: '700' }}>Create an account</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  // ── People Tab ────────────────────────────────────────────────────────────
  const renderPeople = () => {
    const pending = Object.values(pendingRequests);
    const usersExcludingFriends = onlineUsers.filter(u => !friends[u.id]);

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollContent}>
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friend Requests</Text>
            {pending.map(user => (
              <View key={user.id} style={styles.userCard}>
                <Avatar name={user.name} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userId}>@{user.id}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981', marginRight: 8 }]}
                    onPress={() => acceptRequest(user)}
                    activeOpacity={0.7}>
                    <Text style={styles.actionBtnIcon}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#F43F5E' }]}
                    onPress={() => rejectRequest(user)}
                    activeOpacity={0.7}>
                    <Text style={styles.actionBtnIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Online Users <Text style={styles.countBadge}>({usersExcludingFriends.length})</Text>
          </Text>
          {usersExcludingFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}><Text style={styles.emptyIcon}>📡</Text></View>
              <Text style={styles.emptyText}>No one else is online</Text>
              <Text style={styles.emptyHint}>Wait for others to join the network.</Text>
            </View>
          ) : (
            usersExcludingFriends.map(user => {
              const sent = sentRequests.has(user.id);
              return (
                <View key={user.id} style={styles.userCard}>
                  <Avatar name={user.name} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userId}>@{user.id}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, sent && styles.addBtnSent]}
                    onPress={() => !sent && sendFriendRequest(user)}
                    disabled={sent}
                    activeOpacity={0.7}>
                    <Text style={[styles.addBtnText, sent && styles.addBtnTextSent]}>
                      {sent ? 'Sent' : 'Add Friend'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  // ── Friends Tab ───────────────────────────────────────────────────────────
  const renderFriends = () => {
    const friendList = Object.values(friends);
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Friends <Text style={styles.countBadge}>({friendList.length})</Text>
          </Text>
          {friendList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}><Text style={styles.emptyIcon}>👋</Text></View>
              <Text style={styles.emptyText}>It's quiet here</Text>
              <Text style={styles.emptyHint}>Head over to the People tab to make friends.</Text>
            </View>
          ) : (
            friendList.map(user => (
              <View key={user.id} style={styles.userCard}>
                <Avatar name={user.name} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userId}>@{user.id}</Text>
                </View>
                <View style={styles.friendActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${PRIMARY}15`, marginRight: 8 }]}
                    onPress={() => openChat(user.id)}
                    activeOpacity={0.7}>
                    <Text style={[styles.actionBtnIcon, { color: PRIMARY }]}>💬</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#0EA5E915' }]}
                    onPress={() => startCall(user)}
                    activeOpacity={0.7}>
                    <Text style={[styles.actionBtnIcon, { color: '#0EA5E9' }]}>📹</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  // ── Chat Screen ───────────────────────────────────────────────────────────
  const renderChat = () => {
    const friendUser = activeChatId ? friends[activeChatId] : null;
    const messages = activeChatId ? (chats[activeChatId] || []) : [];

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => {
              setScreen('friends');
              setActiveTab('friends');
            }}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtnText}>❮</Text>
          </TouchableOpacity>
          <Avatar name={friendUser?.name} size={38} style={{ marginRight: 12 }} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>
              {friendUser?.name || activeChatId}
            </Text>
            <Text style={styles.chatHeaderSub}>Active now</Text>
          </View>
          <TouchableOpacity
            style={styles.chatHeaderCallBtn}
            onPress={() => friendUser && startCall(friendUser)}
            activeOpacity={0.7}>
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
                  isLast && { marginBottom: 10 }
                ]}>
                <View
                  style={[
                    styles.bubble,
                    item.mine ? styles.bubbleMine : styles.bubbleTheirs,
                  ]}>
                  <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
                    {item.text}
                  </Text>
                </View>
                <Text style={styles.bubbleTime}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )
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
              selectionColor={PRIMARY}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !chatInput.trim() && { opacity: 0.5 }]}
              onPress={sendChatMessage}
              disabled={!chatInput.trim()}
              activeOpacity={0.7}>
              <Text style={styles.sendBtnIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  // ── Call Screen ───────────────────────────────────────────────────────────
  const renderCall = () => (
    <View style={styles.callContainer}>
      <StatusBar barStyle="light-content" />

      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.callWaiting}>
          <View style={styles.callingAvatarPulse}>
            <Avatar name={callTarget?.name} size={110} style={styles.callingAvatar} />
          </View>
          <Text style={styles.callingName}>{callTarget?.name}</Text>
          <Text style={styles.callingStatus}>Calling...</Text>
        </View>
      )}

      {localStream && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            zOrder={1}
          />
        </View>
      )}

      <View style={styles.callControls}>
        <TouchableOpacity style={styles.hangupBtn} onPress={hangup} activeOpacity={0.8}>
          <Text style={styles.hangupBtnIcon}>☎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Tab Bar ───────────────────────────────────────────────────────────────
  const renderTabBar = () => {
    const pendingCount = Object.keys(pendingRequests).length;
    return (
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('people');
              setScreen('people');
            }}>
            <View style={[styles.tabIconWrapper, activeTab === 'people' && styles.tabIconWrapperActive]}>
              <Text style={[styles.tabIcon, activeTab === 'people' && styles.tabIconActive]}>🌐</Text>
            </View>
            <Text style={[styles.tabLabel, activeTab === 'people' && styles.tabLabelActive]}>Explore</Text>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('friends');
              setScreen('friends');
            }}>
            <View style={[styles.tabIconWrapper, activeTab === 'friends' && styles.tabIconWrapperActive]}>
              <Text style={[styles.tabIcon, activeTab === 'friends' && styles.tabIconActive]}>👥</Text>
            </View>
            <Text style={[styles.tabLabel, activeTab === 'friends' && styles.tabLabelActive]}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Root Render ───────────────────────────────────────────────────────────
  if (!connected || screen === 'setup') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F19' }}>
        {renderSetup()}
      </View>
    );
  }

  if (screen === 'call') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {renderCall()}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {/* App Header */}
      {screen !== 'chat' && (
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerLogo}>⚡</Text>
            <Text style={styles.headerTitle}>Connecta</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSub}>{myName || myId}</Text>
          </View>
        </View>
      )}

      {/* Screen body */}
      <View style={{ flex: 1 }}>
        {screen === 'chat' ? renderChat() : activeTab === 'people' ? renderPeople() : renderFriends()}
      </View>

      {/* Tab bar (not shown in chat) */}
      {screen !== 'chat' && renderTabBar()}
    </SafeAreaView>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const PRIMARY = '#6366F1';
const PRIMARY_LIGHT = '#EEF2FF';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Setup / Auth
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  setupCard: {
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  logoIcon: { fontSize: 40 },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoSub: { color: '#94A3B8', fontSize: 16, marginTop: 8 },
  formContainer: { gap: 16 },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  switchBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 10 },
  switchBtnText: { color: '#94A3B8', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  headerLogo: { fontSize: 24, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  headerSub: { color: '#334155', fontSize: 13, fontWeight: '600' },

  // Floating Tab Bar
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: '80%',
    maxWidth: 350,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    position: 'relative',
  },
  tabIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tabIconWrapperActive: {
    backgroundColor: PRIMARY_LIGHT,
  },
  tabIcon: { fontSize: 20, opacity: 0.6 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabLabelActive: { color: PRIMARY, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: 4,
    right: '25%',
    backgroundColor: '#F43F5E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Shared Content Lists
  tabContent: { flex: 1 },
  scrollContent: { paddingBottom: 120 }, // Extra padding for floating tab bar
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  countBadge: { color: '#94A3B8', fontWeight: '500' },

  // Empty States
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { color: '#1E293B', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyHint: { color: '#64748B', fontSize: 14, textAlign: 'center' },

  // User Cards
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: PRIMARY, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  userId: { fontSize: 13, color: '#64748B' },

  // List Buttons
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: { fontSize: 18, color: '#FFFFFF' },
  requestActions: { flexDirection: 'row' },
  friendActions: { flexDirection: 'row' },
  addBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtnSent: { backgroundColor: '#F1F5F9' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  addBtnTextSent: { color: '#94A3B8' },

  // Chat Screen
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20, // compensate for safe area
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
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4, // Sharp corner origin
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4, // Sharp corner origin
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
    backgroundColor: PRIMARY,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendBtnIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },

  // Call Screen
  callContainer: { flex: 1, backgroundColor: '#0B0F19' },
  remoteVideo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  localVideoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 120,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  localVideo: { width: '100%', height: '100%' },

  callWaiting: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
  },
  callingAvatarPulse: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  callingAvatar: {
    backgroundColor: PRIMARY,
  },
  callingName: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  callingStatus: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },

  callControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hangupBtn: {
    backgroundColor: '#F43F5E',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  hangupBtnIcon: { color: '#FFFFFF', fontSize: 32, transform: [{ rotate: '135deg' }] },
});

export default App;