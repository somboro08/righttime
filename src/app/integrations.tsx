import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const options = [
  {
    number: '01',
    title: 'Widget RightTime',
    description: 'Le widget officiel de réservation chargé avec le SDK dans une WebView.',
    route: '/widget',
    label: 'Ouvrir le widget',
  },
  {
    number: '02',
    title: 'Interface native RightCom XP',
    description: 'Un parcours mobile personnalisé qui utilise les API du SDK pour les services, les créneaux et la réservation.',
    route: '/booking',
    label: 'Voir le parcours natif',
  },
  {
    number: '03',
    title: 'Page web dans une WebView',
    description: 'Une page de réservation hébergée affichée directement dans l’application mobile.',
    route: '/webview',
    label: 'Ouvrir la page intégrée',
  },
];

export default function IntegrationsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DÉMONSTRATION RIGHTTIME</Text>
          <Text style={styles.title}>Trois façons de réserver</Text>
          <Text style={styles.subtitle}>Découvrez différentes intégrations du SDK RightTime dans une application mobile.</Text>
        </View>
        {options.map((option) => (
          <View key={option.number} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.number}><Text style={styles.numberText}>{option.number}</Text></View>
              <Text style={styles.method}>INTÉGRATION</Text>
            </View>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.description}>{option.description}</Text>
            <Pressable onPress={() => router.push(option.route as never)} style={styles.button}>
              <Text style={styles.buttonText}>{option.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', flex: 1 },
  page: { gap: 14, padding: 20, paddingBottom: 34 },
  header: { backgroundColor: '#EAF4FF', borderRadius: 22, gap: 9, marginBottom: 3, padding: 20 },
  eyebrow: { color: '#0877ED', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17192F', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: '#68738A', fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderColor: '#E8ECF3', borderRadius: 18, borderWidth: 1, gap: 10, padding: 17 },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  number: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  numberText: { color: '#0877ED', fontSize: 12, fontWeight: '800' },
  method: { color: '#8A91A3', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: '#17192F', fontSize: 16, fontWeight: '800' },
  description: { color: '#8A91A3', fontSize: 12, lineHeight: 18 },
  button: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#0877ED', borderRadius: 11, flexDirection: 'row', gap: 12, marginTop: 3, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  arrow: { color: '#fff', fontSize: 18, lineHeight: 18 },
});
