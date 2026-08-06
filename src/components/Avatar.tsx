import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name?: string;
  size?: number;
  style?: object;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 46, style }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
    <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
      {(name || '?')[0].toUpperCase()}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#6366F1', fontWeight: '800' },
});

export default Avatar;
