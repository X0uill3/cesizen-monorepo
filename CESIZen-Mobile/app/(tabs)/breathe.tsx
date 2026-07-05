import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wind } from 'lucide-react-native';
import LogoHeader from '../../components/LogoHeader';

const { width } = Dimensions.get('window');

const PROFILES = [
    { id: '748', label: '7-4-8', inspire: 7, apnee: 4, expire: 8 },
    { id: '55',  label: '5-5',   inspire: 5, apnee: 0, expire: 5 },
    { id: '46',  label: '4-6',   inspire: 4, apnee: 0, expire: 6 },
] as const;

type Profile = typeof PROFILES[number];

export default function BreatheScreen() {
    const [isBreathing, setIsBreathing] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile>(PROFILES[1]);
    const [instruction, setInstruction] = useState('Prêt à vous détendre ?');
    const [countdown, setCountdown] = useState(5);

    const scale = useRef(new Animated.Value(1)).current;
    const numberScale = useRef(new Animated.Value(1)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const isRunningRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const buildAnimation = (profile: Profile): Animated.CompositeAnimation => {
        const seq: Animated.CompositeAnimation[] = [
            Animated.timing(scale, {
                toValue: 2.5,
                duration: profile.inspire * 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ];
        if (profile.apnee > 0) {
            seq.push(Animated.delay(profile.apnee * 1000));
        }
        seq.push(Animated.timing(scale, {
            toValue: 1,
            duration: profile.expire * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }));
        return Animated.loop(Animated.sequence(seq));
    };

    const runCountdown = useCallback((duration: number, label: string, onDone: () => void) => {
        setInstruction(label);
        setCountdown(duration);
        let remaining = duration - 1;

        const tick = () => {
            if (!isRunningRef.current) return;
            numberScale.setValue(0.7);
            Animated.spring(numberScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
            setCountdown(remaining);
            if (remaining <= 0) {
                onDone();
            } else {
                remaining--;
                timeoutRef.current = setTimeout(tick, 1000);
            }
        };
        timeoutRef.current = setTimeout(tick, 1000);
    }, [numberScale]);

    const runCycle = useCallback((profile: Profile) => {
        const phases: { label: string; duration: number }[] = [
            { label: 'Inspirez profondément...', duration: profile.inspire },
            ...(profile.apnee > 0 ? [{ label: 'Retenez votre souffle...', duration: profile.apnee }] : []),
            { label: 'Expirez doucement...', duration: profile.expire },
        ];

        let idx = 0;
        const nextPhase = () => {
            if (!isRunningRef.current) return;
            const { label, duration } = phases[idx % phases.length];
            idx++;
            runCountdown(duration, label, nextPhase);
        };
        nextPhase();
    }, [runCountdown]);

    const stopBreathing = useCallback(() => {
        isRunningRef.current = false;
        setIsBreathing(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        animationRef.current?.stop();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        setInstruction('Prêt à vous détendre ?');
    }, [scale]);

    const startBreathing = useCallback((profile: Profile) => {
        isRunningRef.current = true;
        setIsBreathing(true);
        setCountdown(profile.inspire);
        animationRef.current = buildAnimation(profile);
        animationRef.current.start();
        runCycle(profile);
    }, [runCycle]);

    const toggleBreathing = () => {
        if (isBreathing) {
            stopBreathing();
        } else {
            startBreathing(selectedProfile);
        }
    };

    const handleProfileSelect = (profile: Profile) => {
        if (isBreathing) stopBreathing();
        setSelectedProfile(profile);
        setCountdown(profile.inspire);
    };

    useEffect(() => {
        return () => {
            isRunningRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 20, paddingTop: 13 }}>
                <LogoHeader />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Cohérence Cardiaque</Text>
                <Text style={styles.subtitle}>{instruction}</Text>

                {/* Sélection du profil */}
                <View style={styles.profileRow}>
                    {PROFILES.map((p) => {
                        const active = selectedProfile.id === p.id;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                onPress={() => handleProfileSelect(p)}
                                style={[styles.profileBtn, active && styles.profileBtnActive]}
                            >
                                <Text style={[styles.profileLabel, active && styles.profileLabelActive]}>
                                    {p.label}
                                </Text>
                                <Text style={[styles.profileDesc, active && styles.profileDescActive]}>
                                    {p.inspire}s {p.apnee > 0 ? `· ${p.apnee}s · ` : '· '}{p.expire}s
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.circleContainer}>
                    <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
                    <View style={styles.circleCenter}>
                        {isBreathing ? (
                            <Animated.Text style={[styles.countdownText, { transform: [{ scale: numberScale }] }]}>
                                {countdown}
                            </Animated.Text>
                        ) : (
                            <Wind size={40} color={Colors.zen.sage} />
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, isBreathing && styles.buttonStop]}
                    onPress={toggleBreathing}
                >
                    <Text style={styles.buttonText}>
                        {isBreathing ? 'Arrêter' : "Commencer l'exercice"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 30, paddingHorizontal: 20 },

    title: { fontSize: 24, fontWeight: 'bold', color: Colors.zen.dark },
    subtitle: { fontSize: 16, color: Colors.zen.sky, marginTop: 6, fontStyle: 'italic', textAlign: 'center', minHeight: 22 },

    profileRow: { flexDirection: 'row', gap: 10, width: '100%' },
    profileBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: Colors.zen.white,
        borderWidth: 1.5,
        borderColor: 'rgba(139, 168, 137, 0.2)',
    },
    profileBtnActive: { backgroundColor: Colors.zen.sage, borderColor: Colors.zen.sage },
    profileLabel: { fontSize: 15, fontWeight: 'bold', color: Colors.zen.dark },
    profileLabelActive: { color: Colors.zen.white },
    profileDesc: { fontSize: 11, color: Colors.zen.sky, marginTop: 2 },
    profileDescActive: { color: 'rgba(255,255,255,0.75)' },

    circleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    circleCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    circle: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: (width * 0.3) / 2,
        backgroundColor: 'rgba(139, 168, 137, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(139, 168, 137, 0.5)',
    },
    countdownText: { fontSize: 48, fontWeight: '900', color: Colors.zen.sage },

    button: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: Colors.zen.sage,
        paddingVertical: 18,
        borderRadius: 30,
        shadowColor: Colors.zen.sage,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonStop: { backgroundColor: '#E74C3C', shadowColor: '#E74C3C' },
    buttonText: { color: Colors.zen.white, fontSize: 18, fontWeight: 'bold' },
});
