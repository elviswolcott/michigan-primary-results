/* eslint-disable eqeqeq */
/* processes xls files (voter turnout and county votes) */

/* turnout format:
  {
    total: number,
    date: string,
    time: string,
    allCounties: id[],
    countiesById: {
      [id]: [name]
    },
    turnoutById: {
      [id]: {
        name: string,
        total: number
      } 
    }
  }
*/

/* results format:
   each row is processed as a record
  {
    date: string,
    time: string,
    allCandidates: candidateId[]
    candidatesById: {
      [candidateId]: [name]
    },
    resultsByCounty: {
      [id]: {
        [office]: [recordId]
      }
    },
    allRecords: recordId[]
    recordsById: {
      [recordId]: {
        party: {
          id: number,
          name: string
        },
        candidate: {
          id: number,
          name: string
        },
        votes: number,
        office: string,
      }
    }
  }
*/

// provided as tab separated values
const COLUMN_DELIMITER = '\t';
const ROW_DELIMITER = '\n';

// reads a File or url as xls
const readFile = file => {
  // get content as text
  if (file instanceof File) {
    // File
    return new Promise( (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          content: reader.result
        })
      }
      reader.onabort = reject;
      reader.onerror = reject;
      reader.readAsText(file);
    });
  } else {
    // url
    return new Promise( async (resolve, reject) => {
      const content = await fetch(file).then(result => result.text());
      resolve({
        name: file.split('/').pop(),
        content
      })
    });
  }
}

// reads a table from a file
const readTable = (file, quoted) => {
  return file.content
    .trim()
    .split(ROW_DELIMITER)
    .map(line => line.replace(/"/g, quoted ? '' : '"')
    .split(COLUMN_DELIMITER));
}

// determine if a sheet contains voter turnout
const isTurnout = file => {
  // checking the first line works unless you try to break it
  // but intentional crashing isn't a concern here
  return file.content.startsWith("\"County Code\"\t");
}

// convert a number with commas to an actual number
const number = string => {
  return parseInt(string.replace(/,/g,''))
}

// convert turnout into JSON
const loadTurnout = file => {
  let json = {
    allCounties: [],
    countiesById: {},
    turnoutById: {}
  };
  const content = readTable(file, true);
  for ( const rowNumber in content ) {
    const row = content[rowNumber];
    if (rowNumber == 0) {
      // first row is headings
    } else if (rowNumber == 1) {
      // second row is total
      json.total = number(row[2]);
    } else if (rowNumber == content.length - 1) {
      // last row is date/time
      json.date = row[2].replace("RUNDATE: ", '');
      json.time = row[3].replace("RUNTIME: ", '');
    } else {
      // middle rows are records
      const [id, name, total] = row;
      json.allCounties.push(number(id));
      json.countiesById[id] = name;
      json.turnoutById[id] = {
        name,
        total: number(total)
      };
    }
  }
  return json;
}

// determine if a sheet contains county results
const isResults = file => {
  // checking the first line works unless you try to break it
  // but intentional crashing isn't a concern here
  return file.content.startsWith("ElectionDate\t");
}

// convert county results into JSON
const loadResults = file => {
  let json = {
    allCandidates: [],
    allRecords: [],
    candidatesById: {},
    resultsByCounty: {},
    recordsById: {},
  };
  const content = readTable(file);
  for ( const rowNumber in content ) {
    const row = content[rowNumber];
    if (rowNumber == 0) {
      // headings
    } else if (rowNumber == content.length - 1) {
      // last row is date/time
      json.date = row[2].replace("RUNDATE: ", '');
      json.time = row[3].replace("RUNTIME: ", '');
    } else {
      // middle rows are records
      const [, , , , countyId, , office, partyId, , partyName, candidateId, candidateLast, candidateFirst, candidateMiddle, , votes] = row;
      const pad = candidateMiddle ? ' ' : '';
      const id = `${partyId}.${countyId}.${candidateId}#${rowNumber}`;
      const candidateName = `${candidateFirst} ${candidateMiddle}${pad}${candidateLast}`.trim();
      json.candidatesById[candidateId] = candidateName;
      json.resultsByCounty[countyId] = json.resultsByCounty[countyId] ? json.resultsByCounty[countyId] : {};
      json.resultsByCounty[countyId][office] = json.resultsByCounty[countyId][office] ? json.resultsByCounty[countyId][office] : [];
      json.resultsByCounty[countyId][office].push(id);
      json.allRecords.push(id);
      json.recordsById[id] = {
        party: {
          id: number(partyId),
          name: partyName
        },
        candidate: {
          id: number(candidateId),
          name: candidateName
        },
        votes: number(votes),
        office,
      }
    }
  }
  json.allCandidates = Object.keys(json.candidatesById).map(number);
  return json;
}

export { loadResults, loadTurnout, isResults, isTurnout, readFile }