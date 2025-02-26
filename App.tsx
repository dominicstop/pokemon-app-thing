import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { PokemonProvider } from './src/context/PokemonDataContext';
import { ROUTE_MAP, RouteEntry } from './src/constants/Routes';
import { ROUTE_KEYS } from './src/constants/RouteKeys';


const TabNavigator = createBottomTabNavigator();

function TabBarIcon(props: {
  routeEntry: RouteEntry;
}){

  const emoji = (() => {
    switch (props.routeEntry.routeKey) {
      case ROUTE_KEYS.pokemonCardStack:
        return "🔴";

      case ROUTE_KEYS.favorites:
        return "⭐️";

      case ROUTE_KEYS.debug:
        return "🐞";

      default:
        return "❔";
    }
  })();

  return (
    <Text style={{ fontSize: 24 }}>
      {emoji}
    </Text>
  );
};

export default function App() {

  return (
    <PokemonProvider>
      <NavigationContainer>
        <TabNavigator.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#fff',
            },
          }}
        >
          <TabNavigator.Screen 
            name={ROUTE_MAP.pokemonCardStack.routeName}
            component={ROUTE_MAP.pokemonCardStack.component} 
            options={{
              tabBarIcon: () => (
                <TabBarIcon
                  routeEntry={ROUTE_MAP.pokemonCardStack}
                />
              ),
            }}
          />
          <TabNavigator.Screen 
            name={ROUTE_MAP.favorites.routeName}
            component={ROUTE_MAP.favorites.component}
            options={{
              tabBarIcon: () => (
                <TabBarIcon
                  routeEntry={ROUTE_MAP.favorites}
                />
              ),
            }}
          />
          <TabNavigator.Screen 
            name={ROUTE_MAP.debug.routeName}
            component={ROUTE_MAP.debug.component} 
            options={{
              tabBarIcon: () => (
                <TabBarIcon
                  routeEntry={ROUTE_MAP.debug}
                />
              ),
            }}
          />
        </TabNavigator.Navigator>
      </NavigationContainer>
    </PokemonProvider>
  );
}

const styles = StyleSheet.create({
});
