import type { TSEventEmitter } from '@dominicstop/ts-event-emitter';
import type { RemapObject } from 'react-native-ios-utilities';
import { PokemonIDToNameMap, PokemonIDToPokemonDetailsMap } from './PokemonStoreTypes';
import { PokemonDetailsList, PokemonNameList } from './PokemonDataServiceTypes';

// Section: Event Types

export type OnPokemonNameListDidChangeEventPayload = {
  pokemonNameListSorted: PokemonNameList;
  pokemonNameMap: PokemonIDToNameMap;
};

export type OnPokemonNameListDidChangeEvent = 
  (eventPayload: OnPokemonNameListDidChangeEventPayload) => void;

export type OnPokemonDetailListDidChangeEventPayload = {
  pokemonDetailsListSorted: PokemonDetailsList;
  pokemonDetailsMap: PokemonIDToPokemonDetailsMap;
};

export type OnPokemonDetailListDidChangeEvent = 
  (eventPayload: OnPokemonDetailListDidChangeEventPayload) => void;

// Section: Event Emitter
// ----------------------

export enum PokemonDataServiceEvents  {
  onPokemonNameListDidChange = "onPokemonNameListDidChange",
  onPokemonDetailListDidChange = "onPokemonDetailListDidChange",
};

export type PokemonDataServiceEventKeys = keyof typeof PokemonDataServiceEvents;

export type PokemonDataServiceEventEmitterMap = RemapObject<typeof PokemonDataServiceEvents, {
  onPokemonNameListDidChange: OnPokemonNameListDidChangeEventPayload;
  onPokemonDetailListDidChange: OnPokemonDetailListDidChangeEventPayload;
}>;

export type PokemonDataServiceEventEmitter = TSEventEmitter<
  PokemonDataServiceEvents,
  PokemonDataServiceEventEmitterMap
>;