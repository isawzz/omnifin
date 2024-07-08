

function splitSQLClauses(sql) {
  // Remove all tab or newline characters and trim spaces
  sql = sql.replace(/[\t\n]/g, ' ').trim();
  
  // Replace multiple consecutive spaces with a single space
  sql = sql.replace(/\s\s+/g, ' ');

  // Remove the last semicolon if present
  if (sql.endsWith(';')) {
      sql = sql.slice(0, -1);
  }
  
  // Define the regex pattern for SQL clauses
  const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;

  // Split the SQL statement into parts based on the pattern
  const parts = sql.split(pattern).filter(Boolean);
  assertion(parts.length%2 == 0,'WTF')
  // console.log(parts.length,parts)
  const clauses = {};
  for(let i=0;i<parts.length;i+=2){
    //console.log(parts[i].toUpperCase())
    let key = parts[i].toUpperCase().trim();
    if (nundef(clauses[key])) clauses[key]=[];
    lookupAddToList(clauses,[key],`${key}\n${parts[i+1]}`);
  }
  return clauses;
}
function mist(){
  const clauses = {};
  let currentClause = null;

  parts.forEach(part => {
      //console.log('___',part)
      const upperPart = part.trim().toUpperCase();
      if (pattern.test(upperPart)) {
          // If the part matches the pattern, it's a new clause
          currentClause = upperPart;
          if (!clauses[currentClause]) {
              clauses[currentClause] = [];
          }
      } else if (currentClause) {
          // If it's not a new clause, append it to the current clause
          clauses[currentClause].push(part.trim());
      }
  });

  // Join multiple similar clauses into a single string
  Object.keys(clauses).forEach(key => {
      if (clauses[key].length === 1) {
          clauses[key] = clauses[key][0];
      } else {
          clauses[key] = clauses[key].join(' ');
      }
  });

  return clauses;
}
function generateSQLWhereClause(cells) {
  // // Example usage:
  // const cells = [
  //   { icol: 0, irow: 0, text: 'Alice', header: 'name' },
  //   { icol: 1, irow: 0, text: 'Engineering', header: 'department' },
  //   { icol: 0, irow: 1, text: 'Bob', header: 'name' },
  //   { icol: 1, irow: 1, text: 'HR', header: 'department' }
  // ];

  // console.log(generateSQLWhereClause(cells));
  if (cells.length === 0) {
      return '';
  }

  // Group cells by their rows and columns
  const rows = {};
  const cols = {};

  cells.forEach(cell => {
      if (!rows[cell.irow]) {
          rows[cell.irow] = [];
      }
      rows[cell.irow].push(cell);

      if (!cols[cell.icol]) {
          cols[cell.icol] = [];
      }
      cols[cell.icol].push(cell);
  });

  //console.log(rows,cols)

  let ands = [];
  for(const irow in rows){
    let rcells = rows[irow];
    let cl = rcells.map(cell=>`${cell.header} = '${cell.text}'`).join(' AND ');
    ands.push(cl);
  }
  let res = ' WHERE ' + ands.join(' OR ');
  return res;
}

function insertWhereClause(sql, whereClause) {

  // // Example usage:
  // const sql = `
  //   SELECT id, name, age
  //   FROM employees
  //   LEFT JOIN departments ON employees.department_id = departments.id
  //   WHERE salary > 50000
  //   GROUP BY department_id
  //   HAVING COUNT(*) > 5
  //   ORDER BY age DESC
  //   LIMIT 10 OFFSET 5;
  // `;

  // const whereClause = `age > 30`;

  // console.log(insertWhereClause(sql, whereClause));

  // Trim any existing semicolons and whitespace from the input
  sql = sql.trim().replace(/;$/, '');
  whereClause = whereClause.trim().replace(/^WHERE\s+/i, '');

  // Define regex patterns to locate positions in the SQL statement
  const selectPattern = /SELECT\s+.*?\s+FROM\s+/i;
  const fromPattern = /\bFROM\b/i;
  const wherePattern = /\bWHERE\b/i;
  const groupByPattern = /\bGROUP BY\b/i;
  const orderByPattern = /\bORDER BY\b/i;
  const havingPattern = /\bHAVING\b/i;
  const limitPattern = /\bLIMIT\b/i;
  const offsetPattern = /\bOFFSET\b/i;
  const joinPattern = /\b(JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN)\b/i;

  // Check if the SQL already contains a WHERE clause
  if (wherePattern.test(sql)) {
      // If there is an existing WHERE clause, append the new one with AND
      sql = sql.replace(wherePattern, match => `${match} (${whereClause}) AND `);
  } else {
      // Find the position to insert the WHERE clause
      let position = sql.search(groupByPattern);
      const insertPositionPatterns = [fromPattern,groupByPattern, orderByPattern, havingPattern, limitPattern, offsetPattern, joinPattern];
      insertPositionPatterns.forEach(pattern => {
          const pos = sql.search(pattern);
          if (pos !== -1 && (position === -1 || pos < position)) {
              position = pos;
          }
      });
      

      if (position === -1) {
          position = sql.length;
      }

      // Insert the WHERE clause at the correct position
      sql = `${sql.slice(0, position)} WHERE ${whereClause} ${sql.slice(position)}`;
  }

  // Remove consecutive spaces
  sql = sql.replace(/\s+/g, ' ').trim();



  return sql;
}










