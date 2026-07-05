import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }
        try {
            await login({ email, password });
            // Redirection gérée par le RootLayout
        } catch (error: any) {
            // On affiche le message d'erreur précis renvoyé par le store
            Alert.alert("Erreur de connexion", error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <Text style={styles.logo}>CESIZen</Text>
                <Text style={styles.subtitle}>Retrouvez votre équilibre.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.zen.sage}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor={Colors.zen.sage}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.zen.cream} />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.linkText}>
                        Pas encore de compte ? <Text style={{ color: Colors.zen.sky, fontWeight: 'bold' }}>Inscrivez-vous</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.zen.cream, // Fond clair pour CESIZen
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logo: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.zen.sage, // Couleur principale
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 10,
    },
    subtitle: {
        color: Colors.zen.dark,
        textAlign: 'center',
        marginBottom: 40,
        fontSize: 16,
    },
    input: {
        backgroundColor: '#FFFFFF', // Fond blanc pour les inputs
        color: Colors.zen.dark,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 168, 137, 0.3)', // Bordure légèrement sage
    },
    button: {
        backgroundColor: Colors.zen.sage, // Bouton vert sage
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.zen.sage,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: Colors.zen.cream,
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkText: {
        color: Colors.zen.dark,
        textAlign: 'center',
        marginTop: 20,
    }
});