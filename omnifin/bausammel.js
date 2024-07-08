
function extractFilterExpression(){
	let cells = DA.cells;
	let selitems = cells.filter(x=>x.isSelected); //console.log(selitems);

	let q=DA.tinfo.q;
	let clauses = splitSQLClauses(q); //console.log(clauses); 
	let sc = clauses.SELECT[0]; 
	assertion(isdef(sc),`NO SELECT CLAUSE!!! ${q}`);
	assertion(clauses.SELECT.length == 1,`WRONG NUMBER OF SELECT CLAUSES!!! ${q}`);

	let headers = extractHeadersFromSelect(sc).map(x=>x.toLowerCase()); //console.log(headers)

	for(const item of selitems){
		let h = item.header.toLowerCase(); //console.log(h)
		let match=headers.find(x=>x == h);
		if (isdef(match)) {item.h=item.header;item.header=match;}//console.log('found',match);continue;}
		match = headers.find(x=>x.endsWith(h));
		if (isdef(match)) {item.h=item.header;item.header=match;}//console.log('found',match);}
	}

	let where = generateSQLWhereClause(selitems); //console.log(where)
	if (where) clauses.WHERE = [where];

	let having = generateSQLHavingClause(selitems); //console.log(where)
	if (having) clauses.HAVING = [having];

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql='';
	for(const k of order){
		let list = lookup(clauses,[k]);
		if (!list) continue;
		sql+='\n'+list.join('\n');
	}
	return sql+';';

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
	for (const irow in rows) {
		let rcells = rows[irow];
		let cl = rcells.map(cell => generateSQLEqualsWHERE(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x=>!isEmpty(x))
	let res = isEmpty(ands)?null:' WHERE ' + ands.join(' OR ');
	return res;
}
function generateSQLHavingClause(cells) {
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
	for (const irow in rows) {
		let rcells = rows[irow];
		let cl = rcells.map(cell => generateSQLEqualsHAVING(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x=>!isEmpty(x))
	let res = isEmpty(ands)?null:' HAVING ' + ands.join(' OR ');
	return res;
}
function generateSQLEqualsHAVING(a, text) {
	if (a!='mcc' && a!='tag_names') return null;
	//return isNumber(text) ? Number(text) == 0 ? `(${a} IS NULL OR ${a}=0)` : `${a}=${text}`
	if (a == 'mcc' && isEmpty(text)){
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) IS NULL OR
    group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = ''`;
	}else if (a == 'tag_names' && isEmpty(text)){
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) IS NULL OR
    group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = ''`;

	}else if (a == 'mcc'){
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = '${text}`;
	}else if (a == 'tag_names'){
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = '${text}'`;
	}
}
function generateSQLEqualsWHERE(a, text) {
	if (a=='mcc' || a=='tag_names') return null;
	return isEmpty(text) ? `(${a} IS NULL OR ${a}='')` : `${a}='${text}'`;
}








