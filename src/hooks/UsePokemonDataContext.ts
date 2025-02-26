import React from 'react';
import { PokemonContext, PokemonContextPayload } from '../context/PokemonDataContext';


export function usePokemonContext(): PokemonContextPayload {
  const context = React.useContext(PokemonContext);

  if (!context) {
    throw new Error('usePokemonContext must be used within a PokemonProvider');
  };

  return context;
};