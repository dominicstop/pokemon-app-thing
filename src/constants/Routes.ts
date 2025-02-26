import { PokemonCardStackScreen } from "../screens/PokemonCardStackScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { DebugScreen } from "../screens/DebugScreen";

import type { RouteKey } from "./RouteKeys";


export type RouteEntry = {
  routeKey: RouteKey
  routeName: string;
  component: React.ComponentType<{}>;
};

export const ROUTE_ITEMS: Array<RouteEntry> = [
  {
    routeKey: 'pokemonCardStack',
    routeName: 'Deck',
    component: PokemonCardStackScreen,
  },
  {
    routeKey: 'favorites',
    routeName: 'Faves',
    component: FavoritesScreen,
  },
  {
    routeKey: 'debug',
    routeName: 'Debug',
    component: DebugScreen,
  },
];

export const ROUTE_MAP: Record<RouteKey, RouteEntry> = (() => {
  const map: Record<string, RouteEntry> = {};

  for (const routeItem of ROUTE_ITEMS) {
    map[routeItem.routeKey] = routeItem;
  };

  return map;
})();