import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';

const AuthScreen = () => {
  const {
    isRegistering,
    setIsRegistering,
    authLoading,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    regName,
    setRegName,
    regId,
    setRegId,
    regUsername,
    setRegUsername,
    regPassword,
    setRegPassword,
    handleLogin,
    handleRegister,
  } = useAppContext();

  return (
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
          <Text style={styles.logoText}>BuddyCall</Text>
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
                selectionColor="#6366F1"
              />
              <TextInput
                style={styles.input}
                placeholder="Unique ID (e.g. alice123)"
                placeholderTextColor="#64748B"
                value={regId}
                onChangeText={setRegId}
                autoCapitalize="none"
                selectionColor="#6366F1"
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#64748B"
                value={regUsername}
                onChangeText={setRegUsername}
                autoCapitalize="none"
                selectionColor="#6366F1"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#64748B"
                value={regPassword}
                onChangeText={setRegPassword}
                selectionColor="#6366F1"
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
                selectionColor="#6366F1"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#64748B"
                value={loginPassword}
                onChangeText={setLoginPassword}
                selectionColor="#6366F1"
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
};

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B0F19',
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
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  switchBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 10 },
  switchBtnText: { color: '#94A3B8', fontSize: 14 },
});

export default AuthScreen;
