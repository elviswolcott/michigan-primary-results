import React from 'react';
import { useSelector } from 'react-redux';
import { totalSelector, resultsUpdatedSelector, turnoutUpdatedSelector } from '../selectors';

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
  if (row[3] !== row[1]) {
    highlighted[3].highlight = row[3] > row[1] ? 'gain' : 'loss';
    highlighted[3].delta = delta(row[3], row[1]);
  }
  return highlighted;
}

const TurnoutReport = () => {
  const resultsUpdated = useSelector(resultsUpdatedSelector);
  const turnoutUpdated = useSelector(turnoutUpdatedSelector);
  const totals = useSelector(totalSelector);

  const headings = ["County", "Reported Turnout", "Statewide Total", "Congressional District Total"].map( (item, index) => { return <th key={`h.${index}`}>{item}</th> });

  return (resultsUpdated && turnoutUpdated && totals) ?
    <table>
      <thead><tr>{headings}</tr></thead>
      <tbody>{
        totals.map( (row, index) => 
          <tr key={`r.${index}`}>
            {highlight(row).map( (cell, col) => <td key={`r.${index}.c.${col}`} className={cell.highlight}>{cell.content}{ cell.delta && <span>({cell.delta})</span> }</td>)}
          </tr>
        )
      }</tbody>
    </table>
    : <></>
}

export default TurnoutReport;