
async function filterRecords(allowEdit = false) {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selitems = getSelItems(); console.log('selitems', selitems);
	let clauses = sqlSplitClauses(q); //console.log(clauses); 
	let tagNames = dbGetTagNames();

	let whereItems = selitems.filter(x => !tagNames.concat(['MCC','tag_names']).includes(x.h)); //x.h != 'MCC' && x.h != 'tag_names'); //console.log('whereItems', whereItems);
	let compExp = sqlBuildCompareExp(whereItems, clauses); //will be null if no suitable items
	if (compExp) {
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + compExp];
		}
		else clauses.WHERE = [`WHERE ${compExp}`];
	}
	//if (isdef(clauses.WHERE)) console.log(clauses.WHERE[0]);

	let havingItems = selitems.filter(x => tagNames.concat(['MCC','tag_names']).includes(x.h)); //x.h != 'MCC' && x.h != 'tag_names'); //console.log('whereItems', whereItems);
	compExp = sqlBuildCompareExp(havingItems, clauses); //console.log(compExp); //will be null if no suitable whereItems
	if (compExp) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING ` + stringAfter(cl, 'HAVING') + ' AND ' + compExp];
		}
		else clauses.HAVING = [`HAVING ${compExp}`];
	}

	//if (isdef(clauses.HAVING)) console.log(clauses.HAVING[0]);

	let qnew = sqlComposeClauses(clauses);

	showRecords(qnew, UI.d);

}
function generateEquals(a, text) {	
	let op = mBy('bFilterOp').innerHTML;
	//let cmp=op=='=='
	return isEmpty(text) ? `${a} IS NULL OR ${a}${op}''` : `${a}${op}'${text}'`;
}




