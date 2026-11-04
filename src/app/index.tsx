import type { Service } from '@rightcom/righttime-sdk';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRightCare } from '@/lib/rightcare-context';
import { XpLogo } from '@/components/xp-logo';

interface ListedService {
  service: Service;
  location: string;
}

const serviceColors = ['#EAF4FF', '#DCEBFF', '#EEF5FF', '#E8ECF3'];
const serviceSymbols = ['XP', '01', '02', '03'];

export default function HomeScreen() {
  const router = useRouter();
  const { client } = useRightCare();
  const [companyName, setCompanyName] = useState('RightCom XP');
  const [services, setServices] = useState<ListedService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client) {
      setServices([]);
      setError('Les services ne sont pas disponibles pour le moment.');
      return;
    }

    let mounted = true;
    setLoading(true);
    setError('');
    Promise.all([client.getCompany(), client.listCalendars()])
      .then(([companyResponse, calendarResponse]) => {
        if (!mounted) return;
        setCompanyName(companyResponse.result.companyInfo.displayName || 'RightCom XP');
        setServices(
          calendarResponse.result.flatMap((calendar) =>
            (calendar.status ? calendar.services ?? [] : [])
              .filter((service) => service.active)
              .map((service) => ({ service, location: calendar.businessLocationName })),
          ),
        );
      })
      .catch((cause: unknown) => {
        if (mounted) setError(cause instanceof Error ? cause.message : 'Une erreur est survenue.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [client]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><XpLogo size={35} /></View>
            <View>
              <Text style={styles.brandName}>RightCom XP</Text>
              <Text style={styles.brandCaption}>{companyName}</Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Profil" style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>BIENVENUE SUR RIGHTCOM XP</Text>
            <Text style={styles.heroTitle}>Une nouvelle expérience de réservation.</Text>
            <Text style={styles.heroText}>Découvrez nos services et réservez votre créneau en quelques étapes.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/widget' as never)} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Réserver maintenant</Text>
              <Text style={styles.heroArrow}>›</Text>
            </Pressable>
          </View>
          <View style={styles.heroArt}>
            <View style={styles.artCircle} />
            <View style={styles.artCross}><Text style={styles.artCrossText}>XP</Text></View>
            <View style={styles.artHeart}><Text style={styles.artHeartText}>✦</Text></View>
            <View style={styles.artDot} />
          </View>
        </View>

        <View style={styles.quickRow}>
          <QuickAction icon="▦" title="Parcours personnalisé" subtitle="Réservation avec le SDK" onPress={() => router.push('/booking' as never)} />
          <QuickAction icon="◷" title="Page web intégrée" subtitle="Réserver dans la WebView" onPress={() => router.push('/webview' as never)} />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Nos services</Text>
            <Text style={styles.sectionSubtitle}>Découvrez les services disponibles</Text>
          </View>
          <Pressable onPress={() => router.push('/booking' as never)}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.statusCard}><ActivityIndicator color="#0877ED" /><Text style={styles.statusText}>Chargement des services…</Text></View>
        ) : null}
        {!loading && error ? (
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}><Text style={styles.statusIconText}>+</Text></View>
            <View style={styles.statusCopy}><Text style={styles.statusTitle}>Bienvenue sur RightCom XP</Text><Text style={styles.statusText}>{error}</Text></View>
          </View>
        ) : null}
        {!loading && !error && services.length === 0 ? (
          <View style={styles.statusCard}><Text style={styles.statusText}>Les services seront bientôt disponibles.</Text></View>
        ) : null}

        <View style={styles.serviceGrid}>
          {services.slice(0, 4).map(({ service, location }, index) => (
            <Pressable key={`${location}-${service.objectId}`} onPress={() => router.push('/widget' as never)} style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: serviceColors[index % serviceColors.length] }]}>
                <Text style={styles.serviceSymbol}>{serviceSymbols[index % serviceSymbols.length]}</Text>
              </View>
              <Text numberOfLines={1} style={styles.serviceName}>{service.name}</Text>
              <Text numberOfLines={1} style={styles.serviceMeta}>{service.duration}{service.durationType === 'h' ? ' h' : ' min'} · {location}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.widgetBanner}>
          <View style={styles.widgetBadge}><Text style={styles.widgetBadgeText}>RIGHTTIME</Text></View>
          <Text style={styles.widgetTitle}>Votre réservation, en toute simplicité</Text>
          <Text style={styles.widgetDescription}>Choisissez votre service et trouvez le créneau qui vous convient.</Text>
          <Pressable onPress={() => router.push('/widget' as never)} style={styles.widgetButton}>
            <Text style={styles.widgetButtonText}>Découvrir le widget de réservation  ›</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/integrations' as never)} style={styles.integrationLink}>
          <View style={styles.integrationMark}><Text style={styles.integrationMarkText}>3</Text></View>
          <View style={styles.integrationCopy}>
            <Text style={styles.integrationTitle}>Explorer les intégrations</Text>
            <Text style={styles.integrationSubtitle}>Comparez trois parcours de réservation RightTime</Text>
          </View>
          <Text style={styles.integrationArrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>RIGHTCOM XP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction(props: { icon: string; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.quickAction}>
      <View style={styles.quickIcon}><Text style={styles.quickIconText}>{props.icon}</Text></View>
      <View style={styles.quickCopy}><Text style={styles.quickTitle}>{props.title}</Text><Text style={styles.quickSubtitle}>{props.subtitle}</Text></View>
      <Text style={styles.quickArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 22 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  brandMark: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E8ECF3', borderWidth: 1, borderRadius: 22, height: 48, justifyContent: 'center', width: 48 },

  brandName: { color: '#17192F', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  brandCaption: { color: '#8A91A3', fontSize: 11, marginTop: 1 },
  avatar: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 22, height: 42, justifyContent: 'center', width: 42 },
  avatarText: { color: '#0877ED', fontSize: 15, fontWeight: '800' },
  hero: { backgroundColor: '#0877ED', borderRadius: 24, minHeight: 250, overflow: 'hidden', padding: 22 },
  heroCopy: { maxWidth: '76%', zIndex: 2 },
  heroEyebrow: { color: '#D5E9FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.8, lineHeight: 31, marginTop: 10 },
  heroText: { color: '#EAF4FF', fontSize: 12, lineHeight: 18, marginTop: 8 },
  heroButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', gap: 12, marginTop: 17, paddingHorizontal: 14, paddingVertical: 11 },
  heroButtonText: { color: '#0877ED', fontSize: 12, fontWeight: '700' },
  heroArrow: { color: '#0877ED', fontSize: 20, lineHeight: 20 },
  heroArt: { height: 135, position: 'absolute', right: -2, top: 52, width: 115 },
  artCircle: { backgroundColor: '#2588F2', borderRadius: 58, height: 116, position: 'absolute', right: 2, top: 12, width: 116 },
  artCross: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, elevation: 3, height: 48, justifyContent: 'center', position: 'absolute', right: 15, top: 40, width: 48 },
  artCrossText: { color: '#0877ED', fontSize: 24, fontWeight: '300', lineHeight: 44 },
  artHeart: { alignItems: 'center', backgroundColor: '#55B9F4', borderRadius: 18, height: 36, justifyContent: 'center', left: 0, position: 'absolute', top: 85, width: 36 },
  artHeartText: { color: '#fff', fontSize: 17 },
  artDot: { backgroundColor: '#0877ED', borderRadius: 5, height: 10, position: 'absolute', right: 3, top: 2, width: 10 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickAction: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 17, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 9, minHeight: 77, paddingHorizontal: 10 },
  quickIcon: { alignItems: 'center', backgroundColor: '#EEF5FF', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  quickIconText: { color: '#0877ED', fontSize: 18, fontWeight: '700' },
  quickCopy: { flex: 1 },
  quickTitle: { color: '#17192F', fontSize: 11, fontWeight: '700' },
  quickSubtitle: { color: '#8A91A3', fontSize: 9, marginTop: 4 },
  quickArrow: { color: '#8A91A3', fontSize: 20 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: -9 },
  sectionTitle: { color: '#17192F', fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  sectionSubtitle: { color: '#8A91A3', fontSize: 11, marginTop: 4 },
  seeAll: { color: '#0877ED', fontSize: 12, fontWeight: '700' },
  statusCard: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 15 },
  statusIcon: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  statusIconText: { color: '#0877ED', fontSize: 28 },
  statusCopy: { flex: 1, gap: 4 },
  statusTitle: { color: '#17192F', fontSize: 13, fontWeight: '700' },
  statusText: { color: '#8A91A3', fontSize: 11, lineHeight: 16 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: -10 },
  serviceCard: { backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 17, borderWidth: 1, minHeight: 130, padding: 13, width: '48%' },
  serviceIcon: { alignItems: 'center', borderRadius: 13, height: 40, justifyContent: 'center', marginBottom: 11, width: 40 },
  serviceSymbol: { color: '#0877ED', fontSize: 22, fontWeight: '600' },
  serviceName: { color: '#17192F', fontSize: 12, fontWeight: '700' },
  serviceMeta: { color: '#8A91A3', fontSize: 9, marginTop: 5 },
  widgetBanner: { backgroundColor: '#17192F', borderRadius: 20, padding: 19 },
  widgetBadge: { alignSelf: 'flex-start', backgroundColor: '#1B4F91', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  widgetBadgeText: { color: '#D5E9FF', fontSize: 10, fontWeight: '700' },
  widgetTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 12 },
  widgetDescription: { color: '#D5E9FF', fontSize: 11, lineHeight: 17, marginTop: 5 },
  widgetButton: { alignSelf: 'flex-start', marginTop: 12 },
  widgetButtonText: { color: '#70C7F5', fontSize: 11, fontWeight: '700' },
  integrationLink: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 11, padding: 13 },
  integrationMark: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  integrationMarkText: { color: '#0877ED', fontSize: 15, fontWeight: '800' },
  integrationCopy: { flex: 1, gap: 3 },
  integrationTitle: { color: '#17192F', fontSize: 12, fontWeight: '700' },
  integrationSubtitle: { color: '#8A91A3', fontSize: 10 },
  integrationArrow: { color: '#8A91A3', fontSize: 20 },
  footer: { color: '#8A91A3', fontSize: 10, textAlign: 'center' },
});
