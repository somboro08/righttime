import type {
  Agent,
  AvailabilitySlot,
  Calendar,
  CompanyInfo,
  Service,
} from '@rightcom/righttime-sdk';
import { useEffect, useMemo, useState } from 'react';
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

import { useRightCare } from '@/lib/rightcare-context';

interface SlotChoice {
  date: string;
  slot: AvailabilitySlot;
  agent: Agent;
}

export default function CustomBookingScreen() {
  const { client } = useRightCare();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [calendarId, setCalendarId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [slots, setSlots] = useState<SlotChoice[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotChoice | null>(null);
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    setLoadingCatalog(true);
    setError('');
    Promise.all([client.getCompany(), client.listCalendars()])
      .then(([companyResponse, calendarResponse]) => {
        if (!mounted) return;
        setCompany(companyResponse.result.companyInfo);
        const activeCalendars = calendarResponse.result.filter((calendar) => calendar.status);
        setCalendars(activeCalendars);
        setCalendarId((current) => current || activeCalendars[0]?.id || '');
      })
      .catch((cause: unknown) => {
        if (mounted) setError('Les services sont momentanément indisponibles. Réessayez dans un instant.');
      })
      .finally(() => {
        if (mounted) setLoadingCatalog(false);
      });
    return () => {
      mounted = false;
    };
  }, [client]);

  const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId) ?? null;
  const services = useMemo(
    () => (selectedCalendar?.services ?? []).filter((service) => service.active),
    [selectedCalendar],
  );
  const selectedService = services.find((service) => service.objectId === serviceId) ?? null;

  useEffect(() => {
    if (!selectedCalendar) return;
    setServiceId((current) =>
      services.some((service) => service.objectId === current)
        ? current
        : services[0]?.objectId ?? '',
    );
  }, [selectedCalendar, services]);

  useEffect(() => {
    if (!client || !selectedCalendar || !selectedService) {
      setAgents([]);
      setSlots([]);
      return;
    }
    let mounted = true;
    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    Promise.all([
      client.getAgents({ calendarId: selectedCalendar.id, serviceId: selectedService.objectId }),
      client.getAvailability({ calendarId: selectedCalendar.id, serviceId: selectedService.objectId, year, month }),
    ])
      .then(([agentResponse, availabilityResponse]) => {
        if (!mounted) return;
        const availableAgents = agentResponse.result.filter((agent) => agent.enabled);
        setAgents(availableAgents);
        const choices: SlotChoice[] = [];
        for (const [date, byAgent] of Object.entries(availabilityResponse.result.availableDays)) {
          for (const [agentId, daySlots] of Object.entries(byAgent)) {
            const agent = availableAgents.find((item) => item.id === agentId);
            if (!agent) continue;
            for (const slot of daySlots) choices.push({ date, slot, agent });
          }
        }
        choices.sort((a, b) => `${a.date} ${a.slot.startTime}`.localeCompare(`${b.date} ${b.slot.startTime}`));
        setSlots(choices);
      })
      .catch((cause: unknown) => {
        if (mounted) setError('Impossible de charger les disponibilités pour le moment. Réessayez bientôt.');
      })
      .finally(() => {
        if (mounted) setLoadingSlots(false);
      });
    return () => {
      mounted = false;
    };
  }, [client, selectedCalendar, selectedService, monthDate]);

  function selectCalendar(calendar: Calendar) {
    setCalendarId(calendar.id);
    setServiceId(calendar.services?.find((service) => service.active)?.objectId ?? '');
    setConfirmation('');
  }

  async function confirmBooking() {
    if (!client || !selectedCalendar || !selectedService || !selectedSlot || !company) return;
    setBooking(true);
    setError('');
    setConfirmation('');
    try {
      const response = await client.createAppointment({
        service: {
          objectId: selectedService.objectId,
          name: selectedService.name,
          appointmentType: selectedService.appointmentType,
        },
        language: 'fr',
        attendees: [{
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
        }],
        calendar: {
          id: selectedCalendar.id,
          businessLocationName: selectedCalendar.businessLocationName,
        },
        agent: {
          id: selectedSlot.agent.id,
          firstName: selectedSlot.agent.firstName,
          lastName: selectedSlot.agent.lastName,
          email: selectedSlot.agent.email,
        },
        timeSlot: selectedSlot.slot,
        date: selectedSlot.date,
        company: { companyInfo: { id: company.id, displayName: company.displayName } },
      });
      setConfirmation(
        `Rendez-vous confirmé : ${selectedService.name}, le ${formatDate(selectedSlot.date)} à ${selectedSlot.slot.startTime}. Référence ${response.result.rdvId || response.result.objectId}.`,
      );
      setSelectedSlot(null);
    } catch (cause) {
      setError('La réservation n’a pas pu être confirmée. Vérifiez vos informations et réessayez.');
    } finally {
      setBooking(false);
    }
  }

  const canBook = !!selectedSlot && !!email.trim() && !!phone.trim() && !booking;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.kicker}>RIGHTCARE · À VOTRE ÉCOUTE</Text>
          <Text style={styles.title}>Prenez rendez-vous</Text>
          <Text style={styles.subtitle}>
            Choisissez votre centre, le soin souhaité et un horaire qui vous convient.
          </Text>
        </View>

        {!client ? (
          <InfoCard title="La réservation sera bientôt disponible">
            Nos créneaux sont momentanément indisponibles. Revenez dans quelques instants.
          </InfoCard>
        ) : null}

        {client && loadingCatalog ? <LoadingCard label="Chargement des calendriers médicaux…" /> : null}
        {client && !loadingCatalog && calendars.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Choisir un centre médical</Text>
            <View style={styles.choiceList}>
              {calendars.map((calendar) => (
                <ChoiceButton
                  key={calendar.id}
                  label={`${calendar.businessLocationName}${calendar.city ? ` · ${calendar.city}` : ''}`}
                  selected={calendar.id === calendarId}
                  onPress={() => selectCalendar(calendar)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {selectedCalendar && services.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2. Choisir un service</Text>
            <View style={styles.choiceList}>
              {services.map((service) => (
                <ChoiceButton
                  key={service.objectId}
                  label={service.name}
                  selected={service.objectId === serviceId}
                  onPress={() => {
                    setServiceId(service.objectId);
                    setConfirmation('');
                  }}
                />
              ))}
            </View>
            {selectedService ? (
              <Text style={styles.muted}>
                {selectedService.description || 'Consultation médicale'} · {selectedService.duration}
                {selectedService.durationType === 'h' ? ' h' : ' min'}
              </Text>
            ) : null}
          </View>
        ) : null}

        {selectedService ? (
          <View style={styles.card}>
            <View style={styles.monthHeader}>
              <Text style={styles.sectionTitle}>3. Choisir un créneau</Text>
              <View style={styles.monthControls}>
                <Pressable onPress={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}>
                  <Text style={styles.monthArrow}>‹</Text>
                </Pressable>
                <Text style={styles.monthLabel}>
                  {monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Text>
                <Pressable onPress={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}>
                  <Text style={styles.monthArrow}>›</Text>
                </Pressable>
              </View>
            </View>
            {loadingSlots ? <ActivityIndicator color="#087f70" /> : null}
            {!loadingSlots && slots.length === 0 ? (
              <Text style={styles.muted}>Aucun créneau disponible ce mois-ci.</Text>
            ) : null}
            <View style={styles.choiceList}>
              {slots.slice(0, 24).map((choice) => {
                const selected =
                  selectedSlot?.date === choice.date &&
                  selectedSlot.slot.startTime === choice.slot.startTime &&
                  selectedSlot.agent.id === choice.agent.id;
                return (
                  <ChoiceButton
                    key={`${choice.date}-${choice.agent.id}-${choice.slot.startTime}`}
                    label={`${formatDate(choice.date)} · ${choice.slot.startTime} · ${choice.agent.firstName} ${choice.agent.lastName}`}
                    selected={selected}
                    onPress={() => setSelectedSlot(choice)}
                  />
                );
              })}
            </View>
            {slots.length > 24 ? <Text style={styles.muted}>Les 24 premiers créneaux sont affichés.</Text> : null}
          </View>
        ) : null}

        {selectedSlot ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>4. Vos coordonnées</Text>
            <TextInputField label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Votre prénom" />
            <TextInputField label="Nom" value={lastName} onChangeText={setLastName} placeholder="Votre nom" />
            <TextInputField label="Adresse e-mail *" value={email} onChangeText={setEmail} placeholder="nom@exemple.com" keyboardType="email-address" />
            <TextInputField label="Téléphone *" value={phone} onChangeText={setPhone} placeholder="+229 …" keyboardType="phone-pad" />
            <Pressable disabled={!canBook} onPress={() => void confirmBooking()} style={[styles.bookButton, !canBook && styles.disabled]}>
              {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookButtonText}>Confirmer le rendez-vous</Text>}
            </Pressable>
          </View>
        ) : null}

        {error ? <InfoCard title="Une erreur est survenue" error>{error}</InfoCard> : null}
        {confirmation ? <InfoCard title="Rendez-vous confirmé" success>{confirmation}</InfoCard> : null}
        {agents.length > 0 ? <Text style={styles.footer}>{agents.length} professionnel(s) disponible(s)</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ChoiceButton(props: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.choice, props.selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, props.selected && styles.choiceTextSelected]}>{props.label}</Text>
    </Pressable>
  );
}

function TextInputField(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#8b9bb0"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.keyboardType ?? 'default'}
        style={styles.input}
      />
    </View>
  );
}

function InfoCard(props: { title: string; children: string; error?: boolean; success?: boolean }) {
  return (
    <View style={[styles.infoCard, props.error && styles.errorCard, props.success && styles.successCard]}>
      <Text style={[styles.infoTitle, props.error && styles.errorText, props.success && styles.successText]}>{props.title}</Text>
      <Text style={styles.muted}>{props.children}</Text>
    </View>
  );
}

function LoadingCard(props: { label: string }) {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator color="#087f70" />
      <Text style={styles.muted}>{props.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7faf9' },
  page: { padding: 20, paddingTop: 12, paddingBottom: 40, gap: 14 },
  hero: { backgroundColor: '#e7f4ef', borderRadius: 22, padding: 22, gap: 8 },
  kicker: { color: '#087f70', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#173d3a', fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: '#617b76', fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderColor: '#edf2ef', borderRadius: 18, borderWidth: 1, padding: 17, gap: 12 },
  sectionTitle: { color: '#173d3a', fontSize: 16, fontWeight: '800' },
  choiceList: { gap: 8 },
  choice: { backgroundColor: '#f7f9fc', borderColor: '#dce4ee', borderRadius: 10, borderWidth: 1, padding: 12 },
  choiceSelected: { backgroundColor: '#e7f4ef', borderColor: '#087f70' },
  choiceText: { color: '#34465a', fontSize: 13, fontWeight: '600' },
  choiceTextSelected: { color: '#087f70' },
  muted: { color: '#708197', fontSize: 12, lineHeight: 18 },
  monthHeader: { gap: 10 },
  monthControls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  monthArrow: { color: '#087f70', fontSize: 30, paddingHorizontal: 8 },
  monthLabel: { color: '#34465a', fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  field: { gap: 6 },
  label: { color: '#34465a', fontSize: 12, fontWeight: '700' },
  input: { backgroundColor: '#f8faf9', borderColor: '#dce8e3', borderRadius: 12, borderWidth: 1, color: '#173d3a', fontSize: 14, minHeight: 48, paddingHorizontal: 12 },
  bookButton: { alignItems: 'center', backgroundColor: '#087f70', borderRadius: 12, minHeight: 48, justifyContent: 'center', marginTop: 4 },
  bookButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  infoCard: { backgroundColor: '#fff', borderColor: '#edf2ef', borderRadius: 15, borderWidth: 1, padding: 16, gap: 5 },
  errorCard: { backgroundColor: '#fff0ef' },
  successCard: { backgroundColor: '#eaf8f1' },
  infoTitle: { color: '#173d3a', fontSize: 14, fontWeight: '700' },
  errorText: { color: '#a52820' },
  successText: { color: '#18744a' },
  loadingCard: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#edf2ef', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 16 },
  footer: { color: '#7a899b', fontSize: 10, textAlign: 'center' },
});
