import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RestoMap</Text>
      <Text style={styles.subtitle}>Restaurant Location Intelligence</Text>
      <Text style={styles.note}>Issue #9 — Map UI coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
  },
})
