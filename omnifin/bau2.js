
function extractFilterExpression(){
	let info=DA.tinfo;
	let cells = DA.cells;
	let selitems = cells.filter(x=>x.isSelected); //console.log(selitems);
	//console.log(info,selitems);

	//let clauses = splitSQLClauses(DA.tinfo.q);

	let clauses = splitSQLClauses(DA.tinfo.q); //console.log(clauses); 
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
	
	let where = generateSQLWhereClause(selitems); console.log(where)
	let qres = insertWhereClause(DA.tinfo.q, where); //console.log(qres)

	const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;
  const parts = qres.split(pattern).filter(Boolean);
	qres = parts.join('\n')

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















