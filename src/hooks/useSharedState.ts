/**
 * This module is a cheap mobx replacement for cross-cutting component globalState.
 * This should probably be replaced with mobx once it's being used in enterprise and won't affect bundle size as much
 */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const STORAGE_KEY = 'state';

// Add keys and values here to expand state items
type SharedStateMap = {
  darkMode: boolean;
  showHidden: boolean;
};

const createStateObj = (obj: SharedStateMap) =>
  Object.entries(obj).reduce<GlobalState>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: new StateItem(value),
    }),
    {} as GlobalState
  );

const getStoredState = (): GlobalState => {
  const storageStr = localStorage.getItem(STORAGE_KEY);

  // DEFINES DEFAULT STATE
  const defaultState: SharedStateMap = {
    darkMode: true,
    showHidden: false,
  };
  let storedState = {} as SharedStateMap;
  if (storageStr) {
    storedState = JSON.parse(storageStr) as SharedStateMap;
  }
  return {
    ...createStateObj(defaultState),
    ...createStateObj(storedState),
  };
};

const setStoredState = () => {
  const state: SharedStateMap = Object.entries(globalState).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.value,
    }),
    {} as SharedStateMap
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

class StateItem<TValue> {
  constructor(value?: TValue) {
    this.setters = [];
    this.value = value;
  }

  value?: TValue;

  setters: Dispatch<SetStateAction<TValue>>[];

  setState(val: TValue) {
    this.value = val;
    this.setters.forEach((setter) => setter(val));
    setStoredState();
  }

  addSetter(setter: Dispatch<SetStateAction<TValue>>) {
    if (!this.setters.includes(setter)) {
      this.setters.push(setter);
    }
  }

  removeSetter(setter: Dispatch<SetStateAction<TValue>>) {
    this.setters = this.setters.filter((item) => item !== setter);
  }
}

type GlobalState = {
  [key in keyof SharedStateMap]: StateItem<any>;
};

const globalState = global.window ? getStoredState() : ({} as GlobalState);

export const useSharedState = <TStateKey extends keyof SharedStateMap>(
  /**
   * The identifier for the piece of state to retrieve and mutate
   */
  stateKey: TStateKey
): [SharedStateMap[TStateKey], (val: SharedStateMap[TStateKey]) => void] => {
  if (!(stateKey in globalState)) {
    globalState[stateKey] = new StateItem<SharedStateMap[TStateKey]>();
  }

  const state = globalState[stateKey];
  const [componentVal, setComponentVal] = useState<SharedStateMap[TStateKey]>(
    state.value
  );

  state.addSetter(setComponentVal);

  // Remove the setter when component is unmounted
  useEffect(() => () => state.removeSetter(setComponentVal), [state]);

  return [
    componentVal,
    (val: SharedStateMap[TStateKey]) => state.setState(val),
  ];
};
