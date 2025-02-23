import { TSEventEmitter } from "@dominicstop/ts-event-emitter";
import { PokemonDataServiceEventEmitter } from "./PokemonDataServiceEvents";
import { PokemonStore } from "./PokemonStore";
import { PokemonIdToNameMap } from "./PokemonStoreTypes";
import { PokemonAPI } from "./PokemonAPI";
import { PokemonDataServiceState, PokemonNameList, PokemonNameListItem, PokemonNameListState } from "./PokemonDataServiceTypes";
import { BASE_URL_POKEAPI } from "../services/PokemonAPI";
import { PokemonListResponseResults } from "./PokemonAPITypes";


const SHOULD_LOG = __DEV__ && true;

export class PokemonDataService {

  eventEmitter: PokemonDataServiceEventEmitter;

  pokemonNameList: PokemonNameList = [];
  pokemonNameMap: PokemonIdToNameMap = {};

  state: PokemonDataServiceState = {
    pokemonNameListState: { 
      mode: 'NOT_LOADED',
    },
  };

  // Section: Init
  // -------------

  constructor() {
    this.eventEmitter = new TSEventEmitter();
  };

  async initialize() {
    await this.loadPokemonNameMap();
  };

  // Section: Setters
  // ----------------

  private setPokemonNameList(operation: {
    mode: 'map';
    pokemonNameMap: PokemonIdToNameMap
  } | {
    mode: 'list';
    pokemonNameList: PokemonNameList;
  } | {
    mode: 'appendPokemonListResponseResults'
    results: PokemonListResponseResults;
  }){
    let nextPokemonNameMap: PokemonIdToNameMap = {};
    let nextPokemonNameList: PokemonNameList = [];

    switch(operation.mode){
      case 'list':        
        for(const listItem of operation.pokemonNameList){
          nextPokemonNameMap[`${listItem.pokemonID}`] = listItem;
        };

        nextPokemonNameList.push(...operation.pokemonNameList);
        break;

      case 'map':
        nextPokemonNameList = Object.values(operation.pokemonNameMap);
        nextPokemonNameMap = operation.pokemonNameMap;
        break;

      case 'appendPokemonListResponseResults':
        nextPokemonNameMap = {...this.pokemonNameMap};
        nextPokemonNameList.push(...this.pokemonNameList);

        for(const item of operation.results){
          const pokemonID = PokemonDataServiceHelpers.extractPokemonID(item.url);
          if(pokemonID == null){
            continue;
          };

          const newListEntry: PokemonNameListItem = {
            pokemonID,
            pokemonName: item.name,
            pokemonDetailsURL: item.url,
          }; 

          nextPokemonNameList.push(newListEntry);
          nextPokemonNameMap[`${pokemonID}`] = newListEntry;
        };
        break;
    };

    const nextPokemonNameListSorted = 
      nextPokemonNameList.sort((lhs, rhs) => lhs.pokemonID - rhs.pokemonID);

    this.pokemonNameMap = nextPokemonNameMap;
    this.pokemonNameList = nextPokemonNameListSorted;
    
    this.eventEmitter.emit('onPokemonNameListDidChange', {
      pokemonNameMap: nextPokemonNameMap,
      pokemonNameListSorted: nextPokemonNameListSorted,
    });

    SHOULD_LOG && console.log(
      'PokemonDataService.setPokemonNameList',
      '\n - operation.mode:', operation.mode, 
      '\n - pokemonNameMap - count:', Object.keys(nextPokemonNameMap).length, 
      '\n - pokemonNameList - count:', nextPokemonNameListSorted.length, 
    );
  };

  private setPokemonNameListState(newState: PokemonNameListState) {
    this.state.pokemonNameListState = newState;
    SHOULD_LOG && console.log('setPokemonNameListState:', newState);
  };

  // Section: Getters (Computed Properties)
  // --------------------------------------

  didLoadPokemonNameList(): boolean {
    return this.state.pokemonNameListState.mode === 'LOADED';
  };

  // Section: Loading and Persistence
  // --------------------------------

  async loadPokemonNameMap(){
    if(this.didLoadPokemonNameList()){
      return;
    };

    this.setPokemonNameListState({ mode: 'LOADING_LOCAL'});
    const pokemonNameMapFromStore = await PokemonStore.getPokemonIdToNameMap();

    // pokemon names already retrieved prev.
    if(pokemonNameMapFromStore != null) {
      this.setPokemonNameList({
        mode: 'map',
        pokemonNameMap: pokemonNameMapFromStore,
      });

      this.setPokemonNameListState({ mode: 'LOADED'});
      return;
    };

    this.setPokemonNameListState({mode: 'PREPARE_LOADING_REMOTE'});
    await PokemonAPI.getPokemonListAll(undefined, (args) => {
      this.setPokemonNameListState({ 
        mode: 'LOADING_REMOTE',
        totalItemsToLoad: args.listTotalItems,
        totalItemsLoaded: args.listCurrentItems,
        remainingItemsToLoad: args.listRemainingItems,
        loadingProgressPercent: args.listProgressPercent,
      });

      this.setPokemonNameList({
        mode: 'appendPokemonListResponseResults',
        results: args.listNewItems
      });
    });

    this.setPokemonNameListState({mode: 'LOADED'});
    PokemonStore.setPokemonIdToNameMap(this.pokemonNameMap);
  };
};

export class PokemonDataServiceHelpers {
  static extractPokemonID(url: string): number | null {
    const baseURL = `${BASE_URL_POKEAPI}/pokemon`;
    
    // e.g. `https://pokeapi.co/api/v2/pokemon/132/`
    const doesInputURLContainBaseURL = url.includes(baseURL);
    if(!doesInputURLContainBaseURL){
      return null;
    };

    const substring = url.replace(baseURL, '');    
    if(substring.length === 0){
      return null;
    };

    const pokemonStringID: string | null = (() => {
      const regex = /\/(\d+)\//;
      const results = url.match(regex);
      
      if(results == null){
        return null;
      };

      if(results.length === 0){
        return null;
      };

      const match = results[0];
      return match.replace('/', '');
    })();

    if(pokemonStringID == null){
      return null;
    };

    const pokemonID = parseInt(pokemonStringID, 10);
    if(isNaN(pokemonID)){
      return null;
    };
    
    return pokemonID;
  }; 
};