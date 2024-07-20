
function addSumAmount(ui, records) {
	if (nundef(ui)) return;
	//console.log(ui);

	let sum = arrSum(records, 'amount');
	if (isNumber(sum)) sum = Math.round(sum); //sum.toFixed(2); //

	mDom(ui, {align:'right'}, { html: sum })

}
function buildCompExp(whereItems, clauses, key='WHERE') {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];

	let filtering = {}; for (const item of whereItems) { lookupAddIfToList(filtering, [item.h], item.text); }
	//console.log('filtering', filtering);

	let headerMapping = clsGetHeaderMapping1(clauses, filtering); //console.log('headerMapping', headerMapping);//zuerst muss ich alle headers die verwenden kann suchen aus dem SELECT
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
function checkButtons() {
	let bs = arrChildren('dButtons'); bs.map(x => disableButton(x));
	if (DB) enableButton('bDownload');
	let info = DA.tinfo; //are there records shown?
	if (nundef(info)) return;
	let [ifrom, ito, records] = [info.ifrom, info.ito, info.records];
	//console.log('checkButtons',ifrom,ito,records.length)
	if (ifrom > 0) enableButton('bPgUp');
	if (ito < records.length) enableButton('bPgDn');
	if (!isEmpty(M.qHistory)) enableButton('bBack');
	if (DA.cells.find(x => x.isSelected)) ['bFilter', 'bFilterFast', 'bSort', 'bSortFast'].map(x => enableButton(x));
}
function clsGetHeaderMapping(clauses, sorting) {
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${clauses}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${clauses}`);
	//jetzt hab ich die clauses!

	sc = stringAfter(sc, 'SELECT');
	let selectHeaders = sc.split(',').map(x => x.includes(' as ') ? stringAfter(x, ' as ') : x.includes(' AS ') ? stringAfter(x, ' AS ') : x);
	
	selectHeaders=selectHeaders.map(x=>trimQuotes(x)); //console.log('select headers:', selectHeaders);
	//assertion(false,"*** THE END ***")

	//die sorting params sollen jetzt verwandelt werden in die select headers
	let sortHeaders = Object.keys(sorting).filter(x => isdef(sorting[x]));
	//console.log('sort headers:', sortHeaders);
	let headerMapping = {};
	for (const hSort of sortHeaders) {
		let hSelect = selectHeaders.find(x => x.endsWith(hSort))
		if (hSelect) headerMapping[hSort] = hSelect.includes('.')?hSelect:`"${hSelect}"`;
	}
	return headerMapping;
}
function clsGetHeaderMapping1(clauses, sorting) {
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${clauses}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${clauses}`);
	//jetzt hab ich die clauses!

	sc = stringAfter(sc, 'SELECT');
	let selectHeaders = sc.split(',').map(x=>x.trim());
	let res = [];
	for(const h of selectHeaders){
		let parts = splitAtStringCI(h, ' as ');
		//console.log(parts);
		addIf(res,{use:parts[0].trim(),compare:parts.length>1?parts[1].trim():parts[0].trim()});
	}
	selectHeaders = res;
	
	//selectHeaders=selectHeaders.map(x=>trimQuotes(x)); console.log('select headers:', selectHeaders);
	//assertion(false,"*** THE END ***")

	//die sorting params sollen jetzt verwandelt werden in die select headers
	let sortHeaders = Object.keys(sorting).filter(x => isdef(sorting[x]));
	//console.log('sort headers:', sortHeaders);
	let headerMapping = {};
	for (const hSort of sortHeaders) {
		let hSelect = selectHeaders.find(x => x.compare.endsWith(hSort))
		if (hSelect) headerMapping[hSort] = hSelect.use.includes('.')?hSelect.use:`"${hSelect.use}"`;
	}
	return headerMapping;
}
async function filterRecords(allowEdit = false) {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selitems = getSelItems(); //console.log('selitems', selitems);
	let clauses = splitSQLClauses(q); //console.log(clauses); 

	let whereItems = selitems.filter(x => x.h != 'MCC' && x.h != 'tag_names'); //console.log('whereItems', whereItems);
	let compExp = buildCompExp(whereItems, clauses); //will be null if no suitable whereItems
	if (compExp) {
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + compExp];
		}
		else clauses.WHERE = [`WHERE ${compExp}`];
	}

	//if (isdef(clauses.WHERE)) console.log(clauses.WHERE)

	let havingItems = selitems.filter(x => ['MCC','tag_names'].includes(x.h)); //console.log('havingItems', havingItems);
	compExp = buildCompExp(havingItems, clauses); //console.log(compExp); //will be null if no suitable whereItems


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
function generateCompExp(cells) {
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
		let cl = rcells.map(cell => generateEquals(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x => !isEmpty(x))
	ands = arrRemoveDuplicates(ands);
	let res = isEmpty(ands) ? null : ands.join(' OR ');
	return res;
}
function generateEquals(a, text) {	return isEmpty(text) ? `${a} IS NULL OR ${a}=''` : `${a}='${text}'`;}

function getHeaderHtml(header, sorting) {
	let arrowHtml = '';

	if (sorting === 'asc') {
		arrowHtml = ' <span class="arrow">&#9650;</span>'; // Up arrow
	} else if (sorting === 'desc') {
		arrowHtml = ' <span class="arrow">&#9660;</span>'; // Down arrow
	}

	return `${header}${arrowHtml}`;
}
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
function measureRecord(rec) {
	let res = '';
	var di = {
		account_name:145, account_type:140, account_owner:150, amount: 80, asset_name:120, asset_type:120, associated_account: 90, 
		category: 120, dateof: 100, description: 'minmax(200px,1fr)', id: 40,
		report: 80, receiver_name: 140, sender_name: 140, tag_name: 120, tag_names: 'auto', unit: 70, MCC: 60
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
async function menuCloseOverview() { closeLeftSidebar(); mClear('dMain'); M.qHistory = []; }
function onclickShowSchema() {
	let res = dbRaw(`SELECT sql FROM sqlite_master WHERE type='table';`);
	let text = res.map(({ columns, values }) => {
		// return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
		return values.map(row => row.join('\t')).join('\n');
	}).join('\n\n');
	let d = UI.d;
	mClear(d)
	mText(`<h2>Schema</h2>`, d, { maleft: 12 })
	mDom(d, {}, { tag: 'pre', html: text });
}
async function showRecords(q, dParent, clearInfo = false) {

	//#region vorher
	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	//console.log('________',q)
	q = sqlReplaceStar(q); //console.log(q)
	let records = dbToList(q);
	if (records.length == 0) { mDom(dParent, { className: 'section' }, { html: 'no records found' }); return; }

	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (clearInfo || nundef(DA.info)) DA.info = { sorting: {} };
	DA.info.q = q;
	DA.info.dParent = dParent;
	DA.info.records = records;
	DA.info.headers = headers;
	let tablename = DA.info.tablename = dbGetTableName(q);

	mIfNotRelative(dParent);
	let h= window.innerHeight - 130;
	let d = mDom(dParent, { h, w: window.innerWidth - 110}); //,bg:'red'})
	let dtitle = mDom(d, {w100:true,box:true, bg:'#00000080',fg:'white',padding:10,fz:24}, {html:`${tablename} (${records.length})`});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { h:h-48,bg: 'white', fg: 'black', w100:true, overy: 'auto', display: 'grid', box: true }; //, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(records[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) {
		let th = mDom(dh, { cursor: 'pointer', hpadding: 4 }, { onclick: () => sortRecordsBy(h) });

		let html = getHeaderHtml(h, DA.info.sorting[h])
		mDom(th, {}, { html });
		if (h == 'amount') addSumAmount(th, records);
	}

	let totalRecords = records.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const recpartial = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) { dgrid.removeEventListener('scroll', onScrollGrid); break; }
					recpartial.push(records[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(recpartial);
			}, 0); // Simulate network delay
		});
	}
	//#endregion

	function appendRecords(recpartial) {
		let styles = { cursor: 'pointer', hpadding: 4, vpadding: 1 }; //,'border-bottom': '2px solid #eee' };

		recpartial.forEach(record => {
			let [bg1, bg2] = ['#ffffff', '#00000010'];
			styles.bg = (styles.bg == bg1 ? bg2 : bg1);
			for (const h of headers) {

				let html = record[h];
				styles.align = ['asset_name', 'id', 'report'].includes(h) ? 'center':isNumber(html)? 'right' : isString(html) && html.length < 2 ? 'center' : 'left';
				if (h.includes('amount')) {
					if (!isNumber(html) && isEmpty(html)) console.log('amount empty!', record);
					html = isEmpty(html) ? '0.00' : html.toFixed(2);
				}

				let td = mDom(dgrid, styles, { html, onclick: mToggleSelection });

				let bg = dbFindColor(html, h); if (isdef(bg)) mStyle(td, { bg, fg: 'contrast' });
			}
		});
	}

	//#region nachher
	function loadMoreRecords() {
		loadRecords(currentPage).then(recpartial => {
			appendRecords(recpartial);
			currentPage++;
		});
	}
	async function loadMoreRecordsAsync() {
		let recpartial = await loadRecords(currentPage);
		appendRecords(recpartial);
		currentPage++;
	}
	async function onScrollGrid() {
		//console.log('hallo!', dgrid.scrollTop, dgrid.clientHeight, dgrid.scrollHeight);
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight - 20) {
			await loadMoreRecordsAsync();
		}
	}

	dgrid.addEventListener('scroll', onScrollGrid);

	// Load initial records
	await loadMoreRecordsAsync();
	//#endregion
}
async function sortRecordsBy(h, allowEdit = false) {

	let [q, dParent, sorting] = [DA.info.q, DA.info.dParent, DA.info.sorting]; //sorting is a dict by header 'asc','desc'

	let s = sorting[h]; if (s == 'asc') sorting[h] = 'desc'; else if (sorting[h] == 'desc') delete sorting[h]; else sorting[h] = 'asc';
	//assertion(!isEmpty(sorting),`sortRecordsBy ${h} but EMPTY sorting ${sorting}`)

	let clauses = splitSQLClauses(q); //console.log(clauses); 

	let qnew = sqlWithoutClause(clauses, 'ORDER BY'); //remove orderBy from q

	let headerMapping = clsGetHeaderMapping(clauses, sorting); //console.log(headerMapping);//zuerst muss ich alle headers die verwenden kann suchen aus dem SELECT

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
				t.description,
				${s}
				t.report
				`;

		qnew = select + '\n';
		for (const k in clauses) {
			if (['SELECT', 'ORDER BY'].includes(k)) continue;
			for (const a of clauses[k]) qnew += `${a.trim()}\n`;
		}

		qnew += `ORDER BY ${sortKeys.map(x => `${headerMapping[x]} ${sorting[x].toUpperCase()}`).join(', ')}`;

	} else if (!isEmpty(sorting)) {
		qnew += `ORDER BY ${Object.keys(sorting).map(x => `${headerMapping[x]} ${sorting[x].toUpperCase()}`).join(', ')}`;
	}

	//console.log(qnew);
	await showRecords(qnew, dParent);

}
function splitSQLClauses(sql) {
	// Remove all tab or newline characters and trim spaces
	sql = sql.replace(/[\t\n]/g, ' ').trim();

	// Replace multiple consecutive spaces with a single space
	sql = sql.replace(/\s\s+/g, ' ');

	// Remove the last semicolon if present
	if (sql.endsWith(';')) {
		sql = sql.slice(0, -1);
	}

	// Define the regex pattern for SQL clauses
	const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;

	// Split the SQL statement into parts based on the pattern
	const parts = sql.split(pattern).filter(Boolean);
	assertion(parts.length % 2 == 0, 'WTF')
	// console.log(parts.length,parts)
	const clauses = {};
	for (let i = 0; i < parts.length; i += 2) {
		//console.log(parts[i].toUpperCase())
		let key = parts[i].toUpperCase().trim();
		if (nundef(clauses[key])) clauses[key] = [];
		lookupAddToList(clauses, [key], `${key}\n${parts[i + 1]}`);
	}
	return clauses;
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










