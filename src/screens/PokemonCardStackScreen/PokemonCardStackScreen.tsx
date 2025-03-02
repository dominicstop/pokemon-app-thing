import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import * as Reanimated from 'react-native-reanimated';

import { usePokemonContext } from '../../hooks/UsePokemonDataContext';
import { OnPokemonCardSwipeCompletedEvent, OnPokemonCardSwipeRightEvent, PokemonCard } from './PokemonCard';
import { PokemonNameList } from '../../services/PokemonDataServiceTypes';


const MAX_VISIBLE_CARDS = 5;

export function PokemonCardStackScreen() {
  const { pokemonNamesList, pokemonDetailsMap } = usePokemonContext();

  const [ pokemonStack, setPokemonStack ] = React.useState<PokemonNameList>([]);

  const [ currentIndex, setCurrentIndex ] = React.useState(0);
  const animatedCurrentIndex = Reanimated.useSharedValue(0);

  Reanimated.useAnimatedReaction(
    () => animatedCurrentIndex.value,
    (value) => {
      if (Math.floor(value) !== currentIndex) {
        Reanimated.runOnJS(setCurrentIndex)(Math.floor(value));
      }
    }
  );

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
  

  const handleSwipeRight: OnPokemonCardSwipeRightEvent = (pokemonNameItem) => {
    console.log(`Liked: ${pokemonNameItem.pokemonID}`);
  };
  
  const handleSwipeComplete: OnPokemonCardSwipeCompletedEvent = (pokemonNameItem) => {
    const nextIndex = currentIndex + 1;
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
                stackIndexAnimated={animatedCurrentIndex}
                stackSizeCount={pokemonStack.length}
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