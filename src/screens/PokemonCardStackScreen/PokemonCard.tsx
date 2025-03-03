import React from 'react';
import { StyleSheet, Text, Image } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, Circle, Extrapolate, Path } from '@shopify/react-native-skia';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  SharedValue,
  interpolate,
} from 'react-native-reanimated';

import { PokemonDetailsListItem, PokemonNameListItem } from '../../services/PokemonDataServiceTypes';


export type OnPokemonCardSwipeRightEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type OnPokemonCardSwipeCompletedEvent = 
  (pokemonNameItem: PokemonNameListItem) => void;

export type PokemonCardProps = {
  // 0 = back
  stackIndex: number;
  stackMaxVisibleCount: number;

  sharedSwipeProgressPercent: SharedValue<number>;

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
    if(stackIndex === 0){
      return 'bottomOfStack';
    };

    if(stackIndex === 1){
      return 'secondToBottomOfStack';
    };

    const isTopMostInStack = 
      stackIndex === (props.stackMaxVisibleCount - 1);

    if(isTopMostInStack){
      return 'topOfStack';
    };

    const isSecondToTopOfStack = 
      stackIndex === (props.stackMaxVisibleCount - 2);

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

  const tempStackOffsetY = useSharedValue(0);

  const offsetGestureX = useSharedValue(0);
  const offsetGestureY = useSharedValue(0);
  const offsetRotate = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const gesturePercent = event.translationX / SWIPE_THRESHOLD_X;

      offsetGestureX.value = event.translationX;
      offsetGestureY.value = event.translationY;

      offsetRotate.value = gesturePercent * 15;

      props.sharedSwipeProgressPercent.value = interpolate(
        event.translationX, 
        [0, SWIPE_THRESHOLD_X], 
        [0, 1],
        {
          extrapolateLeft: Extrapolate.CLAMP,
          extrapolateRight: Extrapolate.CLAMP,
        }
      );
    })
    .onEnd((event) => {
      const didReachSwipeThreshold = 
        event.translationX > SWIPE_THRESHOLD_X;

      if(!didReachSwipeThreshold){
        // reset
        props.sharedSwipeProgressPercent.value = withSpring(0);

        offsetGestureX.value = withSpring(0);
        offsetGestureY.value = withSpring(0)
        offsetRotate.value = withSpring(0);
        return;
      };

      offsetGestureX.value = withSpring(500);

      props.sharedSwipeProgressPercent.value = withSpring(1, undefined, () => {
        // tempStackOffsetY.value = MARGIN_TOP_NEXT;
        // props.sharedSwipeProgressPercent.value = 0;
        
        // runOnJS(props.onSwipeRight)(props.pokemonNameItem);
        runOnJS(props.onSwipeComplete)(props.pokemonNameItem);
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const stackOffsetY = interpolate(
      props.sharedSwipeProgressPercent.value, 
      [0, 1],
      [MARGIN_TOP_CURRENT, MARGIN_TOP_NEXT]
    );

    const totalOffsetY = tempStackOffsetY.value > 0
      ? tempStackOffsetY.value
      : stackOffsetY + offsetGestureY.value;

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
          zIndex: stackIndex
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