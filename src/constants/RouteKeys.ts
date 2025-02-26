
export const ROUTE_KEYS = {
  pokemonCardStack: 'pokemonCardStack', 
  favorites: 'favorites', 
  debug: 'debug', 
};

export type RouteKey = keyof (typeof ROUTE_KEYS);