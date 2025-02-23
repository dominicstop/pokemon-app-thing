import { PokemonIdToNameMap } from "./PokemonStoreTypes";


export type PokemonNameList = Array<PokemonIdToNameMap[string]>;
export type PokemonNameListItem = PokemonNameList[number];

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

export type PokemonDataServiceState = {
  pokemonNameListState: PokemonNameListState;
};