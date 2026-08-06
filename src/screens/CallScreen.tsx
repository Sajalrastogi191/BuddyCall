import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import Avatar from '../components/Avatar';
import { useAppContext } from '../contexts/AppContext';

const CallScreen = () => {
  const { localStream, remoteStream, callTarget, hangup } = useAppContext();

  return (
    <View style={styles.callContainer}>
      <StatusBar barStyle="light-content" />

      {remoteStream ? (
        <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
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
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
        </View>
      )}

      <View style={styles.callControls}>
        <TouchableOpacity style={styles.hangupBtn} onPress={hangup} activeOpacity={0.8}>
          <Text style={styles.hangupBtnIcon}>☎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  callContainer: { flex: 1, backgroundColor: '#0B0F19' },
  remoteVideo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
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
    backgroundColor: '#6366F1',
  },
  callingName: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  callingStatus: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  callControls: {
    position: 'absolute',
    bottom: 50,
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

export default CallScreen;
