import React from 'react';

import { PokemonDataService } from '../services/PokemonDataService';
import { PokemonNameList } from '../services/PokemonDataServiceTypes';
import { PokemonIDToPokemonDetailsMap } from '../services/PokemonStoreTypes';

import usePokemonData from '../hooks/UsePokemonData';


export type PokemonContextPayload = {
  isLoading: boolean;
  pokemonDetailsMap: PokemonIDToPokemonDetailsMap;
  pokemonNamesList: PokemonNameList;
  pokemonDataServiceRef: React.RefObject<PokemonDataService>;
}

export const PokemonContext = 
  React.createContext<PokemonContextPayload | undefined>(undefined);

export function PokemonProvider(props: React.PropsWithChildren) {
  const pokemonData = usePokemonData();

  return (
    <PokemonContext.Provider
      value={{...pokemonData}}
    >
      {props.children}
    </PokemonContext.Provider>
  );
};