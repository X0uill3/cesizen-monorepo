import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useArticles } from '../../hooks/useArticles';
import { useRouter } from 'expo-router';
import LogoHeader from '../../components/LogoHeader';

export default function FeedScreen() {
  const { data: articles, isLoading, isError, refetch } = useArticles();

  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/articles/${item._id}`)}>
      <Image
        source={{ uri: item.imageUrl || 'https://picsum.photos/400/200' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.zen.sage} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.zen.error }}>Impossible de charger les articles.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <LogoHeader />
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.zen.sage}
            colors={[Colors.zen.sage]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.zen.cream },
  header: { padding: 20, paddingTop: 13 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.zen.dark },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.zen.white,
    borderRadius: Colors.radius,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: Colors.zen.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  categoryBadge: {
    backgroundColor: Colors.zen.sky,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: { color: Colors.zen.dark, fontSize: 12, fontWeight: 'bold' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: Colors.zen.dark },
});