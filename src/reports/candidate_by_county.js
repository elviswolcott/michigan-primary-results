import React from 'react';
import { useSelector } from 'react-redux';
import { resultsUpdatedSelector, turnoutUpdatedSelector, countyTotalSelector } from '../selectors';

const pcnterr = (a,b) => {
  return ((Math.abs(b-a)/b) * 100).toFixed(2);
}

const delta = (a,b) => {
  return `${Math.abs(a - b)} - ${pcnterr(a,b)}%`;
};

const highlight = row => {
  let highlighted = row.map(cell => { return {highlight: '', content: cell } });
  if (row[2] !== row[1]) {
    highlighted[2].highlight = row[2] > row[1] ? 'gain' : 'loss';
    highlighted[2].delta = delta(row[2], row[1]);
  }
  return highlighted;
}

const CandidateByCountyReport = () => {
  const resultsUpdated = useSelector(resultsUpdatedSelector);
  const turnoutUpdated = useSelector(turnoutUpdatedSelector);
  const counties = useSelector(countyTotalSelector);

  const headings = ["Candidate", "Statewide Total", "Congressional District Total"].map( (item, index) => { return <th key={`h.${index}`}>{item}</th> });

  const countyTable = (county) => 
  <>
    <h2>{county.name}</h2>
    <table>
      <thead><tr>{headings}</tr></thead>
      <tbody>{
        county.content.map( (row, index) => 
          <tr key={`r.${index}`}>
            {highlight(row).map( (cell, col) => <td key={`r.${index}.c.${col}`} className={cell.highlight}>{cell.content}{ cell.delta && <span>({cell.delta})</span> }</td>)}
          </tr>
        )
      }</tbody>
    </table>
  </>;

  return (resultsUpdated && turnoutUpdated && counties) ?
    counties.map(countyTable)
    : <></>
};

export default CandidateByCountyReport;