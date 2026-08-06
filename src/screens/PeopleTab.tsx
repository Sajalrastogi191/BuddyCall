import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../components/Avatar';
import { useAppContext } from '../contexts/AppContext';

const PeopleTab = () => {
  const { onlineUsers, friends, pendingRequests, sentRequests, sendFriendRequest, acceptRequest, rejectRequest } = useAppContext();

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
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnIcon}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#F43F5E' }]}
                  onPress={() => rejectRequest(user)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Users <Text style={styles.countBadge}>({usersExcludingFriends.length})</Text></Text>
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
                  activeOpacity={0.7}
                >
                  <Text style={[styles.addBtnText, sent && styles.addBtnTextSent]}>{sent ? 'Sent' : 'Add Friend'}</Text>
                </TouchableOpacity>
              </View>
            );
          })
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
  requestActions: { flexDirection: 'row' },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: { fontSize: 18, color: '#FFFFFF' },
  addBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtnSent: { backgroundColor: '#F1F5F9' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  addBtnTextSent: { color: '#94A3B8' },
});

export default PeopleTab;
