import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../components/Avatar';
import { useAppContext } from '../contexts/AppContext';

const FriendsTab = () => {
  const { friends, openChat, startCall } = useAppContext();
  const friendList = Object.values(friends);

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Friends <Text style={styles.countBadge}>({friendList.length})</Text></Text>
        {friendList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}><Text style={styles.emptyIcon}>👋</Text></View>
            <Text style={styles.emptyText}>It&apos;s quiet here</Text>
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
                  style={[styles.actionBtn, { backgroundColor: '#6366F115', marginRight: 8 }]}
                  onPress={() => openChat(user.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionBtnIcon, { color: '#6366F1' }]}>💬</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#0EA5E915' }]}
                  onPress={() => startCall(user)}
                  activeOpacity={0.7}
                >
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

const styles = StyleSheet.create({
  tabContent: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
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
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  userId: { fontSize: 13, color: '#64748B' },
  friendActions: { flexDirection: 'row' },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: { fontSize: 18, color: '#FFFFFF' },
});

export default FriendsTab;
