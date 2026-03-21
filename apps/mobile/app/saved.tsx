import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3001'

type SavedLocation = {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  score: number | null
  createdAt: string
}

export default function SavedScreen() {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const token = await AsyncStorage.getItem('restomap:auth_token')
      if (!token) {
        // Load from local storage
        const local = await AsyncStorage.getItem('restomap:saved_locations')
        if (local) {
          setLocations(JSON.parse(local))
        }
        setLoading(false)
        return
      }

      const res = await fetch(`${API_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.ok) {
        setLocations(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteLocation = async (id: string) => {
    Alert.alert('Hapus', 'Yakin hapus lokasi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('restomap:auth_token')
            if (token) {
              await fetch(`${API_URL}/locations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
            }
            setLocations(locations.filter(l => l.id !== id))
          } catch (err) {
            console.error('Failed to delete:', err)
          }
        },
      },
    ])
  }

  const renderItem = ({ item }: { item: SavedLocation }) => (
    <TouchableOpacity 
      style={styles.card}
      onLongPress={() => deleteLocation(item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.score && (
          <View style={[styles.score, item.score >= 70 && styles.scoreHigh]}>
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardSubtitle}>{item.city}</Text>
      <Text style={styles.cardCoords}>
        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lokasi Tersimpan</Text>
      <Text style={styles.subtitle}>
        {locations.length} lokasi • Tekan lama untuk hapus
      </Text>
      
      {loading ? (
        <Text style={styles.loading}>Memuat...</Text>
      ) : locations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyText}>Belum ada lokasi</Text>
          <Text style={styles.emptySubtext}>Simpan lokasi dari peta</Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  score: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreHigh: {
    backgroundColor: '#D1FAE5',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  cardCoords: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
})
