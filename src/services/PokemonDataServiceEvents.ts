import type { TSEventEmitter } from '@dominicstop/ts-event-emitter';
import type { RemapObject } from 'react-native-ios-utilities';
import { PokemonIdToNameMap } from './PokemonStoreTypes';
import { PokemonNameList } from './PokemonDataServiceTypes';

export enum PokemonDataServiceEvents  {
  onPokemonNameListDidChange = "onPokemonNameListDidChange"
};

export type PokemonDataServiceEventKeys = keyof typeof PokemonDataServiceEvents;

export type PokemonDataServiceEventEmitterMap = RemapObject<typeof PokemonDataServiceEvents, {
  onPokemonNameListDidChange: {
    pokemonNameListSorted: PokemonNameList;
    pokemonNameMap: PokemonIdToNameMap;
  };
}>;

export type PokemonDataServiceEventEmitter = TSEventEmitter<
  PokemonDataServiceEvents,
  PokemonDataServiceEventEmitterMap
>;
