import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
        <Svg width={92} height={84} viewBox="0 0 89 81">
          <Path
            fill="#38c800"
            d="M37.73 47.42l-9.4-9.6 5.6-5.51 3.89 4 7.87-8 5.5 5.59z"
          />
          <Path
            fill="#0082f5"
            d="M78.87 27.91 54.53 53.62l-.21.2a24.2 24.2 0 1 1 4.51-27.31l9.29-9.35a36.93 36.93 0 1 0-11.42 51 37.36 37.36 0 0 0 5.67-4.42 2.38 2.38 0 0 0 .45-.39L88.18 36.39z"
          />
        </Svg>
      </View>
      <Text style={styles.brand}>rightCare</Text>
      <Text style={styles.tagline}>Prendre soin, simplement.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: '#102b49',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoWrap: { alignItems: 'center', height: 102, justifyContent: 'center', width: 112 },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 12 },
  tagline: { color: '#cbe5f9', fontSize: 14, marginTop: 8 },
});
