import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { usePokemonContext } from '../../hooks/UsePokemonDataContext';
import { OnPokemonCardSwipeCompletedEvent, OnPokemonCardSwipeRightEvent, PokemonCard } from './PokemonCard';


export function PokemonCardStackScreen() {
  const { pokemonNamesList, pokemonDetailsMap } = usePokemonContext();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleSwipeRight: OnPokemonCardSwipeRightEvent = (pokemonNameItem) => {
    console.log(`Liked: ${pokemonNameItem.pokemonID}`);
  };
  
  const handleSwipeComplete: OnPokemonCardSwipeCompletedEvent = (pokemonNameItem) => {
    setCurrentIndex(prev => prev + 1);
  };
  
  const MAX_VISIBLE_CARDS = 4;

  const visibleCardsList = pokemonNamesList
    .slice(currentIndex, currentIndex + MAX_VISIBLE_CARDS)
    .reverse(); 

  const visibleCardsCount = visibleCardsList.length;
  const hasCardsToShow = visibleCardsCount > 0;

  switch(hasCardsToShow){
    case true:
      return (
        <View style={styles.cardStack}>
          {visibleCardsList.map((item, index) => {
            const pokemonDetails = pokemonDetailsMap[item.pokemonID];
            const isCardTopMost = index === 0;
            
            return (
              <View 
                key={`${item.pokemonID}`} 
                style={[
                  styles.cardContainer,
                  !isCardTopMost && styles.stackedCard,
                  {
                    top: index * 10,
                    zIndex: index
                  }
                ]}
              >
                <PokemonCard
                  isTopMost={isCardTopMost}
                  pokemonNameItem={item}
                  pokemonDetailItem={pokemonDetails}
                  onSwipeRight={handleSwipeRight}
                  onSwipeComplete={handleSwipeComplete}
                />
              </View>
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
    width: '100%',
    height: 400, 
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    maxWidth: 350, 
    alignSelf: 'center',
  },
  stackedCard: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
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