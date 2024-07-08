
function extractHeadersFromSelect(sc){
	sc=stringAfter(sc,'SELECT');
	scs=sc.split(',').map(x=>x.trim()).map(x=>x.includes(' as ')?stringAfter(x,' as ').trim():x);
	//console.log(scs,sc)
	//scs.map(x=>console.log(x));
	return scs;
}
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

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql='';
	for(const k of order){
		let list = lookup(clauses,[k]);
		if (!list) continue;
		sql+='\n'+list.join('\n');
	}
	return sql+';';

}
function mist(){

	return '';
	let selectClause = clauses.SELECT; 
	let correctHeaders = selectClause.split(',').map(x=>x.trim());
	correctHeaders=correctHeaders.map(x=>x.includes(' ')?stringAfterLast(x,' '):x)
	console.log('correct',correctHeaders)

	for(const item of selitems){
		let h=item.header.includes(' ')?stringAfterLast(item.header,' '):item.header;
		console.log('h',h)
		if (correctHeaders.includes(h)) item.correctHeader = h;
		else {
			let h1=correctHeaders.find(x=>stringAfter(x,'.')==h);
			if (isdef(h1)) item.correctHeader = h1;
			else showMessage(`need to correct header ${h} in where clause!`,5000)
		}
	}
	
	let q=DA.info.q;
	let where = generateSQLWhereClause(selitems); console.log(where)
	//let qres = insertWhereClause(DA.tinfo.q, where); //console.log(qres)

	let di=splitSQLClauses(q);
	return '';
	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let final = '';
	for(const k of order){
		if (isdef(di[k])) {
			console.log(typeof(di[k]),di[k]);
			//final += k + ' ' + di[k] + '\n';
		}
	}
	return final;
	// const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;
  // const parts = qres.split(pattern).filter(Boolean);
	// qres = parts.join('\n');
	//console.log(qres)
	//console.log(clauses,where);
	return qres;
}
function mist(){	
	let qtrim=DA.tinfo.q.trim().toLowerCase();
	assertion(qtrim.endsWith(';'),'WTF!!!!!!!!!!!!!!!!!!!');
	let q=qtrim;

	q=replaceAllSpecialCharsFromList(q,['\t','\n'],' ');

	//generateSQLWhereClause

	exp=stringBeforeLast(exp,';') + ' where ';
	//console.log(exp)

	for(const item of selitems){
		let header = info.headers[item.icol];
		let text = iDiv(item).innerHTML;
		//if (exp != '') exp += ' or ';
		exp += `${header}='${text}'`;
		if (isLast(item,selitems)) exp += ';'; else exp +=' or ';
	}
	return exp;

}















