import type { Calendar, Service } from '@rightcom/righttime-sdk';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRightCare } from '@/lib/rightcare-context';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id, calendarId } = useLocalSearchParams<{ id: string; calendarId?: string }>();
  const { client } = useRightCare();
  const [service, setService] = useState<Service | null>(null);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client || !id) {
      setLoading(false);
      setError('Les informations de ce service ne sont pas disponibles.');
      return;
    }
    let mounted = true;
    setLoading(true);
    Promise.all([client.listCalendars()])
      .then(([response]) => {
        if (!mounted) return;
        const calendars = response.result.filter((item) => !calendarId || item.id === calendarId);
        for (const item of calendars) {
          const found = item.services?.find((entry) => entry.objectId === id);
          if (found) {
            setCalendar(item);
            setService(found);
            return;
          }
        }
        setError('Ce service est introuvable ou n’est plus disponible.');
      })
      .catch(() => { if (mounted) setError('Impossible de charger les informations du service.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [client, id, calendarId]);

  const goToBooking = () => router.push('/booking' as never);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>RightCom XP</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.state}><ActivityIndicator color="#0877ED" /><Text style={styles.stateText}>Chargement du service…</Text></View>
        ) : null}
        {!loading && error ? (
          <View style={styles.state}><Text style={styles.stateTitle}>Service indisponible</Text><Text style={styles.stateText}>{error}</Text></View>
        ) : null}
        {!loading && service ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>DÉCOUVRIR LE SERVICE</Text>
              <Text style={styles.title}>{service.name}</Text>
              <Text style={styles.subtitle}>{service.duration}{service.durationType === 'h' ? ' heure(s)' : ' minute(s)'}</Text>
            </View>

            <Pressable accessibilityRole="button" onPress={goToBooking} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Prendre rendez-vous</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <View style={styles.contentCard}>
              <Text style={styles.sectionTitle}>À propos de ce service</Text>
              <Text style={styles.description}>
                {service.description?.trim() || 'Contactez notre équipe pour obtenir davantage d’informations sur ce service.'}
              </Text>
              {calendar?.businessLocationName ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Établissement</Text>
                  <Text style={styles.detailValue}>{calendar.businessLocationName}</Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Durée</Text>
                <Text style={styles.detailValue}>{service.duration}{service.durationType === 'h' ? ' heure(s)' : ' minutes'}</Text>
              </View>
            </View>

            <View style={styles.bottomCta}>
              <Text style={styles.bottomTitle}>Vous souhaitez choisir un créneau ?</Text>
              <Text style={styles.bottomText}>Prenez rendez-vous en quelques étapes avec RightCom XP.</Text>
              <Pressable accessibilityRole="button" onPress={goToBooking} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Prendre rendez-vous</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 40, gap: 23 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 13 },
  backButton: { alignItems: 'center', backgroundColor: '#F4F4F5', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  backText: { color: '#17192F', fontSize: 31, lineHeight: 34 },
  headerTitle: { color: '#17192F', flex: 1, fontSize: 19, fontWeight: '800' },
  headerSpacer: { width: 46 },
  hero: { backgroundColor: '#0877ED', borderRadius: 22, gap: 12, padding: 23 },
  eyebrow: { color: '#D5E9FF', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', letterSpacing: -1, lineHeight: 41 },
  subtitle: { color: '#EAF4FF', fontSize: 16, fontWeight: '600' },
  primaryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#0877ED', borderRadius: 13, flexDirection: 'row', gap: 16, justifyContent: 'center', minHeight: 55, paddingHorizontal: 19 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  buttonArrow: { color: '#FFFFFF', fontSize: 20 },
  contentCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E9F0', borderRadius: 19, borderWidth: 1, gap: 16, padding: 20 },
  sectionTitle: { color: '#17192F', fontSize: 22, fontWeight: '800' },
  description: { color: '#737B8E', fontSize: 17, lineHeight: 27 },
  detailRow: { borderTopColor: '#EEF0F4', borderTopWidth: 1, gap: 5, paddingTop: 13 },
  detailLabel: { color: '#8A91A3', fontSize: 13 },
  detailValue: { color: '#17192F', fontSize: 16, fontWeight: '700' },
  bottomCta: { backgroundColor: '#F3F7FC', borderRadius: 19, gap: 12, padding: 20 },
  bottomTitle: { color: '#17192F', fontSize: 21, fontWeight: '800' },
  bottomText: { color: '#737B8E', fontSize: 15, lineHeight: 23 },
  state: { alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 17, gap: 12, padding: 24 },
  stateTitle: { color: '#17192F', fontSize: 19, fontWeight: '800' },
  stateText: { color: '#737B8E', fontSize: 15, lineHeight: 23, textAlign: 'center' },
});
