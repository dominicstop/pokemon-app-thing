import { TSEventEmitter } from "@dominicstop/ts-event-emitter";

import { OnPokemonNameListDidChangeEvent, PokemonDataServiceEventEmitter } from "./PokemonDataServiceEvents";
import { PokemonStore } from "./PokemonStore";
import { PokemonIDToNameMap, PokemonIDToPokemonDetailsMap } from "./PokemonStoreTypes";
import { PokemonAPI } from "./PokemonAPI";
import { PokemonDataServiceState, PokemonDetailsList, PokemonDetailsListState, PokemonNameList, PokemonNameListItem, PokemonNameListState } from "./PokemonDataServiceTypes";
import { BASE_URL_POKEAPI } from "../services/PokemonAPI";
import { PokemonDetailsResponse, PokemonListResponseResults } from "./PokemonAPITypes";
import { CommonHelpers } from "../utils/CommonHelpers";


const SHOULD_LOG = __DEV__ && true;

export class PokemonDataService {

  eventEmitter: PokemonDataServiceEventEmitter;

  pokemonNameList: PokemonNameList = [];
  pokemonNameMap: PokemonIDToNameMap = {};

  pokemonDetailsToLoadQueue: Array<PokemonNameListItem> = [];

  pokemonDetailsList: PokemonDetailsList = [];
  pokemonDetailsMap: PokemonIDToPokemonDetailsMap = {};

  state: PokemonDataServiceState = {
    pokemonNameListState: { 
      mode: 'NOT_LOADED',
    },
    pokemonDetailsListState: {
      mode: 'NOT_LOADED',
    },
  };

  // Section: Init
  // -------------

  constructor() {
    this.eventEmitter = new TSEventEmitter();

    this.eventEmitter.addListener(
      'onPokemonNameListDidChange', 
      this._handleOnPokemonNameListDidChange
    );
  };

  async initialize() {
    await this.loadPokemonNameMap();
    await this.loadPokemonDetailsIfNeeded();
  };

  // Section: Setters
  // ----------------

  private setPokemonNameList(operation: {
    mode: 'map';
    pokemonNameMap: PokemonIDToNameMap
  } | {
    mode: 'list';
    pokemonNameList: PokemonNameList;
  } | {
    mode: 'appendPokemonListResponseResults'
    results: PokemonListResponseResults;
  }){
    let nextMap: PokemonIDToNameMap = {};
    let nextList: PokemonNameList = [];

    switch(operation.mode){
      case 'list':        
        for(const listItem of operation.pokemonNameList){
          nextMap[`${listItem.pokemonID}`] = listItem;
        };

        nextList.push(...operation.pokemonNameList);
        break;

      case 'map':
        nextList = Object.values(operation.pokemonNameMap);
        nextMap = operation.pokemonNameMap;
        break;

      case 'appendPokemonListResponseResults':
        nextMap = {...this.pokemonNameMap};
        nextList.push(...this.pokemonNameList);

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

          nextList.push(newListEntry);
          nextMap[`${pokemonID}`] = newListEntry;
        };
        break;
    };

    const nextListSorted = nextList.sort((lhs, rhs) => 
      lhs.pokemonID - rhs.pokemonID
    );

    this.pokemonNameMap = nextMap;
    this.pokemonNameList = nextListSorted;
    
    this.eventEmitter.emit('onPokemonNameListDidChange', {
      pokemonNameMap: nextMap,
      pokemonNameListSorted: nextListSorted,
    });

    SHOULD_LOG && console.log(
      'PokemonDataService.setPokemonNameList',
      '\n - operation.mode:', operation.mode, 
      '\n - pokemonNameMap - count:', Object.keys(nextMap).length, 
      '\n - pokemonNameList - count:', nextListSorted.length, 
    );
  };

  private updatePokemonDetailsList(operation: {
    mode: 'setFromMap';
    pokemonDetailsMap: PokemonIDToPokemonDetailsMap;
  } | {
    mode: 'setFromList';
    pokemonDetailsList: PokemonDetailsList;
  } | {
    mode: 'pushPokemonDetailsResponse';
    pokemonDetailsResponse: PokemonDetailsResponse;
  }){
    let nextMap: PokemonIDToPokemonDetailsMap = {};
    let nextList: PokemonDetailsList = [];

    switch(operation.mode){
      case 'setFromList':
        nextList = operation.pokemonDetailsList;

        for(const listItem of operation.pokemonDetailsList){
          nextMap[`${listItem.id}`] = listItem;
        };
        break;

      case 'setFromMap':
        nextList = Object.values(operation.pokemonDetailsMap);
        nextMap = operation.pokemonDetailsMap;
        break;

      case 'pushPokemonDetailsResponse':
        nextMap = {
          ...this.pokemonDetailsMap,
          [operation.pokemonDetailsResponse.id]: {
            ...operation.pokemonDetailsResponse,
          },
        };

        nextList = this.pokemonDetailsList;
        nextList.push(operation.pokemonDetailsResponse);
        break;
    };

    const nextListSorted = nextList.sort((lhs, rhs) => 
      lhs.id - rhs.id
    );

    this.pokemonDetailsMap = nextMap;
    this.pokemonDetailsList = nextListSorted;
    
    this.eventEmitter.emit('onPokemonDetailListDidChange', {
      pokemonDetailsMap: nextMap,
      pokemonDetailsListSorted: nextListSorted,
    });

    SHOULD_LOG && console.log(
      'PokemonDataService.updatePokemonDetailsList',
      '\n - operation.mode:', operation.mode, 
      '\n - nextMap - count:', Object.keys(nextMap).length, 
      '\n - nextListSorted - count:', nextListSorted.length, 
    );
  };

  private setPokemonNameListState(newState: PokemonNameListState) {
    this.state.pokemonNameListState = newState;
    SHOULD_LOG && console.log('setPokemonNameListState:', newState);
  };

  private setPokemonDetailsListState(newState: PokemonDetailsListState) {
    this.state.pokemonDetailsListState = newState;
    SHOULD_LOG && console.log('setPokemonDetailsListState:', newState);
  };

  // Section: Getters (Computed Properties)
  // --------------------------------------

  didLoadPokemonNameList(): boolean {
    return this.state.pokemonNameListState.mode === 'LOADED';
  };

  isPokemonDetailsBeingLoaded(): boolean {
    switch(this.state.pokemonDetailsListState.mode){
      case 'LOADING_LOCAL':
      case 'LOADING_REMOTE':
        return true;
      
      default:
        return false;
    };
  };

  getDiffBetweenPokemonNamesAndDetails(): {
    // already loaded
    listOfPokemonNamesWithDetails: Array<PokemonNameListItem>;
    // pending
    listOfPokemonNamesWithoutDetails: Array<PokemonNameListItem>;
  } {
    const listOfPokemonNamesWithDetails: Array<PokemonNameListItem> = [];
    const listOfPokemonNamesWithoutDetails: Array<PokemonNameListItem> = [];

    for(const pokemonNameItem of this.pokemonNameList){
      const matchingDetails = this.pokemonDetailsMap[`${pokemonNameItem.pokemonID}`];
      const hasMatchingDetailsForID = matchingDetails != null;

      if(hasMatchingDetailsForID){
        listOfPokemonNamesWithDetails.push(pokemonNameItem);

      } else {
        listOfPokemonNamesWithoutDetails.push(pokemonNameItem);
      };
    };
    
    return {
      listOfPokemonNamesWithDetails,
      listOfPokemonNamesWithoutDetails,
    };
  };

  getTotalPokemonCount(): number | null {
    switch(this.state.pokemonNameListState.mode){
      case 'LOADING_REMOTE':
        return this.state.pokemonNameListState.totalItemsToLoad;

      case 'LOADED':
        return this.pokemonNameList.length;

      default:
        return null;
    };
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
    await PokemonAPI.getPokemonNameListAll(undefined, (args) => {
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

  async loadPokemonDetailsIfNeeded(){
    const delayPerBatchInMS = __DEV__ ? 100 : 50;

    const isAlreadyLoading = this.isPokemonDetailsBeingLoaded();
    if(isAlreadyLoading){
      return;
    };

    const totalPokemonCount = this.getTotalPokemonCount();
    if(totalPokemonCount == null){
      throw new Error("Unable to determine total pokemon entries");
    };

    this.setPokemonNameListState({mode: 'LOADING_LOCAL'});

    const cachedPokemonDetailsMap = 
      await PokemonStore.getPokemonIDToPokemonDetailsMap();

    let cachedPokemonDetailsCount = 
      Object.keys(cachedPokemonDetailsMap ?? {}).length;

    const hasPokemonDetailsCache = cachedPokemonDetailsCount > 0;
    if(hasPokemonDetailsCache){
      this.updatePokemonDetailsList({
        mode: 'setFromMap',
        pokemonDetailsMap: cachedPokemonDetailsMap!,
      });
    };

    const updateLoadingStateProgress = () => {
      const listCurrentItems = this.pokemonDetailsList.length;
      const listRemainingItems = Math.max(0, totalPokemonCount - listCurrentItems);
      const listProgressPercent =  listCurrentItems / totalPokemonCount;

      this.setPokemonDetailsListState({
        mode: 'LOADING_REMOTE',
        totalItemsLoaded: listCurrentItems,
        totalItemsToLoad: totalPokemonCount,
        remainingItemsToLoad: listRemainingItems,
        loadingProgressPercent: listProgressPercent,
      });
    };

    const updateQueueIfNeeded = () => {
      const isQueueEmpty = this.pokemonDetailsToLoadQueue.length == 0;
      if(!isQueueEmpty){
        return;
      };

      const diff = this.getDiffBetweenPokemonNamesAndDetails();
      this.pokemonDetailsToLoadQueue.push(...diff.listOfPokemonNamesWithoutDetails);

      SHOULD_LOG && console.log(
        'PokemonDataService.loadPokemonDetailsIfNeeded',
        '\n - invoked: updateQueueIfNeeded',
        '\n - listOfPokemonNamesWithDetails count:', diff.listOfPokemonNamesWithDetails.length,
        '\n - listOfPokemonNamesWithoutDetails count:', diff.listOfPokemonNamesWithoutDetails.length,
        '\n - pokemonDetailsToLoadQueue count:', this.pokemonDetailsToLoadQueue.length,
        '\n'
      );
    };

    if(this.pokemonDetailsToLoadQueue.length > 0){
      updateLoadingStateProgress();
    };

    while(true){
      updateQueueIfNeeded();
      const currentQueueItem = this.pokemonDetailsToLoadQueue.shift();

      SHOULD_LOG && console.log(
        'PokemonDataService.loadPokemonDetailsIfNeeded',
        '\n - pokemonDetailsToLoadQueue count:', this.pokemonDetailsToLoadQueue.length,
        '\n - currentQueueItem.pokemonID', currentQueueItem?.pokemonID,
        '\n'
      );

      if(currentQueueItem == null){
        break;
      };

      try {
        const response = 
          await PokemonAPI.getPokemonDetails(currentQueueItem.pokemonID);

        this.updatePokemonDetailsList({
          mode: 'pushPokemonDetailsResponse',
          pokemonDetailsResponse: response,
        });

        updateLoadingStateProgress();
        await Promise.all([
          PokemonStore.setPokemonIDToPokemonDetailsMap(this.pokemonDetailsMap),
          CommonHelpers.timeout(delayPerBatchInMS),
        ]);

      } catch(error){
        console.error(
          'PokemonDataService.loadPokemonDetailsIfNeeded',
          '\n - failed to load details for id:', currentQueueItem.pokemonID,
          '\n - error:', error
        );
      };
    };

    const diff = this.getDiffBetweenPokemonNamesAndDetails();
    const didLoadAll = diff.listOfPokemonNamesWithoutDetails.length == 0;

    this.setPokemonDetailsListState({
      mode: didLoadAll ? 'LOADED' : 'NOT_LOADED',
    });
  };

  // Section: Handlers
  // -----------------

  _handleOnPokemonNameListDidChange: OnPokemonNameListDidChangeEvent = () => {
    this.loadPokemonDetailsIfNeeded();
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