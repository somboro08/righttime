import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { XpLogo } from '@/components/xp-logo';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <View style={styles.logoWrap}>
        <View style={styles.xpMark}><XpLogo size={78} /></View>
      </View>
      <Text style={styles.brand}>RightCom XP</Text>
      <Text style={styles.tagline}>L'expérience RightCom, simplement.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: '#0877ED',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoWrap: { alignItems: 'center', height: 112, justifyContent: 'center', width: 112 },
  xpMark: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 56, height: 112, justifyContent: 'center', width: 112 },

  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 12 },
  tagline: { color: '#D5E9FF', fontSize: 14, marginTop: 8 },
});
