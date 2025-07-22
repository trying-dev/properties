import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";

import { combineReducers, PayloadAction } from "@reduxjs/toolkit";

import { configureStore } from "@reduxjs/toolkit";

import { State } from "./store";
import property from "./slices/property";

export const REDUX_KEY_LOCAL_STORAGE = "state";
export const HYDRATE_ACTION_TYPE = "HYDRATE";

const rootReducer = combineReducers({
  property,
});

const reducer = (state: State | undefined, action: PayloadAction<State>) => {
  if (action.type === HYDRATE_ACTION_TYPE) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return rootReducer(state, action);
};

const devTools = process.env.NODE_ENV !== "production";

export const store = configureStore({ reducer, devTools });

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem(REDUX_KEY_LOCAL_STORAGE, JSON.stringify(state));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchRedux<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorRedux;
