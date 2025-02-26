import React from 'react';
import { StyleSheet } from 'react-native';

import { PokemonProvider } from './src/context/PokemonDataContext';


export default function App() {
  return (
    <PokemonProvider>
    </PokemonProvider>
  );
}

const styles = StyleSheet.create({
});
