import { configureStore, createSlice } from '@reduxjs/toolkit';
import { loadResults, loadTurnout } from './xls';

const { actions: { update: updateResults }, reducer: resultsReducer } = createSlice({
  name: 'results',
  initialState: {},
  reducers: {
    'update': (state, action) => {
      return loadResults(action.payload);
    }
  }
});

const resultsSliceSelector = state => state.results;

const { actions: { update: updateTurnout }, reducer: turnoutReducer } = createSlice({
  name: 'turnout',
  initialState: {},
  reducers: {
    'update': (state, action) => {
      return loadTurnout(action.payload);
    }
  }
});

const turnoutSliceSelector = state => state.turnout;

const store = configureStore({
  reducer: {
    turnout: turnoutReducer,
    results: resultsReducer
  }
});

export { store, updateResults, updateTurnout, resultsSliceSelector, turnoutSliceSelector }