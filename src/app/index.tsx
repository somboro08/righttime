import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingBottomSheet } from '@/components/booking-bottom-sheet';

interface ListedService {
  id: string;
  name: string;
  description: string;
  location: string;
  duration: number;
  durationType?: string;
}

const demoServices: ListedService[] = [
  {
    id: 'demo-general-consultation',
    name: 'Consultation générale',
    description: 'Un bilan de santé et des conseils adaptés à vos besoins.',
    location: 'Centre médical',
    duration: 30,
    durationType: 'min',
  },
  {
    id: 'demo-prevention',
    name: 'Prévention & bien-être',
    description: 'Un rendez-vous de prévention pour prendre soin de vous.',
    location: 'Centre médical',
    duration: 30,
    durationType: 'min',
  },
  {
    id: 'demo-specialist',
    name: 'Consultation spécialisée',
    description: 'Échangez avec un professionnel selon votre besoin.',
    location: 'Centre médical',
    duration: 45,
    durationType: 'min',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false);
  const displayServices = demoServices;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="RightTime"
              resizeMode="cover"
              source={require('../../assets/imgi_7_righttime-256x256.png')}
              style={styles.brandLogo}
            />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir le menu" onPress={() => setMenuOpen((open) => !open)} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
        </View>

        {menuOpen ? (
          <View style={styles.menuPanel}>
            <MenuItem label="Accueil" onPress={() => { setMenuOpen(false); router.replace('/' as never); }} />
            <MenuItem label="Prendre rendez-vous" onPress={() => { setMenuOpen(false); setBookingSheetOpen(true); }} />
            <MenuItem label="Modes d’intégration" onPress={() => { setMenuOpen(false); router.push('/integrations' as never); }} />
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>Vos rendez-vous, en toute simplicité.</Text>
          <Text style={styles.subtitle}>Découvrez nos services et choisissez celui qui vous convient.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nos services</Text>
         </View>
          <Text style={styles.count}>{displayServices.length.toString().padStart(2, '0')}</Text>
        </View>

        <View style={styles.services}>
          {displayServices.map((service, index) => (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              onPress={() => setBookingSheetOpen(true)}
              style={styles.serviceCard}>
              <View style={styles.serviceTop}>
                <View style={[styles.serviceNumber, index % 2 === 1 && styles.serviceNumberAlt]}>
                  <Text style={styles.serviceNumberText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.demoLabel}>EXEMPLE</Text>
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text numberOfLines={2} style={styles.serviceDescription}>
                {service.description || 'Consultez les détails de ce service et choisissez le créneau qui vous convient.'}
              </Text>
              <View style={styles.serviceMetaRow}>
                <Text style={styles.serviceMeta}>{service.duration}{service.durationType === 'h' ? ' h' : ' min'}</Text>
                {service.location ? <Text numberOfLines={1} style={styles.serviceLocation}>{service.location}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bookingBlock}>
          <Text style={styles.bookingTitle}>Prêt à prendre rendez-vous ?</Text>
          <Text style={styles.bookingText}>Choisissez votre créneau et confirmez votre réservation en quelques étapes.</Text>
          <Pressable accessibilityRole="button" onPress={() => setBookingSheetOpen(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Prendre rendez-vous</Text>
            <Text style={styles.primaryArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>RIGHTCOM XP</Text>
      </ScrollView>
      <BookingBottomSheet visible={bookingSheetOpen} onClose={() => setBookingSheetOpen(false)} />
    </SafeAreaView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.menuItem}><Text style={styles.menuItemText}>{label}</Text><Text style={styles.menuArrow}>›</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',  },
  fixedHeader: { backgroundColor: '#FFFFFF', borderBottomColor: '#EEF0F4', borderBottomWidth: 1, elevation: 2, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, zIndex: 2 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { alignItems: 'flex-start', justifyContent: 'center' },
  brandLogo: { height: 36, width: 154 },
  scrollView: { flex: 1 },
  page: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 42, gap: 28 },
  menuButton: { alignItems: 'center', backgroundColor: '#F4F4F5', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  menuIcon: { color: '#17192F', fontSize: 23 },
  menuPanel: { backgroundColor: '#FFFFFF', borderColor: '#E8ECF3', borderRadius: 16, borderWidth: 1, marginTop: -7, paddingHorizontal: 15, paddingVertical: 5 },
  menuItem: { alignItems: 'center', borderBottomColor: '#EEF0F4', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 49 },
  menuItemText: { color: '#17192F', fontSize: 15, fontWeight: '600' },
  menuArrow: { color: '#0877ED', fontSize: 23 },
  intro: { alignItems: 'center', gap: 11, paddingTop: 8 },
  title: { color: '#17192F', fontSize: 31, fontWeight: '800', letterSpacing: -1, lineHeight: 39, textAlign: 'center' },
  subtitle: { color: '#737B8E', fontSize: 16, lineHeight: 24, maxWidth: 340, textAlign: 'center' },
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
  demoLabel: { backgroundColor: '#EAF4FF', borderRadius: 10, color: '#0877ED', fontSize: 9, fontWeight: '800', letterSpacing: 0.6, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6 },
  serviceName: { color: '#17192F', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  serviceDescription: { color: '#737B8E', fontSize: 15, lineHeight: 23 },
  serviceMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 2 },
  serviceMeta: { color: '#0877ED', fontSize: 13, fontWeight: '700' },
  serviceLocation: { color: '#8A91A3', flex: 1, fontSize: 13 },
  bookingBlock: { backgroundColor: '#0877ED', borderRadius: 22, padding: 22, gap: 12 },
  bookingTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  bookingText: { color: '#EAF4FF', fontSize: 15, lineHeight: 23 },
  primaryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 13, flexDirection: 'row', gap: 18, justifyContent: 'center', marginTop: 5, minHeight: 54, paddingHorizontal: 18 },
  primaryButtonText: { color: '#0877ED', fontSize: 16, fontWeight: '800' },
  primaryArrow: { color: '#0877ED', fontSize: 20 },
  footer: { color: '#A0A6B2', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
});
