import { createSelector } from '@reduxjs/toolkit';
import { resultsSliceSelector, turnoutSliceSelector } from './store';

const STATEWIDE = "President of the United States 4 Year Term (1) Position";

// these selectors work but are trash as far as optimization, the store needs to be redone to be better for memoization
const combineDateTime = (date, time) => `${date} ${time}`;
const createDateSelector = sliceSelector => createSelector(sliceSelector, slice => slice.date);
const createTimeSelector = sliceSelector => createSelector(sliceSelector, slice => slice.time);
const createUpdatedSelector = sliceSelector => createSelector(
  createDateSelector(sliceSelector),
  createTimeSelector(sliceSelector),
  combineDateTime
);

const resultsUpdatedSelector = createUpdatedSelector(resultsSliceSelector);
const turnoutUpdatedSelector = createUpdatedSelector(turnoutSliceSelector);

const countiesListSelector = createSelector(
  turnoutSliceSelector,
  turnout => turnout.allCounties
);

const sum = array => array.reduce((a, b) => a + b, 0);
const sumColumn = (table, column) => {
  return sum(table.map(row => row[column]))
}

// count votes in all records
const getTotal = (recordsList, recordsById) => sum(recordsList.map(id => recordsById[id].votes));

const totalSelector = createSelector(
  turnoutSliceSelector,
  resultsSliceSelector,
  countiesListSelector,
  (turnout, resultsSlice, counties) => {
    if (counties && (turnout.turnoutById) && (resultsSlice.resultsByCounty)) {
      const table = counties.map(county => {
        const { name, total } = turnout.turnoutById[county];
        const results = resultsSlice.resultsByCounty[county];
        var rest = Object.assign({}, results);
        delete rest[STATEWIDE];
        const districtBased = Object.keys(rest).reduce( (arr, key) => arr.concat(rest[key]), []);
        
        return [ name, total, getTotal(results[STATEWIDE], resultsSlice.recordsById), getTotal(districtBased, resultsSlice.recordsById) ];
      });
      return table.concat([["Total", sumColumn(table, 1), sumColumn(table, 2), sumColumn(table, 3)]]);
    } else {
      return undefined
    }
    
  }
);

const candidateTotalSelector = createSelector(
  resultsSliceSelector,
  (resultsSlice) => {
    let votesByCandidate = {}
    for (const recordId of resultsSlice.allRecords) {
      const record = resultsSlice.recordsById[recordId];
      const {votes, office, candidate: {name, id}, party: {name: party}} = record;
      votesByCandidate[id] = votesByCandidate[id] ? votesByCandidate[id] : [name, 0, 0];
      votesByCandidate[id][office === STATEWIDE ? 1 : 2] += votes;
    }
    const table = Object.keys(votesByCandidate).map(id => votesByCandidate[id]);
    return table.concat([["Total", sumColumn(table, 1), sumColumn(table, 2)]]);
  }
);

const countyTotalSelector = createSelector(
  turnoutSliceSelector,
  resultsSliceSelector,
  countiesListSelector,
  (turnout, resultsSlice, counties) => {
    return counties.map(county => {
      const { name, total } = turnout.turnoutById[county];
      const results = resultsSlice.resultsByCounty[county];
      const statewide = results[STATEWIDE];
      var district = Object.assign({}, results);
      delete district[STATEWIDE];
      const candidates = resultsSlice.allCandidates;

      return { 
        name, 
        content:
        candidates.map(candidate => {
          const forCandidate = recordId => resultsSlice.recordsById[recordId].candidate.id === candidate;
          const votes = recordId => resultsSlice.recordsById[recordId].votes;
          return [ 
            resultsSlice.candidatesById[candidate], 
            sum(statewide
              .filter(forCandidate)
              .map(votes)), 
            sum(Object
              .keys(district)
              .map(office => district[office])
              .reduce( (flat, arr) => { return flat.concat(arr) }, [] )
              .filter(forCandidate)
              .map(votes)) 
          ]
        })
      }
    })
  }
)

export { resultsUpdatedSelector, turnoutUpdatedSelector, totalSelector, candidateTotalSelector, countyTotalSelector }