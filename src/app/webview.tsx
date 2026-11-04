import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useRightCare } from '@/lib/rightcare-context';

export default function HostedWebViewScreen() {
  const { hostedWidgetUrl } = useRightCare();
  const webView = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  let validUrl = false;
  try {
    validUrl = new URL(hostedWidgetUrl).protocol.startsWith('http');
  } catch {
    validUrl = false;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.heading}>
        <View style={styles.badge}><Text style={styles.badgeText}>RIGHTCARE</Text></View>
        <Text style={styles.title}>Réservation en ligne</Text>
        <Text style={styles.subtitle}>Retrouvez notre espace de réservation directement dans l’application.</Text>
      </View>
      {!validUrl ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Text style={styles.plus}>+</Text></View>
          <Text style={styles.emptyTitle}>Notre espace arrive bientôt</Text>
          <Text style={styles.body}>Les réservations en ligne seront accessibles ici très prochainement.</Text>
        </View>
      ) : failed ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Page momentanément inaccessible</Text>
          <Text style={styles.body}>Vérifiez votre connexion et réessayez.</Text>
          <Pressable onPress={() => { setFailed(false); setLoading(true); webView.current?.reload(); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.frame}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#087f70" />
              <Text style={styles.body}>Ouverture de l’espace de réservation…</Text>
            </View>
          ) : null}
          <WebView
            ref={webView}
            source={{ uri: hostedWidgetUrl }}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setFailed(true); }}
            onHttpError={() => { setLoading(false); setFailed(true); }}
            style={styles.webview}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f7faf9', flex: 1, gap: 14, padding: 18 },
  heading: { backgroundColor: '#e7f4ef', borderRadius: 22, gap: 9, padding: 20 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#d3ebe1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#087f70', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#173d3a', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: '#617b76', fontSize: 12, lineHeight: 18 },
  frame: { backgroundColor: '#fff', borderColor: '#edf2ef', borderRadius: 18, borderWidth: 1, flex: 1, overflow: 'hidden' },
  webview: { backgroundColor: 'transparent', flex: 1 },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', backgroundColor: '#fff', gap: 10, justifyContent: 'center', zIndex: 1 },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#edf2ef', borderRadius: 18, borderWidth: 1, gap: 9, padding: 22 },
  emptyIcon: { alignItems: 'center', backgroundColor: '#e7f4ef', borderRadius: 24, height: 52, justifyContent: 'center', width: 52 },
  plus: { color: '#087f70', fontSize: 36, fontWeight: '300' },
  emptyTitle: { color: '#173d3a', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  body: { color: '#819591', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retryButton: { backgroundColor: '#087f70', borderRadius: 11, marginTop: 5, paddingHorizontal: 18, paddingVertical: 11 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
