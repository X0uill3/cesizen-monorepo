import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Trash2, Pencil, MessageCircle, ChevronRight, Inbox, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useDiaryEntries, useDeleteEntry } from '../../hooks/useDiary';
import LogoHeader from '@/components/LogoHeader';

export default function TrackerDashboardScreen() {
    const router = useRouter();
    const { data: entries, isLoading } = useDiaryEntries();
    const { mutateAsync: deleteEntry } = useDeleteEntry();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Supprimer l'entrée",
            "Voulez-vous vraiment effacer ce souvenir ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer", style: "destructive", onPress: async () => {
                        try {
                            await deleteEntry(id);
                        } catch (err) {
                            Alert.alert("Erreur", "Impossible de supprimer l'entrée.");
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.timelineItem}>
            <View style={styles.timelineLine} />
            <View style={[styles.timelineDot, { backgroundColor: item.baseEmotion.color }]} />

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateContainer}>
                        <Calendar size={14} color={Colors.zen.sky} />
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/add-entry',
                                params: {
                                    id: item._id,
                                    baseEmotionId: item.baseEmotion._id,
                                    emotionDetailId: item.emotionDetail?._id ?? '',
                                    comment: item.comment ?? '',
                                }
                            })}
                            style={styles.actionBtn}
                        >
                            <Pencil size={16} color={Colors.zen.sage} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                            <Trash2 size={16} color={Colors.zen.sky} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.emotionTags}>
                    <View style={[styles.tag, { backgroundColor: item.baseEmotion.color }]}>
                        <Text style={styles.tagText}>{item.baseEmotion.name}</Text>
                    </View>
                    {item.emotionDetail && (
                        <>
                            <ChevronRight size={16} color={Colors.zen.dark} />
                            <View style={[styles.tag, { backgroundColor: Colors.zen.cream }]}>
                                <Text style={[styles.tagText, { color: Colors.zen.dark }]}>{item.emotionDetail.name}</Text>
                            </View>
                        </>
                    )}
                </View>

                {item.comment ? (
                    <View style={styles.commentBox}>
                        <MessageCircle size={16} color={Colors.zen.sage} style={{ marginTop: 2 }} />
                        <Text style={styles.commentText}>"{item.comment}"</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.zen.sage} />
                <Text style={styles.loadingText}>Récupération de vos souvenirs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <LogoHeader />
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{entries?.length || 0} entrées</Text>
                </View>
            </View>

            <FlatList
                data={entries}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Inbox size={48} color={Colors.zen.sky} />
                        <Text style={styles.emptyText}>Votre journal est vide.</Text>
                        <Text style={styles.emptySubtext}>Commencez par noter une émotion !</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-entry')}
            >
                <Plus size={30} color={Colors.zen.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream, paddingTop: 60 },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.zen.sage, fontStyle: 'italic' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.zen.dark },
    badge: { backgroundColor: Colors.zen.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { color: Colors.zen.sage, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 100 },

    timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    timelineLine: { position: 'absolute', left: 15, top: 30, bottom: -20, width: 2, backgroundColor: 'rgba(0,0,0,0.05)' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', left: 10, top: 20, borderWidth: 2, borderColor: Colors.zen.white, elevation: 2 },

    card: { flex: 1, marginLeft: 35, backgroundColor: Colors.zen.white, borderRadius: Colors.radius, padding: 16, shadowColor: Colors.zen.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { padding: 4 },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dateText: { fontSize: 12, color: Colors.zen.sky, fontWeight: 'bold', textTransform: 'uppercase' },

    emotionTags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tagText: { color: Colors.zen.white, fontSize: 12, fontWeight: 'bold' },

    commentBox: { flexDirection: 'row', backgroundColor: 'rgba(139, 168, 137, 0.1)', padding: 12, borderRadius: 12, gap: 8 },
    commentText: { flex: 1, color: Colors.zen.dark, fontStyle: 'italic', fontSize: 14 },

    emptyState: { alignItems: 'center', marginTop: 50, padding: 30, backgroundColor: Colors.zen.white, borderRadius: Colors.radius, borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.zen.sky },
    emptyText: { marginTop: 15, fontSize: 18, fontWeight: 'bold', color: Colors.zen.dark },
    emptySubtext: { color: Colors.zen.sky, textAlign: 'center', marginTop: 5 },

    fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.zen.sage, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.zen.sage, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
});