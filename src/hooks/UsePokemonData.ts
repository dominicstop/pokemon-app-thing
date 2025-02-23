import * as React from 'react';
import { PokemonDataService } from '../services/PokemonDataService';
import { PokemonNameList } from '../services/PokemonDataServiceTypes';
import { PokemonIDToPokemonDetailsMap } from '../services/PokemonStoreTypes';
import { PokemonStore } from '../services/PokemonStore';

function usePokemonData() {
  const [isLoading, setIsLoading] = React.useState(true);

  const [
    pokemonDetailsMap, 
    setPokemonDetailsMap
  ] = React.useState<PokemonIDToPokemonDetailsMap>({});

  const [
    pokemonNamesList, 
    setPokemonNamesList
  ] = React.useState<PokemonNameList>([]);

  const pokemonDataServiceRef = React.useRef<PokemonDataService | null>(null);

  // componentWillMount
  React.useEffect(() => {
    const pokemonService = new PokemonDataService();
    pokemonDataServiceRef.current = pokemonService;

    pokemonService.eventEmitter.addListener('onPokemonNameListDidChange', (event) => {
      setPokemonNamesList(event.pokemonNameListSorted);
    });

    pokemonService.eventEmitter.addListener('onPokemonDetailListDidChange', (event) => {
      setPokemonDetailsMap(event.pokemonDetailsMap);
    });

    //PokemonStore.clearAllCache();

    const loadPokemonData = async () => {
      try {
        await pokemonService.initialize();

      } catch (error) {
        console.error(error);
        
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemonData();
  }, []);

  return { 
    isLoading,
    pokemonDetailsMap, 
    pokemonNamesList,
    pokemonDataServiceRef,
  };
}

export default usePokemonData;