import { PokemonDetailsResponse } from "./PokemonAPITypes";


export type PokemonIDToNameMap = Record<string, {
  pokemonID: number;
  pokemonName: string;
  pokemonDetailsURL: string;
}>;

export type PokemonIDToNameMapEntry = PokemonIDToNameMap[string];

export type PokemonIDToPokemonDetailsMap = Record<string, PokemonDetailsResponse>;

export type PokemonIDToPokemonDetailsMapEntry = PokemonIDToPokemonDetailsMap[string];