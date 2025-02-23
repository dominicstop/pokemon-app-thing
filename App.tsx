import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PokemonAPI } from './src/services/PokemonAPI';
import usePokemonData from './src/hooks/UsePokemonData';

export default function App() {
  const { isLoading } = usePokemonData();
  
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
