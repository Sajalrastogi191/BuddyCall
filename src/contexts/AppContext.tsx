import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  MediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCPeerConnection,
  mediaDevices,
} from 'react-native-webrtc';
import { API_URL, WS_BASE } from '../../config';
import { Message, Screen, User } from '../types';

type ActiveTab = 'people' | 'friends';

interface AppContextValue {
  myId: string;
  myName: string;
  connected: boolean;
  screen: Screen;
  activeTab: ActiveTab;
  isRegistering: boolean;
  authLoading: boolean;
  loginUsername: string;
  loginPassword: string;
  regName: string;
  regId: string;
  regUsername: string;
  regPassword: string;
  token: string;
  onlineUsers: User[];
  friends: { [id: string]: User };
  sentRequests: Set<string>;
  pendingRequests: { [id: string]: User };
  chats: { [id: string]: Message[] };
  activeChatId: string | null;
  chatInput: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  calling: boolean;
  callTarget: User | null;
  setMyId: React.Dispatch<React.SetStateAction<string>>;
  setMyName: React.Dispatch<React.SetStateAction<string>>;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  setIsRegistering: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoginUsername: React.Dispatch<React.SetStateAction<string>>;
  setLoginPassword: React.Dispatch<React.SetStateAction<string>>;
  setRegName: React.Dispatch<React.SetStateAction<string>>;
  setRegId: React.Dispatch<React.SetStateAction<string>>;
  setRegUsername: React.Dispatch<React.SetStateAction<string>>;
  setRegPassword: React.Dispatch<React.SetStateAction<string>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setFriends: React.Dispatch<React.SetStateAction<{ [id: string]: User }>>;
  setSentRequests: React.Dispatch<React.SetStateAction<Set<string>>>;
  setPendingRequests: React.Dispatch<React.SetStateAction<{ [id: string]: User }>>;
  setChats: React.Dispatch<React.SetStateAction<{ [id: string]: Message[] }>>;
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  setCalling: React.Dispatch<React.SetStateAction<boolean>>;
  setCallTarget: React.Dispatch<React.SetStateAction<User | null>>;
  handleLogin: () => Promise<void>;
  handleRegister: () => Promise<void>;
  sendFriendRequest: (user: User) => void;
  acceptRequest: (user: User) => void;
  rejectRequest: (user: User) => void;
  openChat: (friendId: string) => void;
  sendChatMessage: () => void;
  startCall: (user: User) => Promise<void>;
  hangup: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myId, setMyId] = useState('');
  const [myName, setMyName] = useState('');
  const [connected, setConnected] = useState(false);
  const [screen, setScreen] = useState<Screen>('setup');
  const [activeTab, setActiveTab] = useState<ActiveTab>('people');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [token, setToken] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<{ [id: string]: User }>({});
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [pendingRequests, setPendingRequests] = useState<{ [id: string]: User }>({});
  const [chats, setChats] = useState<{ [id: string]: Message[] }>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [calling, setCalling] = useState(false);
  const [callTarget, setCallTarget] = useState<User | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const myIdRef = useRef('');
  const myNameRef = useRef('');
  const friendsRef = useRef<{ [id: string]: User }>({});
  const handleIncomingRef = useRef<(msg: any) => void>(() => {});

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  useEffect(() => {
    myNameRef.current = myName;
  }, [myName]);

  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

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

  const connect = (userToken: string) => {
    const url = `${WS_BASE}/${userToken}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      setScreen('people');
    };

    ws.current.onmessage = (e: any) => {
      try {
        const msg = JSON.parse(e.data);
        handleIncomingRef.current(msg);
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
      if (screen !== 'setup') {
        setScreen('setup');
      }
    };
  };

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

  const handleIncoming = (msg: any) => {
    switch (msg.type) {
      case 'online_users': {
        const others: User[] = (msg.users as User[]).filter(u => u.id !== myIdRef.current);
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
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    });

    peerConn.addEventListener('connectionstatechange', () => {
      if (peerConn.connectionState === 'failed') {
        hangup();
      }
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
    if (screen === 'call') {
      setScreen('friends');
    }
  };

  return (
    <AppContext.Provider
      value={{
        myId,
        myName,
        connected,
        screen,
        activeTab,
        isRegistering,
        authLoading,
        loginUsername,
        loginPassword,
        regName,
        regId,
        regUsername,
        regPassword,
        token,
        onlineUsers,
        friends,
        sentRequests,
        pendingRequests,
        chats,
        activeChatId,
        chatInput,
        localStream,
        remoteStream,
        calling,
        callTarget,
        setMyId,
        setMyName,
        setConnected,
        setScreen,
        setActiveTab,
        setIsRegistering,
        setAuthLoading,
        setLoginUsername,
        setLoginPassword,
        setRegName,
        setRegId,
        setRegUsername,
        setRegPassword,
        setToken,
        setOnlineUsers,
        setFriends,
        setSentRequests,
        setPendingRequests,
        setChats,
        setActiveChatId,
        setChatInput,
        setLocalStream,
        setRemoteStream,
        setCalling,
        setCallTarget,
        handleLogin,
        handleRegister,
        sendFriendRequest,
        acceptRequest,
        rejectRequest,
        openChat,
        sendChatMessage,
        startCall,
        hangup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppProvider;
