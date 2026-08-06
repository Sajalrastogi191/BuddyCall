import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../contexts/AppContext';

const TabBar = () => {
  const { activeTab, setActiveTab, setScreen, pendingRequests } = useAppContext();
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
          }}
        >
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
          }}
        >
          <View style={[styles.tabIconWrapper, activeTab === 'friends' && styles.tabIconWrapperActive]}>
            <Text style={[styles.tabIcon, activeTab === 'friends' && styles.tabIconActive]}>👥</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'friends' && styles.tabLabelActive]}>Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#EEF2FF',
  },
  tabIcon: { fontSize: 20, opacity: 0.6 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabLabelActive: { color: '#6366F1', fontWeight: '700' },
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
});

export default TabBar;
