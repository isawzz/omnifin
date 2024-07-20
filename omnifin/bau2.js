
function getSelItems() {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selist = Array.from(document.querySelectorAll('.bg_yellow'));
	let selitems = [];
	for (const sel of selist) {
		let o = findElementPosition(sel, 1);
		addKeys({ div: sel, text: sel.innerHTML, h: headers[o.icol] }, o);
		selitems.push(o);
	}
	return selitems;
}
function buildCompExp(whereItems, clauses, key='WHERE') {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];

	let filtering = {}; for (const item of whereItems) { lookupAddIfToList(filtering, [item.h], item.text); }
	console.log('filtering', filtering);

	let headerMapping = clsGetHeaderMapping1(clauses, filtering); console.log('headerMapping', headerMapping);//zuerst muss ich alle headers die verwenden kann suchen aus dem SELECT
	for (const item of whereItems) item.header = headerMapping[item.h];

	if (isdef(clauses[key])) {
		//remove expressions that are already covered
		let cl = clauses[key][0];
		let parts = splitAtAnyString(cl, ['AND', 'OR'], true).map(x => x.trim());
		for (const p of parts) {
			let [header, text] = p.split('=').map(x => x.trim()); //.map(x=>trimQuotes(x));
			let item = whereItems.find(x => x.header == header && x.text == text);
			if (isdef(item)) RemoveInPlace(whereItems, item);
		}
	}

	let where = generateCompExp(whereItems); //console.log(where);
	return where;
}



async function filterRecords(allowEdit = false) {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selitems = getSelItems(); console.log('selitems', selitems);
	let clauses = splitSQLClauses(q); //console.log(clauses); 

	let whereItems = selitems.filter(x => x.h != 'MCC' && x.h != 'tag_names'); console.log('whereItems', whereItems);
	let compExp = buildCompExp(whereItems, clauses); //will be null if no suitable whereItems
	if (compExp) {
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + compExp];
		}
		else clauses.WHERE = [`WHERE ${compExp}`];
	}

	if (isdef(clauses.WHERE)) console.log(clauses.WHERE)

	let havingItems = selitems.filter(x => ['MCC','tag_names'].includes(x.h)); console.log('havingItems', havingItems);
	compExp = buildCompExp(havingItems, clauses); console.log(compExp); //will be null if no suitable whereItems


	if (compExp) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING ` + stringAfter(cl, 'HAVING') + ' AND ' + compExp];
		}
		else clauses.HAVING = [`HAVING ${compExp}`];
	}

	if (isdef(clauses.HAVING)) console.log(clauses.HAVING[0])
	//assertion(false, '- THE END -')

	// let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	// if (having) {
	// 	if (isdef(clauses.HAVING)) {
	// 		let cl = clauses.HAVING[0];
	// 		clauses.HAVING = [`HAVING (` + stringAfter(cl, 'HAVING') + ') AND ' + stringAfter(having, 'HAVING')];
	// 	}
	// 	else clauses.HAVING = [having];
	// }

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql = '';
	for (const k of order) {
		let list = lookup(clauses, [k]);
		if (!list) continue;
		sql += '\n' + list.join('\n');
	}
	let qnew = sql + ';'; //console.log(qnew)
	showRecords(qnew, UI.d);



}

