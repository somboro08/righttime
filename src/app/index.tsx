import type { Service } from '@rightcom/righttime-sdk';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRightCare } from '@/lib/rightcare-context';

interface ListedService {
  service: Service;
  calendarId: string;
  location: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { client } = useRightCare();
  const [companyName, setCompanyName] = useState('RightCom XP');
  const [services, setServices] = useState<ListedService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!client) {
      setServices([]);
      setError('Le catalogue des services est momentanément indisponible.');
      return;
    }
    let mounted = true;
    setLoading(true);
    setError('');
    Promise.all([client.getCompany(), client.listCalendars()])
      .then(([companyResponse, calendarResponse]) => {
        if (!mounted) return;
        setCompanyName(companyResponse.result.companyInfo.displayName || 'RightCom XP');
        setServices(calendarResponse.result.flatMap((calendar) =>
          (calendar.status ? calendar.services ?? [] : [])
            .filter((service) => service.active)
            .map((service) => ({ service, calendarId: calendar.id, location: calendar.businessLocationName })),
        ));
      })
      .catch(() => { if (mounted) setError('Impossible de charger les services. Veuillez réessayer.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [client]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>RightCom XP</Text>
            <Text style={styles.brandCaption}>{companyName}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir le menu" onPress={() => setMenuOpen((open) => !open)} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
        </View>

        {menuOpen ? (
          <View style={styles.menuPanel}>
            <MenuItem label="Accueil" onPress={() => { setMenuOpen(false); router.replace('/' as never); }} />
            <MenuItem label="Prendre rendez-vous" onPress={() => { setMenuOpen(false); router.push('/booking' as never); }} />
            <MenuItem label="Modes d’intégration" onPress={() => { setMenuOpen(false); router.push('/integrations' as never); }} />
          </View>
        ) : null}

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>BIENVENUE</Text>
          <Text style={styles.title}>Vos rendez-vous, en toute simplicité.</Text>
          <Text style={styles.subtitle}>Découvrez nos services et choisissez celui qui vous convient.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nos services</Text>
            <Text style={styles.sectionSubtitle}>Choisissez un service pour en savoir plus.</Text>
          </View>
          <Text style={styles.count}>{services.length.toString().padStart(2, '0')}</Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}><ActivityIndicator color="#0877ED" /><Text style={styles.stateText}>Chargement des services…</Text></View>
        ) : null}
        {!loading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Services indisponibles</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => router.replace('/' as never)}><Text style={styles.retry}>Réessayer</Text></Pressable>
          </View>
        ) : null}
        {!loading && !error && services.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Aucun service disponible</Text>
            <Text style={styles.stateText}>Les nouveaux services apparaîtront ici dès qu’ils seront disponibles.</Text>
          </View>
        ) : null}

        <View style={styles.services}>
          {services.map(({ service, calendarId, location }, index) => (
            <Pressable
              key={`${calendarId}-${service.objectId}`}
              accessibilityRole="button"
              onPress={() => router.push(`/service/${encodeURIComponent(service.objectId)}?calendarId=${encodeURIComponent(calendarId)}` as never)}
              style={styles.serviceCard}>
              <View style={styles.serviceTop}>
                <View style={[styles.serviceNumber, index % 2 === 1 && styles.serviceNumberAlt]}>
                  <Text style={styles.serviceNumberText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.arrow}>↗</Text>
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text numberOfLines={2} style={styles.serviceDescription}>
                {service.description?.trim() || 'Consultez les détails de ce service et choisissez le créneau qui vous convient.'}
              </Text>
              <View style={styles.serviceMetaRow}>
                <Text style={styles.serviceMeta}>{service.duration}{service.durationType === 'h' ? ' h' : ' min'}</Text>
                {location ? <Text numberOfLines={1} style={styles.serviceLocation}>{location}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bookingBlock}>
          <Text style={styles.bookingTitle}>Prêt à prendre rendez-vous ?</Text>
          <Text style={styles.bookingText}>Choisissez votre créneau et confirmez votre réservation en quelques étapes.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/booking' as never)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Prendre rendez-vous</Text>
            <Text style={styles.primaryArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>RIGHTCOM XP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.menuItem}><Text style={styles.menuItemText}>{label}</Text><Text style={styles.menuArrow}>›</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 42, gap: 28 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { gap: 3 },
  brandName: { color: '#17192F', fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  brandCaption: { color: '#8A91A3', fontSize: 12 },
  menuButton: { alignItems: 'center', backgroundColor: '#F4F4F5', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  menuIcon: { color: '#17192F', fontSize: 23 },
  menuPanel: { backgroundColor: '#FFFFFF', borderColor: '#E8ECF3', borderRadius: 16, borderWidth: 1, marginTop: -17, paddingHorizontal: 15, paddingVertical: 5 },
  menuItem: { alignItems: 'center', borderBottomColor: '#EEF0F4', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 49 },
  menuItemText: { color: '#17192F', fontSize: 15, fontWeight: '600' },
  menuArrow: { color: '#0877ED', fontSize: 23 },
  intro: { gap: 11, paddingTop: 8 },
  eyebrow: { color: '#0877ED', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#17192F', fontSize: 35, fontWeight: '800', letterSpacing: -1.2, lineHeight: 42 },
  subtitle: { color: '#737B8E', fontSize: 17, lineHeight: 26, maxWidth: 340 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: -10 },
  sectionTitle: { color: '#17192F', fontSize: 24, fontWeight: '800', letterSpacing: -0.7 },
  sectionSubtitle: { color: '#8A91A3', fontSize: 14, lineHeight: 21, marginTop: 5 },
  count: { color: '#0877ED', fontSize: 17, fontWeight: '800' },
  services: { gap: 13 },
  serviceCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E9F0', borderRadius: 19, borderWidth: 1, padding: 18, gap: 11 },
  serviceTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  serviceNumber: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  serviceNumberAlt: { backgroundColor: '#F0F2F6' },
  serviceNumberText: { color: '#0877ED', fontSize: 14, fontWeight: '800' },
  arrow: { color: '#0877ED', fontSize: 23 },
  serviceName: { color: '#17192F', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  serviceDescription: { color: '#737B8E', fontSize: 15, lineHeight: 23 },
  serviceMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 2 },
  serviceMeta: { color: '#0877ED', fontSize: 13, fontWeight: '700' },
  serviceLocation: { color: '#8A91A3', flex: 1, fontSize: 13 },
  stateCard: { backgroundColor: '#F7F8FA', borderRadius: 17, padding: 20, gap: 9 },
  stateTitle: { color: '#17192F', fontSize: 17, fontWeight: '700' },
  stateText: { color: '#737B8E', fontSize: 15, lineHeight: 23 },
  retry: { color: '#0877ED', fontSize: 15, fontWeight: '700', marginTop: 3 },
  bookingBlock: { backgroundColor: '#0877ED', borderRadius: 22, padding: 22, gap: 12 },
  bookingTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  bookingText: { color: '#EAF4FF', fontSize: 15, lineHeight: 23 },
  primaryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 13, flexDirection: 'row', gap: 18, justifyContent: 'center', marginTop: 5, minHeight: 54, paddingHorizontal: 18 },
  primaryButtonText: { color: '#0877ED', fontSize: 16, fontWeight: '800' },
  primaryArrow: { color: '#0877ED', fontSize: 20 },
  footer: { color: '#A0A6B2', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
});
