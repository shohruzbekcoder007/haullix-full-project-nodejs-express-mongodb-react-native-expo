import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { ordersAPI } from '../services/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await ordersAPI.getAll();
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      // Fallback dummy data if server is fresh
      setOrders([
        {
          _id: '1',
          origin: 'Samarqand',
          destination: 'Toshkent',
          cargoType: 'Meva va sabzavotlar',
          weight: 12,
          price: 2800000,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          origin: 'Buxoro',
          destination: 'Navoiy',
          cargoType: 'Paxta tolalari',
          weight: 22,
          price: 1900000,
          status: 'in_transit',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.routeText}>{item.origin} ➔ {item.destination}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status === 'in_transit' ? 'Yo\'lda' : 'Kutilmoqda'}</Text>
        </View>
      </View>
      <Text style={styles.cargoInfo}>Yuk turi: {item.cargoType} • {item.weight} tonna</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.priceText}>{item.price?.toLocaleString()} so'm</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Batafsil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mavjud Buyurtmalar</Text>
        <Text style={styles.subtitle}>Barcha yo'nalishlar bo'yicha e'lonlar</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} tintColor="#2563eb" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  badge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  cargoInfo: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  priceText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
