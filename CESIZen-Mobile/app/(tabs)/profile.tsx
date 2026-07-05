import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Activity, TrendingUp, Zap, LogOut, Trash2 } from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useDiaryEntries, useDiaryReport } from '../../hooks/useDiary';
import LogoHeader from '@/components/LogoHeader';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen() {
    const { user, logout, deleteAccount } = useAuthStore();
    const [period, setPeriod] = useState('month');

    // Nos requêtes React Query
    const { data: entries, isLoading: loadingEntries } = useDiaryEntries();
    const { data: stats, isLoading: loadingStats } = useDiaryReport(period);

    const streak = useMemo(() => {
        if (!entries || entries.length === 0) return 0;

        const dates = entries.map((e: any) => new Date(e.date).toISOString().split('T')[0]);
        const uniqueDates = Array.from(new Set(dates)).sort().reverse();

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) return 0;

        let currentStreak = 0;
        let checkDate = new Date(uniqueDates.includes(today) ? today : yesterday);

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (uniqueDates.includes(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return currentStreak;
    }, [entries]);

    const chartData = useMemo(() => {
        if (!stats) return [];
        return stats.map((s: any) => ({
            name: s._id,
            population: s.count,
            color: s.color,
            legendFontColor: Colors.zen.dark,
            legendFontSize: 12,
        }));
    }, [stats]);

    const totalEntries = stats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const dominantEmotion = stats?.[0]?._id || "N/A";

    const handleLogout = () => {
        Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Oui", style: "destructive", onPress: logout }
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert("Supprimer mon compte", "Cette action est irréversible. Confirmer ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer", style: "destructive", onPress: deleteAccount
            }
        ]);
    };

    if (loadingEntries || loadingStats) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.zen.sage} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>


            {/* HEADER PROFIL */}
            <View style={styles.header}>
                <LogoHeader />
                <Text style={styles.title}>Bonjour, {user?.firstname} !</Text>
                <Text style={styles.subtitle}>Voici votre bilan émotionnel.</Text>
            </View>

            {/* FILTRES DE PÉRIODE */}
            <View style={styles.filters}>
                {[
                    { key: 'week',    label: '7J'       },
                    { key: 'month',   label: '30J'      },
                    { key: 'quarter', label: 'Trim.'    },
                    { key: 'year',    label: 'Année'    },
                ].map(({ key: p, label }) => {
                    const isSelected = period === p;
                    return (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p)}
                            style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
                        >
                            <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* CARTES DE STATISTIQUES */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Activity size={24} color={Colors.zen.sage} />
                    <Text style={styles.statValue}>{totalEntries}</Text>
                    <Text style={styles.statLabel}>Notes</Text>
                </View>

                <View style={styles.statCard}>
                    <TrendingUp size={24} color={Colors.zen.sky} />
                    <Text style={styles.statValue} numberOfLines={1}>{dominantEmotion}</Text>
                    <Text style={styles.statLabel}>Dominante</Text>
                </View>

                <View style={[styles.statCard, streak > 0 && { borderColor: '#F59E0B', borderWidth: 1 }]}>
                    <Zap size={24} color={streak > 0 ? '#F59E0B' : Colors.zen.sky} />
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Jours (Série)</Text>
                </View>
            </View>

            {/* GRAPHIQUE PIE CHART */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Répartition des émotions</Text>
                {chartData.length > 0 ? (
                    <PieChart
                        data={chartData}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <Text style={styles.emptyText}>Pas assez de données pour cette période.</Text>
                )}
            </View>

            {/* ZONE DANGEREUSE (RGPD & AUTH) */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
                    <LogOut size={20} color={Colors.zen.dark} />
                    <Text style={styles.actionText}>Se déconnecter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
                    <Trash2 size={20} color="#E74C3C" />
                    <Text style={styles.dangerText}>Supprimer mon compte</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, paddingTop: 60, paddingBottom: 100 },

    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: Colors.zen.dark },
    subtitle: { fontSize: 16, color: Colors.zen.sky, marginTop: 5 },

    filters: { flexDirection: 'row', backgroundColor: Colors.zen.white, borderRadius: 20, padding: 5, marginBottom: 25 },
    filterBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 15 },
    filterBtnActive: { backgroundColor: Colors.zen.sage },
    filterText: { fontSize: 12, fontWeight: 'bold', color: Colors.zen.sky, textTransform: 'uppercase' },
    filterTextActive: { color: Colors.zen.white },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 30 },
    statCard: { flex: 1, backgroundColor: Colors.zen.white, padding: 15, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.zen.dark, marginTop: 10 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.zen.sky, textTransform: 'uppercase', marginTop: 5, textAlign: 'center' },

    chartContainer: { backgroundColor: Colors.zen.white, padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 40 },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.zen.dark, alignSelf: 'flex-start', marginBottom: 15 },
    emptyText: { color: Colors.zen.sky, fontStyle: 'italic', marginVertical: 20 },

    actionsContainer: { gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.zen.white, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    actionText: { fontSize: 16, fontWeight: 'bold', color: Colors.zen.dark },

    dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: 18, borderRadius: 15 },
    dangerText: { fontSize: 16, fontWeight: 'bold', color: '#E74C3C' },
});