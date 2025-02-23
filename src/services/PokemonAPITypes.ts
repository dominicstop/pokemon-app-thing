
export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
};

export type PokemonListResponseResults = PokemonListResponse['results'];

export type PokemonListResponseEntry = PokemonListResponseResults[number];

export type PokemonDetailsResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string | null;
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
  };
  types: Array<{
    type: {
      name: string;
    }
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    }
  }>;
  abilities: Array<{
    ability: {
      name: string;
    },
    is_hidden: boolean;
  }>;
  height: number;
  weight: number;
};