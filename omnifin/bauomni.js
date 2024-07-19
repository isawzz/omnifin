
function clsGetHeaderMapping(clauses, sorting) {
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${clauses}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${clauses}`);
	//jetzt hab ich die clauses!

	sc = stringAfter(sc, 'SELECT');
	let selectHeaders = sc.split(',').map(x => x.includes(' as ') ? stringAfter(x, ' as ') : x.includes(' AS ') ? stringAfter(x, ' AS ') : x);
	
	selectHeaders=selectHeaders.map(x=>trimQuotes(x)); console.log('select headers:', selectHeaders);
	//assertion(false,"*** THE END ***")

	//die sorting params sollen jetzt verwandelt werden in die select headers
	let sortHeaders = Object.keys(sorting).filter(x => isdef(sorting[x]));
	console.log('sort headers:', sortHeaders);
	let headerMapping = {};
	for (const hSort of sortHeaders) {
		let hSelect = selectHeaders.find(x => x.endsWith(hSort))
		if (hSelect) headerMapping[hSort] = hSelect;
	}
	return headerMapping;
}
function measureRecord(rec) {
	let res = '';
	var di = {
		account_name:140, account_type:140, account_owner:140, amount: 80, asset_name:120, asset_type:120, associated_account: 90, category: 120, dateof: 100, description: 'minmax(200px,1fr)', id: 45,
		report: 55, receiver_name: 140, sender_name: 140, tag_name: 120, tag_names: 'auto', unit: 50, MCC: 60
	};
	for (const h in rec) {
		let val = rec[h]; //console.log(typeof val, val, h);
		let w = di[h];
		w = isNumber(w) ? `${w}px` : w ?? 'auto';
		res += ` ${w}`;
		// if (isdef(w)) res += ` ${w}`;
		// else if (isEmpty(val)) res += ' 1fr';
		// else {
		// 	res += ` ${Math.min(Math.max(measureTextWidth(val) * 2, 50), 300)}px`;
		// }
	}
	//console.log(res)
	return res;

}
async function sortRecordsBy(h, allowEdit = false) {

	let [q, dParent, sorting] = [DA.info.q, DA.info.dParent, DA.info.sorting]; //sorting is a dict by header 'asc','desc'

	let s = sorting[h]; if (s == 'asc') sorting[h] = 'desc'; else if (sorting[h] == 'desc') delete sorting[h]; else sorting[h] = 'asc';
	//assertion(!isEmpty(sorting),`sortRecordsBy ${h} but EMPTY sorting ${sorting}`)

	let clauses = splitSQLClauses(q); //console.log(clauses); 

	let qnew = sqlWithoutClause(clauses, 'ORDER BY'); //remove orderBy from q

	let headerMapping = clsGetHeaderMapping(clauses, sorting); console.log(headerMapping);//zuerst muss ich alle headers die verwenden kann suchen aus dem SELECT

	//if (!isEmpty(sorting)) {

	if (UI.lastCommandKey == 'transcols' && isEmpty(sorting)) { await showRecords(qTTCols(), UI.d, true); return; }

	else if (UI.lastCommandKey == 'transcols') {
		let tags = dbGetTagNames();

		let sortKeys = Object.keys(sorting); // tag_name sorting is ALWAYS first priority
		let tagKeys = sortKeys.filter(x => tags.includes(x));

		if (isdef(sorting[h]) && tagKeys.includes(h)) { tagKeys = [h].concat(arrWithout(tagKeys, h)); }

		let otherKeys = sortKeys.filter(x => !tags.includes(x));
		sortKeys = tagKeys.concat(otherKeys);



		for (const k of tagKeys) sorting[k] = 'desc';		// tag_name columns werden immer nur X first sortiert!

		//ich muss in der selectClause das order aendern!!!
		let tagOrder = tagKeys.concat(tags.filter(x => !tagKeys.includes(x)));

		console.log('tagOrder', tagOrder);

		let s = '';
		for (const name of tagOrder) {
			s += `MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}',\n`;
			//if (name != arrLast(tags)) s += ',';
		}

		console.log('s', s); //return;

		let select = `SELECT 
				t.id, 
				t.dateof, 
				sender.account_name AS sender_name, 
				receiver.account_name AS receiver_name, 
				t.amount, 
				a.asset_name AS unit, 
				GROUP_CONCAT(
					CASE 
						WHEN tg.category = 'MCC' THEN tg.tag_name 
						ELSE NULL 
					END
				) AS MCC,
				${s}
				t.description
				`;

		qnew = select + '\n';
		for (const k in clauses) {
			if (['SELECT', 'ORDER BY'].includes(k)) continue;
			for (const a of clauses[k]) qnew += `${a.trim()}\n`;
		}

		qnew += `ORDER BY ${sortKeys.map(x => `"${headerMapping[x]}" ${sorting[x].toUpperCase()}`).join(', ')}`;

	} else if (!isEmpty(sorting)) {
		qnew += `ORDER BY ${Object.keys(sorting).map(x => `"${headerMapping[x]}" ${sorting[x].toUpperCase()}`).join(', ')}`;
	}

	console.log(qnew);
	await showRecords(qnew, dParent);

}
function sqlReplaceStar(q){

	//console.log(':::::::::::',q);
	let qTemp = q.toLowerCase().trim();
	if (qTemp.startsWith('select * from')){

		if (qTemp.endsWith(';')) qTemp = stringBeforeLast(qTemp,';');
		qTemp += ` LIMIT 1;`;
		console.log(qTemp)
		let records = dbToList(qTemp); //'select * from tags');
		if (isEmpty(records)) return q;

		let headers = Object.keys(records[0]);
		let qnew = `SELECT ${headers.join(', ')}\n${stringAfter(q,' * ')}`;
		return qnew;


	}
	return q;
}
function sqlWithoutClause(clauses,which='ORDER BY') {
	let qnew = '';
	for (const k in clauses) {
		if (k.startsWith(which)) continue;
		for (const a of clauses[k]) qnew += `${a.trim()}\n`;
	}
	return qnew;
}










