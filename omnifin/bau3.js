
function sqlUpdateOrderBy(q, sorting, aggregate=true) {
	let clauses = splitSQLClauses(q); // console.log('clauses',clauses)
	let qnew = '';
	for(const k in clauses){
		if (k.startsWith('ORDER BY')) continue;
		for(const a of clauses[k]) qnew+= `${a.trim()}\n`;
	}
	if (!isEmpty(sorting)){		qnew += `ORDER BY ${Object.keys(sorting).map(x=>x+' '+sorting[x].toUpperCase()).join(', ')}`	}
	qnew+=';'
	return qnew;
}


function extractFilterExpression() {
	let [records,headers,q]=[DA.info.records,DA.info.headers,DA.info.q];
	let selist = Array.from(document.querySelectorAll('.bg_yellow'));
	let selitems = [];
	for(const sel of selist){
		let o=findElementPosition(sel,1);
		addKeys({div:sel,text:sel.innerHTML,header:headers[o.icol]},o);
		selitems.push(o);
	}
	
	//console.log(q,selist);
	//selitems.map(x=>console.log(x));
	let clauses = splitSQLClauses(q); //console.log(clauses); 
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${q}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${q}`);

	//add a item.h filed to all items
	for (const item of selitems) {
		let h = item.header.toLowerCase(); //console.log(h)
		let match = headers.find(x => x == h);
		if (isdef(match)) { item.h = item.header; item.header = match; }//console.log('found',match);continue;}
		match = headers.find(x => x.endsWith(h));
		if (isdef(match)) { item.h = item.header; item.header = match; }//console.log('found',match);}
	}

	//console.log(clauses)
	let where = generateSQLWhereClause(selitems); console.log(where)
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









