import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Navigation from './components/Navigation';
import { ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './context/auth';
import apolloClient from './components/apolloClient';

export default function App() {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <Navigation />
      </ApolloProvider>
    </AuthProvider>
  );
}
