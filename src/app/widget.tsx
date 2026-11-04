import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { useRightCare } from '@/lib/rightcare-context';

function originOf(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function widgetHtml(publicKey: string, company: string, sdkUrl: string) {
  const config = JSON.stringify({ publicKey, company, sdkUrl }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>html,body,#righttime-root{height:100%;min-height:100%;width:100%;margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#message{padding:20px;color:#8A91A3;font-size:14px}</style>
</head><body><div id="righttime-root"><div id="message">Chargement du widget RightCom XP…</div></div>
<script>
(function(){
  var config=${config};
  var send=function(type,data){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:type,data:data||null}));};
  var script=document.createElement('script');
  script.src=config.sdkUrl;
  script.onload=function(){
    try{
      if(!window.RightTime)throw new Error('Le service de réservation est indisponible.');
      document.getElementById('righttime-root').innerHTML='';
      window.RightTime.init({publicKey:config.publicKey,company:config.company}).mount('#righttime-root',{
        height:'fill',locale:'fr',title:'RightCom XP',
        onReady:function(){send('ready')},
        onBooked:function(appointment){send('booked',appointment)},
        onError:function(error){send('error',error)}
      });
    }catch(error){
      document.getElementById('righttime-root').innerHTML='<div id="message">Impossible de charger les disponibilités. Réessayez plus tard.</div>';
      send('error',{message:error&&error.message?error.message:String(error)});
    }
  };
  script.onerror=function(){
    document.getElementById('message').textContent='Nos disponibilités sont momentanément inaccessibles.';
    send('error',{message:'SDK CDN inaccessible'});
  };
  document.head.appendChild(script);
})();
</script></body></html>`;
}

export default function SdkWidgetScreen() {
  const { settings, sdkCdnUrl } = useRightCare();
  const [eventMessage, setEventMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const siteOrigin = originOf(settings.hostOrigin.trim());
  const html = useMemo(
    () => widgetHtml(settings.publicKey.trim(), settings.company.trim(), sdkCdnUrl),
    [settings.publicKey, settings.company, sdkCdnUrl],
  );
  const ready = !!settings.publicKey.trim() && !!settings.company.trim() && !!siteOrigin;

  function onMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; data?: { id?: string } };
      if (message.type === 'ready') setEventMessage('Vos disponibilités sont à jour.');
      else if (message.type === 'booked') setEventMessage('Votre demande de rendez-vous a bien été envoyée.');
      else if (message.type === 'error') setEventMessage('Le service de réservation est momentanément indisponible.');
    } catch {
      setEventMessage('Le service de réservation est prêt.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.heading}>
        <View style={styles.kickerPill}><Text style={styles.kicker}>RIGHTCOM XP · RÉSERVATION</Text></View>
        <Text style={styles.title}>Réserver un créneau</Text>
        <Text style={styles.subtitle}>Réservez directement depuis le widget intégré à l’application.</Text>
      </View>
      {!ready ? (
        <View style={styles.messageCard}>
          <View style={styles.messageIcon}><Text style={styles.messageIconText}>+</Text></View>
          <Text style={styles.messageTitle}>Les réservations seront bientôt disponibles</Text>
          <Text style={styles.messageText}>Notre équipe prépare vos disponibilités. Revenez nous voir très bientôt.</Text>
        </View>
      ) : (
        <View style={styles.widgetFrame}>
          {pageLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#0877ED" />
              <Text style={styles.messageText}>Préparation de vos disponibilités…</Text>
            </View>
          ) : null}
          <WebView
            source={{ html, baseUrl: siteOrigin }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            onLoadEnd={() => setPageLoading(false)}
            onMessage={onMessage}
            style={styles.webview}
          />
        </View>
      )}
      {eventMessage ? <Text style={styles.event}>{eventMessage}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', flex: 1, padding: 18, gap: 14 },
  heading: { backgroundColor: '#EAF4FF', borderRadius: 22, gap: 9, padding: 20 },
  kickerPill: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  kicker: { color: '#0877ED', fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  title: { color: '#17192F', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: '#68738A', fontSize: 12, lineHeight: 18 },
  widgetFrame: { backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 18, borderWidth: 1, flex: 1, overflow: 'hidden' },
  webview: { backgroundColor: 'transparent', flex: 1 },
  loading: { alignItems: 'center', backgroundColor: '#fff', gap: 10, justifyContent: 'center', ...StyleSheet.absoluteFill, zIndex: 1 },
  messageCard: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 18, borderWidth: 1, gap: 9, padding: 22 },
  messageIcon: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 20, height: 50, justifyContent: 'center', width: 50 },
  messageIconText: { color: '#0877ED', fontSize: 36, fontWeight: '300' },
  messageTitle: { color: '#17192F', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  messageText: { color: '#8A91A3', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  event: { color: '#0877ED', fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
