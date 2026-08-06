import React from 'react';
import { View } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import AuthScreen from '../screens/AuthScreen';
import MainTabsScreen from '../screens/MainTabsScreen';
import CallScreen from '../screens/CallScreen';

const AppNavigator = () => {
  const { connected, screen } = useAppContext();

  if (!connected) {
    return <AuthScreen />;
  }

  if (screen === 'call') {
    return <CallScreen />;
  }

  return <MainTabsScreen />;
};

export default AppNavigator;
