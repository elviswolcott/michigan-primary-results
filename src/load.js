import { isTurnout, isResults, readFile } from './xls';
import { updateTurnout, updateResults } from './store';

// fully load a list of files using a provided dispatch function
const loadFiles = async (files, dispatchFn) => {
  // load all the files as text
  const openFiles = await Promise.all(files.map(readFile));
  // filter to only include valid files
  const turnoutFiles = openFiles.filter(isTurnout);
  const resultsFiles = openFiles.filter(isResults);
  // for now only one sheet of each time is used at a time (could change if a comparison view is added in the future)
  const turnout = turnoutFiles[0];
  const results = resultsFiles[0];
  // update the store
  if (turnout) {
    dispatchFn(updateTurnout(turnout));
  }
  if (results) {
    dispatchFn(updateResults(results));
  }
}

export { loadFiles }