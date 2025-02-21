import { PokemonCard, PokemonListResponse } from './pokemonServiceTypes';

const BASE_URL_POKEAPI = 'https://pokeapi.co/api/v2';

export class PokemonService {

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

  static async getPokemonDetails(idOrName: string | number): Promise<PokemonCard> {
    try {
      return await this.fetchPokemonData(`pokemon/${idOrName}`);

    } catch (error) {
      console.error(`Error fetching Pokemon details for ${idOrName}:`, error);
      throw error;
    }
  };
};
