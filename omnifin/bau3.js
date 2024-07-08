
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
	clauses.WHERE = [where];

	let having = generateSQLHavingClause(selitems); //console.log(where)
	clauses.HAVING = [having];

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql='';
	for(const k of order){
		let list = lookup(clauses,[k]);
		if (!list) continue;
		sql+='\n'+list.join('\n');
	}
	return sql+';';

}











