import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { useSharedValue } from 'react-native-reanimated';

import { usePokemonContext } from '../../hooks/UsePokemonDataContext';
import { OnPokemonCardSwipeCompletedEvent, OnPokemonCardSwipeRightEvent, PokemonCard } from './PokemonCard';
import { PokemonNameList } from '../../services/PokemonDataServiceTypes';


const MAX_VISIBLE_CARDS = 5;



export function PokemonCardStackScreen() {
  const { pokemonNamesList, pokemonDetailsMap } = usePokemonContext();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [pokemonStack, setPokemonStack] = React.useState<PokemonNameList>([]);

  React.useEffect(() => {
    if(pokemonNamesList.length < MAX_VISIBLE_CARDS * 2){
      return;
    };

    const isPokemonStackEmpty = pokemonStack.length == 0;
    if(!isPokemonStackEmpty){
      return;
    };

    const nextPokemonList = 
      pokemonNamesList.slice(currentIndex, currentIndex + MAX_VISIBLE_CARDS);

    setPokemonStack(nextPokemonList);
  }, [pokemonNamesList]);
  
  // 0...1
  const swipeProgressPercent = useSharedValue(0);

  const handleSwipeRight: OnPokemonCardSwipeRightEvent = (pokemonNameItem) => {
    console.log(`Liked: ${pokemonNameItem.pokemonID}`);
  };
  
  const handleSwipeComplete: OnPokemonCardSwipeCompletedEvent = (pokemonNameItem) => {
    const nextIndex = currentIndex + 1;

    console.log('pokemonStack.leng:',pokemonStack.length)

    const pokemonStackNext = pokemonStack.filter((item) => (item.pokemonID !== pokemonNameItem.pokemonID));


    setPokemonStack([
      pokemonNamesList[nextIndex + MAX_VISIBLE_CARDS],
      ...pokemonStackNext
    ]);
    
    setCurrentIndex(nextIndex);
  };

  const visibleCardsCount = pokemonStack.length;
  const hasCardsToShow = visibleCardsCount > 0;

  switch(hasCardsToShow){
    case true:
      return (
        <View style={styles.cardStack}>
          {pokemonStack.map((item, index) => {
            const pokemonDetails = pokemonDetailsMap[item.pokemonID];

            return (
              <PokemonCard
                key={`${item.pokemonID}`} 
                stackIndex={index}
                stackMaxVisibleCount={MAX_VISIBLE_CARDS}
                sharedSwipeProgressPercent={swipeProgressPercent}
                pokemonNameItem={item}
                pokemonDetailItem={pokemonDetails}
                onSwipeRight={handleSwipeRight}
                onSwipeComplete={handleSwipeComplete}
              />
            );
          })}
        </View>
      );

    case false:
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more Pokémon to display!</Text>
        </View>
      );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cardStack: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  }
});