import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import LogoHeader from '../../../components/LogoHeader';
import { ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react-native';

import { useDiagnosticTestQuestions, useDiagnosticTests, useSaveTestResult } from '../../../hooks/useDiagnostic';
import { useAuthStore } from '../../../store/authStore';

export default function DiagnosticFlowScreen() {
    const { id } = useLocalSearchParams(); // Récupère l'ID du test depuis l'URL
    const router = useRouter();

    // États locaux
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setCurrentIndex(0);
        setTotalScore(0);
        setIsFinished(false);
    }, [id]);

    // Hooks API
    const { data: questions, isLoading: loadingQuestions } = useDiagnosticTestQuestions(id as string);
    const { data: tests } = useDiagnosticTests(); // On récupère ça pour avoir les règles du test
    const { mutateAsync: saveResult } = useSaveTestResult();
    const { user } = useAuthStore();

    // On trouve le test actuel pour récupérer ses règles de score
    const currentTest = tests?.find((t: any) => t._id === id);

    const handleAnswer = async (points: number) => {
        const newScore = totalScore + points;

        if (questions && currentIndex < questions.length - 1) {
            setTotalScore(newScore);
            setCurrentIndex(currentIndex + 1);
        } else {
            setTotalScore(newScore);
            setIsFinished(true);

            // Sauvegarde en BDD si l'utilisateur est connecté
            if (user) {
                try {
                    await saveResult({ testId: id as string, score: newScore });
                } catch (error) {
                    console.error("Erreur de sauvegarde", error);
                }
            }
        }
    };

    // Logique DYNAMIQUE pour trouver le résultat en fonction des règles créées par l'admin
    const getDynamicResult = () => {
        if (!currentTest || !currentTest.rules) return null;

        // On cherche la règle où le score est compris entre minScore et maxScore
        const matchedRule = currentTest.rules.find(
            (rule: any) => totalScore >= rule.minScore && totalScore <= rule.maxScore
        );

        return matchedRule || currentTest.rules[0]; // Fallback si bug
    };

    if (loadingQuestions) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.zen.sage} />
            </SafeAreaView>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={{ color: Colors.zen.dark }}>Ce test n'a pas encore de questions.</Text>
                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
                    <Text style={{ color: Colors.zen.sage, fontWeight: 'bold' }}>Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentIndex];
    const result = getDynamicResult();

    return (
        <SafeAreaView style={styles.container}>
            {/* Bouton retour custom au-dessus du logo */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.zen.dark} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {!isFinished ? (
                    <View style={styles.testContainer}>
                        <View style={styles.headerRow}>
                            <ClipboardList size={24} color={Colors.zen.sage} />
                            <Text style={styles.progressText}>Question {currentIndex + 1} / {questions.length}</Text>
                        </View>

                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
                        </View>

                        <Text style={styles.questionText}>{currentQuestion.text}</Text>

                        <View style={styles.answersContainer}>
                            {currentQuestion.answers?.map((answer: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.answerButton}
                                    onPress={() => handleAnswer(answer.points)}
                                >
                                    <Text style={styles.answerText}>{answer.label}</Text>
                                    <ArrowRight size={18} color={Colors.zen.sage} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultPretitle}>Bilan : {currentTest?.title}</Text>

                        {result && (
                            <>
                                <Text style={[styles.resultTitle, { color: result.color || Colors.zen.sage }]}>
                                    {result.title}
                                </Text>

                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreNumber}>{totalScore}</Text>
                                    <Text style={styles.scoreLabel}>points</Text>
                                </View>

                                <Text style={styles.resultDescription}>{result.description}</Text>
                            </>
                        )}

                        {!user && (
                            <Text style={[styles.disclaimer, { color: '#F59E0B', fontWeight: 'bold' }]}>
                                Connectez-vous pour sauvegarder votre historique !
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/(tabs)/diagnostics')}
                        >
                            <Text style={styles.actionButtonText}>Terminer et quitter</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    backButton: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },

    testContainer: { backgroundColor: Colors.zen.white, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginTop: 10 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    progressText: { fontSize: 14, fontWeight: 'bold', color: Colors.zen.sky, textTransform: 'uppercase' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(139, 168, 137, 0.2)', borderRadius: 4, marginBottom: 25, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: Colors.zen.sage },

    questionText: { fontSize: 20, fontWeight: 'bold', color: Colors.zen.dark, lineHeight: 28, marginBottom: 30 },
    answersContainer: { gap: 12 },
    answerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(139, 168, 137, 0.05)', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(139, 168, 137, 0.2)' },
    answerText: { fontSize: 16, fontWeight: '600', color: Colors.zen.dark },

    resultContainer: { backgroundColor: Colors.zen.white, padding: 30, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, marginTop: 10 },
    resultPretitle: { fontSize: 12, fontWeight: 'bold', color: Colors.zen.sky, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
    resultTitle: { fontSize: 26, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    scoreBox: { backgroundColor: Colors.zen.cream, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
    scoreNumber: { fontSize: 40, fontWeight: '900', color: Colors.zen.dark },
    scoreLabel: { fontSize: 12, color: Colors.zen.sky, fontWeight: 'bold', textTransform: 'uppercase' },
    resultDescription: { fontSize: 16, color: Colors.zen.dark, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
    disclaimer: { fontSize: 12, textAlign: 'center', marginBottom: 30 },

    actionButton: { backgroundColor: Colors.zen.sage, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, width: '100%', alignItems: 'center' },
    actionButtonText: { color: Colors.zen.white, fontSize: 16, fontWeight: 'bold' },
});