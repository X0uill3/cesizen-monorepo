import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function RegisterScreen() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2. Nouveaux états pour la date
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    // On garde birthdate (string) pour l'affichage et l'envoi API
    const [birthdate, setBirthdate] = useState('');

    const { register, isLoading } = useAuthStore();
    const router = useRouter();

    // 3. Fonctions de gestion de la modale
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (date: Date) => {
        // Cette fonction reçoit un objet Date JS natif.
        // On doit le formater en 'AAAA-MM-JJ' pour ton backend.
        const formattedDate = date.toISOString().split('T')[0];
        setBirthdate(formattedDate);
        hideDatePicker();
    };

    const handleRegister = async () => {
        if (!firstname || !lastname || !birthdate || !email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        try {
            await register({ firstname, lastname, email, password, birthdate });
        } catch (error: any) {
            Alert.alert("Erreur d'enregistrement", error.message || "Impossible de créer le compte.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>CESIZen</Text>
                    <Text style={styles.subtitle}>Rejoignez l'aventure et retrouvez votre équilibre.</Text>

                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Prénom"
                            placeholderTextColor={Colors.zen.sage}
                            value={firstname}
                            onChangeText={setFirstname}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Nom"
                            placeholderTextColor={Colors.zen.sage}
                            value={lastname}
                            onChangeText={setLastname}
                        />
                    </View>

                    {/* 4. LE CHAMP DE DATE DEVIENT UN BOUTON CLIQUABLE */}
                    <TouchableOpacity onPress={showDatePicker} style={styles.input}>
                        <Text style={[
                            styles.dateText,
                            { color: birthdate ? Colors.zen.dark : Colors.zen.sage }
                        ]}>
                            {birthdate ? birthdate : "Date de naissance (AAAA-MM-JJ)"}
                        </Text>
                    </TouchableOpacity>

                    {/* 5. LA MODALE NATIVE (Cachée par défaut) */}
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date" // On veut juste la date, pas l'heure
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                        locale="fr_FR" // Pour avoir les mois en français
                        confirmTextIOS="Confirmer"
                        cancelTextIOS="Annuler"
                        // Pour iOS, tu peux choisir 'spinner' (la roue) ou 'inline' (calendrier)
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        // Optionnel : Bloquer les dates futures
                        maximumDate={new Date()}
                    />

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
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.zen.cream} />
                        ) : (
                            <Text style={styles.buttonText}>S'inscrire</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.linkText}>
                            Déjà un compte ? <Text style={{ color: Colors.zen.sky, fontWeight: 'bold' }}>Connectez-vous</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.zen.cream },
    scrollContent: { flexGrow: 1 },
    inner: { flex: 1, justifyContent: 'center', padding: 24, marginTop: 40 },
    logo: { fontSize: 48, fontWeight: '900', color: Colors.zen.sage, textAlign: 'center', letterSpacing: 2, marginBottom: 10 },
    subtitle: { color: Colors.zen.dark, textAlign: 'center', marginBottom: 40, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    halfInput: { width: '48%' },
    input: {
        backgroundColor: '#FFFFFF',
        color: Colors.zen.dark,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 168, 137, 0.3)',
        justifyContent: 'center', // Pour le texte dans le TouchableOpacity
    },
    // Style spécifique pour le texte dans le faux input de date
    dateText: {
        fontSize: 15, // Match le style des TextInput
    },
    button: { backgroundColor: Colors.zen.sage, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: Colors.zen.sage, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    buttonText: { color: Colors.zen.cream, fontWeight: 'bold', fontSize: 16 },
    linkText: { color: Colors.zen.dark, textAlign: 'center', marginTop: 20 }
});