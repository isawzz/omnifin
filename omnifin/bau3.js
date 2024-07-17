
function extractFilterExpression() {
	let [records,headers,q]=[DA.info.records,DA.info.headers,DA.info.q];
	let selist = Array.from(document.querySelectorAll('.bg_yellow'));
	let items = [];
	for(const sel of selist){
		let o=findElementPosition(sel);
		addKeys({div:sel,text:sel.innerHTML,header:headers[o.icol]},o);
		items.push(o);
	}
	
	console.log(q,selist);
	console.log(items);
}
function findElementPosition(element) {
	const gridContainer = document.getElementById('gridContainer'); console.log(gridContainer);
	const gridItems = Array.from(gridContainer.children); console.log(gridItems)
	const columns = getComputedStyle(gridContainer).gridTemplateColumns.split(' ').length; console.log(columns)

	const index = gridItems.indexOf(element)-1; //wegen header!!!
	if (index === -1) return null;

	const irow = Math.floor(index / columns);
	const icol = index % columns;

	return { irow, icol };
}
function mistextractFilterExpression(){
	let cells = DA.cells;
	let selitems = cells.filter(x => x.isSelected); //console.log(selitems);

	let q = DA.tinfo.q;
	let clauses = splitSQLClauses(q); //console.log(clauses); 
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${q}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${q}`);

	let headers = extractHeadersFromSelect(sc).map(x => x.toLowerCase()); //console.log(headers)

	for (const item of selitems) {
		let h = item.header.toLowerCase(); //console.log(h)
		let match = headers.find(x => x == h);
		if (isdef(match)) { item.h = item.header; item.header = match; }//console.log('found',match);continue;}
		match = headers.find(x => x.endsWith(h));
		if (isdef(match)) { item.h = item.header; item.header = match; }//console.log('found',match);}
	}

	console.log(clauses)
	let where = generateSQLWhereClause(selitems); //console.log(where)
	if (where) {
		if (isdef(clauses.WHERE)){
			let cl=clauses.WHERE[0];
			clauses.WHERE = [`WHERE `+stringAfter(cl,'WHERE')+' AND '+stringAfter(where,'WHERE')];
		} 
		else	clauses.WHERE = [where];
	}

	let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	if (having) {
		if (isdef(clauses.HAVING)){
			let cl=clauses.HAVING[0];
			clauses.HAVING = [`HAVING (`+stringAfter(cl,'HAVING')+') AND '+stringAfter(having,'HAVING')];
		} 
		else	clauses.HAVING = [having];
	}

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql = '';
	for (const k of order) {
		let list = lookup(clauses, [k]);
		if (!list) continue;
		sql += '\n' + list.join('\n');
	}
	return sql + ';';

}









