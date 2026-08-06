import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import TabBar from '../components/TabBar';
import PeopleTab from './PeopleTab';
import FriendsTab from './FriendsTab';
import ChatScreen from './ChatScreen';

const MainTabsScreen = () => {
  const { screen, activeTab, myName, myId, setScreen, setActiveTab } = useAppContext();

  if (screen === 'chat') {
    return <ChatScreen />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerLogo}>⚡</Text>
          <Text style={styles.headerTitle}>BuddyCall</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerSub}>{myName || myId}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'people' ? <PeopleTab /> : <FriendsTab />}
      </View>

      <TabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
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
});

export default MainTabsScreen;
