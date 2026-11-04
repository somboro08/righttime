import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

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
        <Image
          accessibilityLabel="RightTime"
          resizeMode="cover"
          source={require('../../assets/imgi_7_righttime-256x256.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.tagline}>La réservation, en toute simplicité.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoWrap: { alignItems: 'center', height: 76, justifyContent: 'center', width: 250 },
  logo: { height: 76, width: 250 },
  tagline: { color: '#737B8E', fontSize: 14, marginTop: 8 },
});
