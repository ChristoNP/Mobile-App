import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/auth';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../query/users';
import * as SecureStore from "expo-secure-store";

export default function Login({ navigation }) {
    const { setIsSignedIn } = useContext(AuthContext);
    const [loginFn, { loading }] = useMutation(LOGIN);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const validateInputs = () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return false;
        }
        return true;
    };
    return (
        <SafeAreaView style={styles.container}>
            <Image
                style={styles.header}
                source={{ uri: 'https://logowik.com/content/uploads/images/facebook-new-wordmark-20237628.logowik.com.webp' }}
            />
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
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={async () => {
                        if (validateInputs()) {
                            try {
                                const result = await loginFn({
                                    variables: {
                                        username,
                                        password,
                                    },
                                });
                                await SecureStore.setItemAsync('access_token', result.data.login.accessToken);
                                setIsSignedIn(true);
                            } catch (error) {
                                if (error.networkError) {
                                    Alert.alert('Network Error', 'Please check your internet connection.');
                                } else if (error.graphQLErrors.length > 0) {
                                    Alert.alert('Login Error', error.graphQLErrors[0].message);
                                } else {
                                    Alert.alert('Error', 'An unexpected error occurred.');
                                }
                                console.log('Error login:', error);
                            }
                        }
                    }}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Login...' : 'Login'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                    Don't have an account? <Text style={styles.registerLink}>Register here</Text>
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
    header: {
        width: 300,
        height: 50,
        marginBottom: 40,
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
        borderRadius: 5,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#0666FE',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerText: {
        color: '#888',
        textAlign: 'center',
    },
    registerLink: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
});
