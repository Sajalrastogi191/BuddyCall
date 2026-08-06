import 'react-native-get-random-values';
import React from 'react';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => (
  <AppProvider>
    <AppNavigator />
  </AppProvider>
);

export default App;
