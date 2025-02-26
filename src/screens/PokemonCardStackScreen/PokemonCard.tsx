import React from 'react';
import { StyleSheet, Text, Image } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, Circle, Path } from '@shopify/react-native-skia';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { PokemonDetailsListItem, PokemonNameListItem } from '../../services/PokemonDataServiceTypes';


export type OnPokemonCardSwipeRightEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type OnPokemonCardSwipeCompletedEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type PokemonCardProps = {
  isTopMost: boolean;

  pokemonNameItem: PokemonNameListItem;
  pokemonDetailItem: PokemonDetailsListItem | undefined;

  onSwipeRight: OnPokemonCardSwipeRightEvent;
  onSwipeComplete: OnPokemonCardSwipeCompletedEvent;
};

export function PokemonCard(props: PokemonCardProps) {
  const MAX_XP = 563;
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = (event.translationX / 100) * Math.PI / 8;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        translateX.value = withSpring(500);
        runOnJS(props.onSwipeRight)(props.pokemonNameItem);
        runOnJS(props.onSwipeComplete)(props.pokemonNameItem);

      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      };
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}rad` },
    ],
  }));

  // wip
  const baseExp = 0;
  const pokemonExpPercent = baseExp / MAX_XP;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          style={styles.image}
          source={{ 
            uri: props.pokemonDetailItem?.sprites.front_default,
          }}
        />
        <Text style={styles.name}>
          {props.pokemonNameItem.pokemonName}
        </Text>
        <Canvas style={styles.canvas}>
          <Circle
            cx={75}
            cy={75}
            r={50}
            color="#E0E0E0"
            style="stroke"
            strokeWidth={10}
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
    textTransform: 'capitalize',
  },
  canvas: {
    width: 150,
    height: 150,
  },
});