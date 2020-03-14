import React from 'react';
import { useState, useRef } from 'react';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { loadFiles } from './load';
import { resultsUpdatedSelector, turnoutUpdatedSelector } from './selectors';
import TurnoutReport from './reports/turnout';
import CandidateTotalsReport from './reports/candidate_totals';
import CandidateByCountyReport from './reports/candidate_by_county';

function App() {
  const dispatch = useDispatch();
  const ref = useRef();
  const resultsUpdated = useSelector(resultsUpdatedSelector);
  const turnoutUpdated = useSelector(turnoutUpdatedSelector);
  const [modalOpen, setModal] = useState(false);
  const [report, setReport] = useState('TURNOUT');
  const [url, setUrl] = useState('');
  // process all currently selected files
  const fileAdded = e => {
    loadFiles(Array.from(e.target.files), dispatch);
  }
  // process url
  const loadUrl = () => {
    if (url.startsWith('http')) {
      loadFiles([`https://cors-anywhere.herokuapp.com/${url}`], dispatch);
      setUrl('');
    }
  }
  // latest from mielections.us
  const loadLatest = () => {
    const results = "https://mielections.us/election/results/DATA/2020PPR_MI_CENR_BY_COUNTY.xls";
    const turnout = "https://mielections.us/election/results/DATA/2020PPR_MI_CENR_TURNOUT.xls";
    loadFiles([
      `https://cors-anywhere.herokuapp.com/${turnout}`,
      `https://cors-anywhere.herokuapp.com/${results}`,
    ], dispatch)
  }
  // show the modal
  const openModal = () => { 
    setModal(true);
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };
  // hide it
  const closeModal = () => { setModal(false) };

  return (
    <div className="App">
      <header className="App-header">
        Michigan Primary Results Inspector
      </header>
      <div className="App-body">
        <div className="reports">
          Report:
          <button onClick={() => setReport('TURNOUT')}>Turnout</button>
          <button onClick={() => setReport('CANDIDATE_TOTALS')}>Candidate Totals</button>
          <button onClick={() => setReport('CANDIDATE_BY_COUNTY')}>Results by County</button>
        </div>
        {report === 'TURNOUT' && <TurnoutReport />}
        {report === 'CANDIDATE_TOTALS' && <CandidateTotalsReport />}
        {report === 'CANDIDATE_BY_COUNTY' && <CandidateByCountyReport />}
      </div>
      <footer className="App-footer">
        <div className="upload">
          <input type="file" id="file-upload" accept=".xls" multiple onChange={fileAdded} className="visually-hidden"></input>
          <label htmlFor="file-upload">Upload Files</label>
        </div>
        <div className="load">
          <button onClick={openModal}>Load From URL</button>
        </div>
        <div className="load">
          <button onClick={loadLatest}>Load Latest Reports</button>
        </div>
        <div className="updated">
          Results: {resultsUpdated} - Turnout: {turnoutUpdated}
        </div>
      </footer>
      <div className="modal" ref={ref} style={ { visibility: modalOpen ? 'visible' : 'hidden'} }>
        <div className="content">
          <button className="close" onClick={closeModal}>&times;</button>
          <h1>Load data from URL</h1>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)}></input>
          <button onClick={loadUrl}>Load</button>
          <p>e.g. https://mielections.us/election/results/DATA/2020PPR_MI_CENR_BY_COUNTY.xls and https://mielections.us/election/results/DATA/2020PPR_MI_CENR_TURNOUT.xls</p>
        </div>
      </div>
    </div>
  );
}

export default App;
