import { PokemonIDToNameMapEntry, PokemonIDToPokemonDetailsMapEntry } from "./PokemonStoreTypes";


export type PokemonNameListItem = PokemonIDToNameMapEntry;
export type PokemonNameList = Array<PokemonNameListItem>;

export type PokemonDetailsListItem = PokemonIDToPokemonDetailsMapEntry;
export type PokemonDetailsList = Array<PokemonDetailsListItem>;

export type PokemonNameListState = {
  mode: 'NOT_LOADED'
} | {
  mode: 'LOADING_LOCAL';
} | {
  mode: 'PREPARE_LOADING_REMOTE'
} | {
  mode: 'LOADING_REMOTE';
  totalItemsToLoad: number;
  totalItemsLoaded: number;
  remainingItemsToLoad: number;
  loadingProgressPercent: number;
} | {
  mode: 'LOADED'
} | {
  mode: 'FAILED'
};

export type PokemonDetailsListState = {
  mode: 'NOT_LOADED'
} | {
  mode: 'LOADING_LOCAL';
} | {
  mode: 'LOADING_REMOTE';
  totalItemsToLoad: number;
  totalItemsLoaded: number;
  remainingItemsToLoad: number;
  loadingProgressPercent: number;
} | {
  mode: 'LOADED'
} | {
  mode: 'FAILED'
};

export type PokemonDataServiceState = {
  pokemonNameListState: PokemonNameListState;
  pokemonDetailsListState: PokemonDetailsListState;
};