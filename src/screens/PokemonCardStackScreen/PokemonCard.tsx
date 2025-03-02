import React from 'react';
import { StyleSheet, Text, Image } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, Circle, Extrapolate, Path } from '@shopify/react-native-skia';

import Animated, * as Reanimated from 'react-native-reanimated';

import { PokemonDetailsListItem, PokemonNameListItem } from '../../services/PokemonDataServiceTypes';


export type OnPokemonCardSwipeRightEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type OnPokemonCardSwipeCompletedEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type PokemonCardProps = {
  // 0 = back
  stackIndex: number;
  stackSizeCount: number;

  stackIndexAnimated: Reanimated.SharedValue<number>;

  pokemonNameItem: PokemonNameListItem;
  pokemonDetailItem: PokemonDetailsListItem | undefined;

  onSwipeRight: OnPokemonCardSwipeRightEvent;
  onSwipeComplete: OnPokemonCardSwipeCompletedEvent;
};

const SWIPE_THRESHOLD_X = 150;
const STACK_MARGIN_TOP = 15;


type StackPositionMode =
  | 'bottomOfStack'
  | 'secondToBottomOfStack'
  | 'inBetweenOfStack'
  | 'secondToTopOfStack'
  | 'topOfStack';

export function PokemonCard(props: PokemonCardProps) {
  const MAX_XP = 563;

  const [stackIndex, setStackIndex] = React.useState(props.stackIndex);

  const currentStackPosition: StackPositionMode = (() => {
    if(stackIndex === props.stackSizeCount){
      return 'bottomOfStack';
    };

    if(stackIndex === (props.stackSizeCount - 1)){
      return 'secondToBottomOfStack';
    };

    const isTopMostInStack = stackIndex === 0;
    if(isTopMostInStack){
      return 'topOfStack';
    };

    const isSecondToTopOfStack = stackIndex === 1;
    if(isSecondToTopOfStack){
      return 'secondToTopOfStack';
    };

    return 'inBetweenOfStack';
  })();

  const stackIndexAdj = Math.max(0, stackIndex - 1);

  const MARGIN_TOP_CURRENT = (() => {
    switch (currentStackPosition) {
      case 'bottomOfStack':
      case 'secondToBottomOfStack':
        return 0;

      default:
        return stackIndexAdj * STACK_MARGIN_TOP
    }
  })();

  const MARGIN_TOP_NEXT = (() => {
    switch (currentStackPosition) {
      case 'bottomOfStack':
        return 0;
        
      default:
        return (stackIndexAdj + 1) * STACK_MARGIN_TOP;
    }
  })();

  false && console.log({
    stackIndexAdj,
    currentStackPosition,
    stackIndex: stackIndex,
    MARGIN_TOP_CURRENT,
    MARGIN_TOP_NEXT,
  });

  const offsetGestureX = Reanimated.useSharedValue(0);
  const offsetGestureY = Reanimated.useSharedValue(0);
  const offsetRotate = Reanimated.useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const gesturePercent = event.translationX / SWIPE_THRESHOLD_X;

      offsetGestureX.value = event.translationX;
      offsetGestureY.value = event.translationY;

      offsetRotate.value = gesturePercent * 15;

      props.stackIndexAnimated.value = Reanimated.interpolate(
        gesturePercent,
        [0, 1],
        [props.stackIndex, props.stackIndex + 0.8]
      );
    })
    .onEnd((event) => {
      const didReachSwipeThreshold = 
        event.translationX > SWIPE_THRESHOLD_X;

      if(!didReachSwipeThreshold){
        offsetGestureX.value = Reanimated.withSpring(0);
        offsetGestureY.value = Reanimated.withSpring(0)
        offsetRotate.value = Reanimated.withSpring(0);
        return;
      };

      offsetGestureX.value = Reanimated.withSpring(
        Math.sign(event.velocityX) * 500, 
        { velocity: event.velocityX }
      );

        props.stackIndexAnimated.value = 
          Reanimated.withSpring(props.stackIndex + 1);

        Reanimated.runOnJS(props.onSwipeComplete)(props.pokemonNameItem);
    });

  const animatedStyle = Reanimated.useAnimatedStyle(() => {
    const stackIndexReversed = 
      props.stackSizeCount - props.stackIndexAnimated.value;

    const stackOffsetY = Reanimated.interpolate(
      props.stackIndexAnimated.value, 
      [stackIndexAdj - 1, stackIndexAdj, stackIndexAdj + 1],
      [
        MARGIN_TOP_CURRENT - STACK_MARGIN_TOP, 
        MARGIN_TOP_CURRENT, 
        MARGIN_TOP_NEXT
      ]
    );

    const totalOffsetY = stackOffsetY + offsetGestureY.value;

    return ({
      transform: [
        { translateX: offsetGestureX.value },
        { translateY: totalOffsetY },
        { rotate: `${offsetRotate.value} deg` },
      ],
    });
  });

  // wip
  const baseExp = 0;
  const pokemonExpPercent = baseExp / MAX_XP;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[
        styles.card,
        {
          zIndex: props.stackSizeCount - props.stackIndex,
        },
        animatedStyle
      ]}>
        <Image
          style={styles.image}
          source={{ 
            uri: props.pokemonDetailItem?.sprites.front_default,
          }}
        />
        <Text style={styles.name}>
          {props.pokemonNameItem.pokemonName}
        </Text>
        <Text>
          {stackIndex}
          {currentStackPosition}
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
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'absolute',
    width: '100%',
    maxWidth: 350, 
    alignSelf: 'center',
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