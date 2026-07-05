import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import LogoHeader from '../../../components/LogoHeader';
import { Activity, ArrowRight, Brain, Moon } from 'lucide-react-native';
import { useDiagnosticTests } from '../../../hooks/useDiagnostic';

export default function DiagnosticCatalogScreen() {
    // 1. On récupère la fonction `refetch` fournie par React Query
    const { data: tests, isLoading, refetch } = useDiagnosticTests();
    const router = useRouter();

    // 2. On ajoute un état pour gérer l'animation du spinner de rafraîchissement
    const [refreshing, setRefreshing] = useState(false);

    // 3. La fonction déclenchée quand l'utilisateur tire la liste vers le bas
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch(); // Force React Query à refaire l'appel API
        } catch (error) {
            console.error("Erreur lors du rafraîchissement", error);
        } finally {
            setRefreshing(false); // Arrête le spinner quoi qu'il arrive
        }
    };

    const getIconForTest = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('sommeil')) return <Moon size={24} color={Colors.zen.sage} />;
        if (t.includes('stress') || t.includes('anxiété')) return <Activity size={24} color={Colors.zen.sage} />;
        return <Brain size={24} color={Colors.zen.sage} />;
    };

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.zen.sage} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={{ paddingHorizontal: 20, paddingTop: 13 }}>
                <LogoHeader />
            </View>

            <View style={styles.content}>
                <Text style={styles.pageTitle}>Évaluations</Text>
                <Text style={styles.pageSubtitle}>Prenez un moment pour faire le point sur vous-même.</Text>

                <FlatList
                    data={tests}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.zen.sage}
                            colors={[Colors.zen.sage]}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/(tabs)/diagnostics/${item._id}`)}
                        >
                            <View style={styles.iconContainer}>
                                {getIconForTest(item.title)}
                            </View>
                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                            </View>
                            <ArrowRight size={20} color={Colors.zen.sky} />
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: Colors.zen.dark, marginBottom: 5 },
    pageSubtitle: { fontSize: 15, color: Colors.zen.sky, marginBottom: 25 },

    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.zen.white, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(139, 168, 137, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardText: { flex: 1, marginRight: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.zen.dark, marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
});