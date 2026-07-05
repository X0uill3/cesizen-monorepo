import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useArticle } from '../../hooks/useArticles'; // Vérifie le chemin !

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Récupère l'ID depuis l'URL dynamique
    const router = useRouter();
    const insets = useSafeAreaInsets(); // Pour gérer l'encoche de l'iPhone proprement

    const { data: article, isLoading } = useArticle(id);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.zen.sage} />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: Colors.zen.dark }}>Article introuvable. 😕</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.zen.sage, fontWeight: 'bold' }}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

                {/* HEADER avec Image et Bouton Retour */}
                <View style={styles.headerContainer}>
                    {article.imageUrl ? (
                        <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: Colors.zen.sky }]} />
                    )}

                    {/* Bouton retour flottant (Par-dessus l'image) */}
                    <TouchableOpacity
                        style={[styles.backButton, { top: Math.max(insets.top, 20) }]}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={Colors.zen.dark} />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    {/* Catégorie */}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{article.category}</Text>
                    </View>

                    {/* Titre */}
                    <Text style={styles.title}>{article.title}</Text>

                    {/* Méta-données (Auteur / Date) */}
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <User size={16} color={Colors.zen.sky} />
                            <Text style={styles.metaText}>{article.author?.firstname} {article.author?.lastname}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Calendar size={16} color={Colors.zen.sky} />
                            <Text style={styles.metaText}>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</Text>
                        </View>
                    </View>

                    {/* Ligne de séparation */}
                    <View style={styles.divider} />

                    {/* Contenu Texte (séparé par les retours à la ligne comme sur ton web) */}
                    {article.content?.split('\n').map((paragraph: string, index: number) => {
                        if (!paragraph.trim()) return null; // Ignore les lignes vides
                        return (
                            <Text key={index} style={styles.paragraph}>
                                {paragraph}
                            </Text>
                        );
                    })}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    center: { justifyContent: 'center', alignItems: 'center' },

    headerContainer: { position: 'relative' },
    heroImage: { width: '100%', height: 300, resizeMode: 'cover' },
    backButton: { position: 'absolute', left: 20, backgroundColor: Colors.zen.white, padding: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

    contentContainer: { padding: 24, backgroundColor: Colors.zen.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },

    categoryBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(139, 168, 137, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 15 },
    categoryText: { color: Colors.zen.sage, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    title: { fontSize: 28, fontWeight: 'bold', color: Colors.zen.dark, lineHeight: 34, marginBottom: 20 },

    metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: Colors.zen.sky, fontSize: 14, fontWeight: '600' },

    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 25 },

    paragraph: { fontSize: 17, color: '#4A5568', lineHeight: 28, marginBottom: 15 },
});