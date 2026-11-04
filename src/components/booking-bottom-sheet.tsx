import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { BookingFlow } from '@/components/booking-flow';

export function BookingBottomSheet(props: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={props.onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={props.visible}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la fenêtre de réservation"
          onPress={props.onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheet}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
            {props.visible ? <BookingFlow onClose={props.onClose} /> : null}
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(15, 24, 42, 0.48)', flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: '94%',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  handleArea: { alignItems: 'center', backgroundColor: '#fff', height: 26, justifyContent: 'center' },
  handle: { backgroundColor: '#D8DDE5', borderRadius: 3, height: 5, width: 42 },
  content: { flex: 1 },
});
