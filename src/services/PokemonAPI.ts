import { CommonHelpers } from '../utils/CommonHelpers';
import { PokemonDetailsResponse, PokemonListResponseEntry, PokemonListResponse } from './PokemonAPITypes';

export const BASE_URL_POKEAPI = 'https://pokeapi.co/api/v2';

export class PokemonAPI {

  static async fetchPokemonData<T extends Record<string, unknown>>(
    endpoint: string
  ): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL_POKEAPI}/${endpoint}`);

      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon data');
      };

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    };
  };

  // Section: Raw API
  // ----------------

  static async getPokemonList(
    limit: number = 20, 
    offset: number = 0
  ): Promise<PokemonListResponse> {
    
    try {
      return await this.fetchPokemonData(
        `pokemon?limit=${limit}&offset=${offset}`
      );

    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw error;
    };
  };

  static async getPokemonDetails(
    idOrName: string | number
  ): Promise<PokemonDetailsResponse> {
    try {
      return await this.fetchPokemonData(`pokemon/${idOrName}`);

    } catch (error) {
      console.error(`Error fetching Pokemon details for ${idOrName}:`, error);
      throw error;
    }
  };

  // Section: API w/ Extra Logic
  // ---------------------------

  static async getPokemonListAll(
    options?: {
      limitPerBatch: number,
      delayPerBatchInMS: number,
    },
    onUpdateCallback?: (args: {
      listNewItems: Array<PokemonListResponseEntry>;
      listTotalItems: number;
      listCurrentItems: number;
      listRemainingItems: number;
      listProgressPercent: number;
    }) => void
  ): Promise<Array<PokemonListResponseEntry>> {

    const optionsWithDefaults = {
      limitPerBatch: 100,
      delayPerBatchInMS: __DEV__ ? 1000 : 300,
      ...options,
    };

    try {
      const pokemonListItems: Array<PokemonListResponseEntry> = [];
      let listOffset = 0;

      while (true) {
        const response = await this.getPokemonList(
          optionsWithDefaults.limitPerBatch, 
          listOffset
        );
        
        const pokemonList = response.results;
        pokemonListItems.push(...pokemonList);

        const listTotalItems = response.count;
        const listCurrentItems = pokemonListItems.length;
        const listRemainingItems = Math.min(0, listTotalItems - listCurrentItems);
        const listProgressPercent =  listCurrentItems / listTotalItems;

        onUpdateCallback?.({
          listNewItems: pokemonList,
          listTotalItems,
          listCurrentItems,
          listRemainingItems,
          listProgressPercent,
        });

        const didReachEndOfList = response.next === null;
        if (didReachEndOfList) {
          break;
        };

        listOffset += optionsWithDefaults.limitPerBatch;
        await CommonHelpers.timeout(optionsWithDefaults.delayPerBatchInMS);
      }

      return pokemonListItems;

    } catch (error) {
      console.error('Error fetching all Pokémon:', error);
      throw error;
    };
  };

  // wip
  static async getPokemonDetailsBatched(
    batchOfPokemonID: Array<number>,
    delayPerBatchInMS: number = 500,
    onUpdateCallback?: (pokemon: Array<PokemonDetailsResponse>) => void
  ): Promise<Array<PokemonDetailsResponse>> {
    try {
      const pokemonListItems: Array<PokemonDetailsResponse> = [];
      for (const pokemonID of batchOfPokemonID) {
        const pokemonDetails = await this.getPokemonDetails(pokemonID);
        await CommonHelpers.timeout(delayPerBatchInMS);
      };

      return pokemonListItems;

    } catch (error) {
      console.error('Error fetching all Pokémon:', error);
      throw error;
    };
  };
};
