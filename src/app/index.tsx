import { createRightTimeClient } from '@rightcom/righttime-sdk';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_RIGHTTIME_API_URL ?? 'https://api.righttime.com/v1';

export default function HomeScreen() {
  const [publicKey, setPublicKey] = useState('');
  const [company, setCompany] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function request(endpoint: 'company' | 'calendars') {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const client = createRightTimeClient({
        publicKey: publicKey.trim(),
        company: company.trim(),
        baseUrl: apiUrl.trim(),
      });
      const data =
        endpoint === 'company'
          ? await client.getCompany()
          : await client.listCalendars();
      setResult(JSON.stringify(data, null, 2));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !publicKey.trim() || !company.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>EXPO · REACT NATIVE · BUN</Text>
          <Text style={styles.title}>RightTime SDK</Text>
          <Text style={styles.subtitle}>
            Démo autonome pour tester les appels API du SDK depuis une app native.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Field
            label="Clé publique"
            value={publicKey}
            onChangeText={setPublicKey}
            placeholder="pk_…"
          />
          <Field
            label="Entreprise"
            value={company}
            onChangeText={setCompany}
            placeholder="mon-entreprise"
          />
          <Field
            label="URL de l’API"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://api.righttime.com/v1"
            keyboardType="url"
          />
          <View style={styles.actions}>
            <ActionButton
              label="Charger l’entreprise"
              disabled={disabled}
              onPress={() => void request('company')}
            />
            <ActionButton
              label="Charger les calendriers"
              disabled={disabled}
              onPress={() => void request('calendars')}
              secondary
            />
          </View>
          {loading ? <ActivityIndicator color="#0879d1" style={styles.spinner} /> : null}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>La requête a échoué</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Réponse du SDK</Text>
            <Text selectable style={styles.code}>
              {result}
            </Text>
          </View>
        ) : null}

        <Text style={styles.note}>
          Le client API fonctionne en React Native. mount() et launcher() sont réservés au navigateur.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'url';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#8794a5"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.keyboardType ?? 'default'}
        style={styles.input}
      />
    </View>
  );
}

function ActionButton(props: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.button,
        props.secondary && styles.secondaryButton,
        props.disabled && styles.disabledButton,
        pressed && !props.disabled && styles.pressedButton,
      ]}>
      <Text style={[styles.buttonText, props.secondary && styles.secondaryButtonText]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f6fb' },
  page: { flexGrow: 1, padding: 20, paddingTop: 24, gap: 16 },
  header: { backgroundColor: '#102b49', borderRadius: 20, padding: 22, gap: 8 },
  eyebrow: { color: '#8bc9ff', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#d2e3f4', fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14 },
  sectionTitle: { color: '#102b49', fontSize: 18, fontWeight: '700' },
  field: { gap: 7 },
  label: { color: '#34465a', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#f7f9fc',
    borderColor: '#dce4ee',
    borderRadius: 10,
    borderWidth: 1,
    color: '#102b49',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  actions: { gap: 10, marginTop: 4 },
  button: { alignItems: 'center', backgroundColor: '#0879d1', borderRadius: 10, padding: 14 },
  secondaryButton: { backgroundColor: '#e7f2fc' },
  disabledButton: { opacity: 0.45 },
  pressedButton: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryButtonText: { color: '#075a9b' },
  spinner: { padding: 6 },
  errorBox: { backgroundColor: '#fff0ef', borderColor: '#f4b7b2', borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  errorTitle: { color: '#a52820', fontSize: 15, fontWeight: '700' },
  errorText: { color: '#7d2a24', fontSize: 14, lineHeight: 20 },
  code: { color: '#243449', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  note: { color: '#66778b', fontSize: 12, lineHeight: 18, paddingHorizontal: 4, paddingBottom: 24 },
});
