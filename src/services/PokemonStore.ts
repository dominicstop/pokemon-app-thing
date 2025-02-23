
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PokemonIdToNameMap, PokemonIDToPokemonDetailsMap } from './PokemonStoreTypes';

const CACHE_KEYS = {
  POKEMON_NAME_MAP: 'POKEMON_NAME_MAP',
  POKEMON_DETAILS_MAP: 'POKEMON_DETAILS_MAP',
};

const SHOULD_LOG = __DEV__ && true;

export class PokemonStore {

  static async getData<T extends object>(key: string): Promise<T | null> {
    SHOULD_LOG && console.log('PokemonStore.getData:', {key});

    try {
      const dataCached = await AsyncStorage.getItem(key);
      SHOULD_LOG && console.log(
        'PokemonStore.getData:', 
        '\n - key:', key,
        '\n - dataCached char count', dataCached?.length ?? -1
      );

      if(dataCached == null) {
        return null;
      };

      const dataParsed = JSON.parse(dataCached);
      SHOULD_LOG && console.log(
        'PokemonStore.getData:', 
        '\n - key:', key,
        '\n - dataCached key count', dataCached?.length ?? -1
      );

      if(dataParsed == null) {
        return null;
      };
      
      // console.log(dataParsed);
      return dataParsed;

    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    };
  };

  static async setData<T extends object>(key: string, data: T): Promise<void> {
    try {
      SHOULD_LOG && console.log(
        'PokemonStore.setData:',
        '\n - key:', key,
        '\n - data keys count:', Object.keys(data as any).length,
      );

      await AsyncStorage.setItem(key, JSON.stringify(data));

    } catch (error) {
      console.error('Error caching data:', error);
      throw error;
    };
  };

  static async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);

    } catch (error) {
      console.error('Error clearing cache:', error);
    };
  };

  static async clearAllCache(): Promise<void> {
    try {
      await AsyncStorage.clear();

    } catch (error) {
      console.error('Error clearing all cache:', error);
    };
  };

  static async getPokemonIdToNameMap(): Promise<PokemonIdToNameMap | null> {
    return await this.getData(CACHE_KEYS.POKEMON_NAME_MAP);
  };
  
  static async setPokemonIdToNameMap(data: PokemonIdToNameMap): Promise<void> {
    await this.setData(CACHE_KEYS.POKEMON_NAME_MAP, data);
  };

  static async getPokemonIDToPokemonDetailsMap(): Promise<PokemonIDToPokemonDetailsMap | null> {
    return await this.getData(CACHE_KEYS.POKEMON_DETAILS_MAP);
  };

  static async setPokemonIDToPokemonDetailsMap(data: PokemonIDToPokemonDetailsMap): Promise<void> {
    await this.setData(CACHE_KEYS.POKEMON_DETAILS_MAP, data);
  };
};
