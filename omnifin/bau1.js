
function _splitSQLClauses(sql) {
	// Remove all tab or newline characters and trim spaces
	sql = sql.replace(/[\t\n]/g, ' ').trim();

	// Replace multiple consecutive spaces with a single space
	sql = sql.replace(/\s\s+/g, ' ');

	// Remove the last semicolon if present
	if (sql.endsWith(';')) {
		sql = sql.slice(0, -1);
	}

	const clauses = {};
	let mainSelect = stringBetween(sql,'select','from');console.log(mainSelect); 
	clauses.SELECT = [`SELECT\n${mainSelect}`];

	sql=stringAfter(sql,'from');

	// Define the regex pattern for SQL clauses
	//const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;
	const pattern = /\b(WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;

	// Split the SQL statement into parts based on the pattern
	const parts = sql.split(pattern).filter(Boolean).map(x=>trim(x));
	parts.unshift('FROM');

	console.log(sql, parts);
	//assertion(false,"*** THE END ***")
	
	assertion(parts.length % 2 == 0, 'WTF')
	
	// console.log(parts.length,parts)
	for (let i = 0; i < parts.length; i += 2) {
		//console.log(parts[i].toUpperCase())
		let key = parts[i].toUpperCase().trim();
		if (nundef(clauses[key])) clauses[key] = [];
		lookupAddToList(clauses, [key], `${key}\n${parts[i + 1]}`);
	}

	console.log(clauses);
	return clauses;
}






