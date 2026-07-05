import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Send } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useEmotions, useEmotionDetails, useAddDiaryEntry, useUpdateDiaryEntry } from '../hooks/useDiary';

export default function AddEntryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        id?: string;
        baseEmotionId?: string;
        emotionDetailId?: string;
        comment?: string;
    }>();

    const isEditMode = !!params.id;

    const [baseEmotionId, setBaseEmotionId] = useState<string | null>(params.baseEmotionId ?? null);
    const [emotionDetailId, setEmotionDetailId] = useState<string | null>(params.emotionDetailId ?? null);
    const [comment, setComment] = useState(params.comment ?? '');

    const { data: baseEmotions, isLoading: isLoadingBase } = useEmotions();
    const { data: details, isLoading: isLoadingDetails } = useEmotionDetails(baseEmotionId);
    const { mutateAsync: addEntry, isPending: isAdding } = useAddDiaryEntry();
    const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateDiaryEntry();

    const isSubmitting = isAdding || isUpdating;

    const handleSelectBaseEmotion = (id: string) => {
        setBaseEmotionId(id);
        setEmotionDetailId(null);
    };

    const handleSubmit = async () => {
        if (!baseEmotionId) return;

        try {
            if (isEditMode && params.id) {
                await updateEntry({
                    id: params.id,
                    baseEmotionId,
                    emotionDetailId: emotionDetailId || undefined,
                    comment,
                });
            } else {
                await addEntry({
                    baseEmotionId,
                    emotionDetailId: emotionDetailId || undefined,
                    comment,
                    date: new Date().toISOString(),
                });
            }
            router.back();
        } catch (error) {
            Alert.alert('Erreur', "Impossible de sauvegarder votre émotion.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {isEditMode ? 'Modifier mon entrée' : 'Comment ça va ?'}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={Colors.zen.dark} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>ÉMOTION PRINCIPALE</Text>
                {isLoadingBase ? (
                    <ActivityIndicator color={Colors.zen.sage} />
                ) : (
                    <View style={styles.grid}>
                        {baseEmotions?.map((emo: any) => {
                            const isSelected = baseEmotionId === emo._id;
                            return (
                                <TouchableOpacity
                                    key={emo._id}
                                    onPress={() => handleSelectBaseEmotion(emo._id)}
                                    style={[
                                        styles.baseCard,
                                        { backgroundColor: isSelected ? emo.color : Colors.zen.white },
                                        isSelected && styles.baseCardSelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.baseText,
                                        { color: isSelected ? Colors.zen.white : Colors.zen.dark }
                                    ]}>
                                        {emo.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {baseEmotionId && details && details.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(400).springify()}>
                        <Text style={styles.sectionLabel}>PRÉCISION (OPTIONNEL)</Text>
                        {isLoadingDetails ? (
                            <ActivityIndicator color={Colors.zen.sage} style={{ alignSelf: 'flex-start' }} />
                        ) : (
                            <View style={styles.grid}>
                                {details.map((det: any) => {
                                    const isSelected = emotionDetailId === det._id;
                                    return (
                                        <TouchableOpacity
                                            key={det._id}
                                            onPress={() => setEmotionDetailId(det._id)}
                                            style={[
                                                styles.detailCard,
                                                isSelected ? styles.detailCardSelected : styles.detailCardUnselected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.detailText,
                                                isSelected ? styles.detailTextSelected : styles.detailTextUnselected
                                            ]}>
                                                {det.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </Animated.View>
                )}

                <Animated.View entering={FadeIn.delay(200).duration(500)}>
                    <Text style={[styles.sectionLabel, { marginTop: 10 }]}>NOTE (OPTIONNEL)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Écrivez ce qui vous passe par la tête..."
                        placeholderTextColor={Colors.zen.sky}
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </Animated.View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, (!baseEmotionId || isSubmitting) && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!baseEmotionId || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={Colors.zen.white} />
                    ) : (
                        <>
                            <Text style={styles.buttonText}>
                                {isEditMode ? 'Mettre à jour' : 'Enregistrer mon entrée'}
                            </Text>
                            <Send size={18} color={Colors.zen.white} style={{ marginLeft: 10 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: Colors.zen.cream, zIndex: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.zen.dark },
    closeButton: { padding: 5, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 },

    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionLabel: { fontSize: 11, fontWeight: '900', color: Colors.zen.sky, marginBottom: 12, letterSpacing: 1 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },

    baseCard: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', elevation: 1 },
    baseCardSelected: { transform: [{ scale: 1.05 }], borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
    baseText: { fontSize: 15, fontWeight: 'bold' },

    detailCard: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
    detailCardUnselected: { backgroundColor: 'rgba(139, 168, 137, 0.1)' },
    detailCardSelected: { backgroundColor: Colors.zen.dark },
    detailText: { fontSize: 13, fontWeight: 'bold' },
    detailTextUnselected: { color: Colors.zen.sage },
    detailTextSelected: { color: Colors.zen.white },

    input: { backgroundColor: Colors.zen.white, borderRadius: Colors.radius, padding: 16, minHeight: 120, fontSize: 15, color: Colors.zen.dark, borderWidth: 1, borderColor: 'rgba(139, 168, 137, 0.2)' },

    footer: { padding: 20, backgroundColor: Colors.zen.cream, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    button: { flexDirection: 'row', backgroundColor: Colors.zen.sage, padding: 18, borderRadius: Colors.radius, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.zen.sage, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
    buttonText: { color: Colors.zen.white, fontSize: 16, fontWeight: 'bold' },
});
