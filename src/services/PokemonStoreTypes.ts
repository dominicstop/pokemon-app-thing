import { PokemonDetailsResponse } from "./PokemonAPITypes";


export type PokemonIdToNameMap = Record<string, {
  pokemonID: number;
  pokemonName: string;
  pokemonDetailsURL: string;
}>;

export type PokemonIDToPokemonDetailsMap = Record<string, PokemonDetailsResponse>;

export type PokemonIDToPokemonDetailsMapEntry = PokemonIDToPokemonDetailsMap[string];