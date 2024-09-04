import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../query/users';

export default function Register({ navigation }) {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerfn, { loading, error }] = useMutation(REGISTER);

    const validateInputs = () => {
        if (!username || !name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return false;
        }
        return true;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image 
                style={styles.logo}
                source={{ uri: 'https://logowik.com/content/uploads/images/facebook-new-wordmark-20237628.logowik.com.webp' }}
            />
            <Text style={styles.header}>Create a New Account</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                />
            </View>
            <TouchableOpacity 
                style={styles.buttonContainer}
                onPress={async () => {
                    if (validateInputs()) {
                        try {
                            const result = await registerfn({
                                variables: {
                                    form: {
                                        username: username,
                                        name: name,
                                        email: email,
                                        password: password
                                    }
                                }
                            });
                            console.log(result, '<<< register');
                            navigation.navigate('Login');
                        } catch (error) {
                            console.log(error, '<<< error');
                        }
                    }
                }}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Signing Up..' : 'Sign Up'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerText}>
                    Already have an account? <Text style={styles.registerLink}>Login Here</Text>
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        marginTop: -80,
    },
    logo: {
        width: 200,
        height: 50,
        marginBottom: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    inputContainer: {
        width: '80%',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        width: '80%',
        backgroundColor: '#0666FE',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    registerText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 10
    },
    registerLink: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
});
