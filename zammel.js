
//#region stages showRecord SEHR COOL!!!!

//#region stage 10 (bauomni.js)

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











//#endregion

//#region stage 9
//#region filter records
async function onclickFilter(ev) { await filterRecords(); }
async function onclickFilterFast(ev) { await filterRecords(null, false); }
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
	ands = ands.filter(x => !isEmpty(x))
	let res = isEmpty(ands) ? null : ' HAVING ' + ands.join(' OR ');
	return res;
}
function generateSQLEqualsHAVING(a, text) {
	if (a != 'mcc' && a != 'tag_names') return null;
	//return isNumber(text) ? Number(text) == 0 ? `(${a} IS NULL OR ${a}=0)` : `${a}=${text}`
	if (a == 'mcc' && isEmpty(text)) {
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) IS NULL OR
    group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = ''`;
	} else if (a == 'tag_names' && isEmpty(text)) {
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) IS NULL OR
    group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = ''`;

	} else if (a == 'mcc') {
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = '${text}`;
	} else if (a == 'tag_names') {
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = '${text}'`;
	}
}
function generateSQLEqualsWHERE(a, text) {
	if (a == 'mcc' || a == 'tag_names') return null;
	return isEmpty(text) ? `(${a} IS NULL OR ${a}='')` : `${a}='${text}'`;
}
//#endregion

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
		let cl = rcells.map(cell => generateEquals(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x => !isEmpty(x))
	ands = arrRemoveDuplicates(ands);
	let res = isEmpty(ands) ? null : 'WHERE\n ' + ands.join(' OR ');
	return res;
}
function generateSQLEqualsWHERE(a, text) {
	if (a == 'MCC' || a == 'tag_names') return null;
	return isEmpty(text) ? `(${a} IS NULL OR ${a}='')` : `${a}='${text}'`;
}

function extractFilterExpression() {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selist = Array.from(document.querySelectorAll('.bg_yellow'));
	let selitems = [];
	for (const sel of selist) {
		let o = findElementPosition(sel, 1);
		addKeys({ div: sel, text: sel.innerHTML, header: headers[o.icol] }, o);
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
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + stringAfter(where, 'WHERE')];
		}
		else clauses.WHERE = [where];
	}

	let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	if (having) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING (` + stringAfter(cl, 'HAVING') + ') AND ' + stringAfter(having, 'HAVING')];
		}
		else clauses.HAVING = [having];
	}

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql = '';
	for (const k of order) {
		let list = lookup(clauses, [k]);
		if (!list) continue;
		sql += '\n' + list.join('\n');
	}
	let qnew= sql + ';';
	showRecords(qnew,UI.d);

}
function mistextractFilterExpression() {
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
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + stringAfter(where, 'WHERE')];
		}
		else clauses.WHERE = [where];
	}

	let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	if (having) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING (` + stringAfter(cl, 'HAVING') + ') AND ' + stringAfter(having, 'HAVING')];
		}
		else clauses.HAVING = [having];
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

async function filterRecords(exp, allowEdit = true) {
	//console.log('exp',exp);
	exp = extractFilterExpression();
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }

	await showRecords(exp, DA.info.dParent);

	return;
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];
	if (nundef(exp)) { exp = extractFilterExpression(); }
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	let i = DA.tinfo;
	records = dbToList(exp);
	showChunkedSortedBy(i.dParent, i.title, i.tablename, records, headers, header);
}
function extractFilterExpression() {
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selist = Array.from(document.querySelectorAll('.bg_yellow'));
	let selitems = [];
	for (const sel of selist) {
		let o = findElementPosition(sel, 1);
		addKeys({ div: sel, text: sel.innerHTML, header: headers[o.icol] }, o);
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
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + stringAfter(where, 'WHERE')];
		}
		else clauses.WHERE = [where];
	}

	let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	if (having) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING (` + stringAfter(cl, 'HAVING') + ') AND ' + stringAfter(having, 'HAVING')];
		}
		else clauses.HAVING = [having];
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
function mistextractFilterExpression() {
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
		if (isdef(clauses.WHERE)) {
			let cl = clauses.WHERE[0];
			clauses.WHERE = [`WHERE ` + stringAfter(cl, 'WHERE') + ' AND ' + stringAfter(where, 'WHERE')];
		}
		else clauses.WHERE = [where];
	}

	let having = generateSQLHavingClause(selitems); //console.log('!!!!',having)
	if (having) {
		if (isdef(clauses.HAVING)) {
			let cl = clauses.HAVING[0];
			clauses.HAVING = [`HAVING (` + stringAfter(cl, 'HAVING') + ') AND ' + stringAfter(having, 'HAVING')];
		}
		else clauses.HAVING = [having];
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

//#region sorting records ui
function qTTColsSorted(sorting) {
	if (nundef(sorting)) sorting=DA.info.sorting;
	let recs = dbToList('select * from tags',false);
	//console.log(recs)
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));

	let sortKeys = Object.keys(sorting);
	let keysFirst = sortKeys.filter(x=>isdef(sorting[x]));
	let keysOther = sortKeys.filter(x=>!keysFirst.includes(x));
	names = keysFirst.concat(arrMinus(names,keysFirst));

	//console.log(names);
	let s='';
	for(const name of names){
		s+=`MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}'`;
		if (name != arrLast(names)) s+=',';
	}

  let q = `
    SELECT 
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
			${s},
			t.description
    FROM 
      transactions t
    JOIN 
      accounts sender ON t.sender = sender.id
    JOIN 
      accounts receiver ON t.receiver = receiver.id
    JOIN 
      assets a ON t.unit = a.id
		LEFT JOIN 
			transaction_tags tt ON t.id = tt.id
		LEFT JOIN 
			tags tg ON tt.tag_id = tg.id
    GROUP BY 
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit
  `;

	if (!isEmpty(sortKeys)){
		q+= `ORDER BY`;
		if (!isEmpty(keysFirst)) q+=` ${keysFirst.map(x => x + ' DESC').join(', ')}`;
		if (!isEmpty(keysOther)) q+=` ${keysOther.map(x => x + ` ${sorting[x].toUpperCase()}`).join(', ')}`;
	}

	return q+';';
}
async function onclickAscDescButton(ev) {
	let inp = ev.target;
	console.log(':::', inp)
}
function onToggleState(ev, states, colors) {
	let elem = ev.target;
	toggleState(elem, states, colors);
}
async function sortRecords(headerlist, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	if (nundef(headerlist)) {
		let cells = DA.cells;
		let selitems = cells.filter(x => x.isSelected); console.log(selitems);
		headerlist = selitems.map(x => x.header);
	}
	assertion(!isEmpty(headerlist), 'sortRecords with empty headerlist!!!');

	console.log(headerlist);

	let result = await mGather(null, {}, { content: { func: uiTypeSortForm, data: headerlist }, type: 'freeForm' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);
	return;
	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}
function uiGadgetTypeFreeForm(dParent, content, resolve, styles = {}, opts = {}) {
	addKeys({ hmax: 500, wmax: 200, bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let innerStyles = { hmax, wmax, box: true };
	let d = mDom(dOuter, innerStyles, opts);
	content.func(d, content.data, resolve);
	return dOuter;
}
async function uiTypeSortForm(dParent, data, resolve) {
	//was will ich von der sort form? reihenfolge der keys, up/down sort, 
	console.log(data);

	let headerlist = data;

	let dlist = mDom(dParent);
	for (const h of headerlist) {

		let d = mDom(dlist, { className: 'centerFlexV', gap: 4 });
		let d1 = mDom(d, {}, { html: h });
		let b = mToggleButton('asc', 'desc', null, d)


	}


	let handler = () => resolve(null);
	// mButton('done', handler, d, { classes: 'input', margin: 10 });
}
//#endregion
//#region menu overview

function onclickTesttrans() { let records = dbToList(qTT()); showTableSortedBy(UI.d, 'TEST', 'transactions', records); }
function onclickTranslist() { let records = dbToList(qTTList()); showChunkedSortedBy(UI.d, 'tag list', 'transactions', records); }
function onclickTranscols() { let records = dbToList(qTTCols()); showChunkedSortedBy(UI.d, 'tag columns', 'transactions', records); }
function onclickTransactions() { let records = dbToList(qTransactions()); showChunkedSortedBy(UI.d, 'transactions', 'transactions', records); }
function onclickFlex() { let records = dbToList(qTransFlex()); showTableSortedBy(UI.d, 'flex-perks', 'transactions', records); }
function onclickTagged() { let records = dbToList(qTranstags()); showTableSortedBy(UI.d, 'tagged transactions', 'transactions', records); }
function onclickMultiTagged() { let records = dbToList(qTransmultitag()); showTableSortedBy(UI.d, 'transactionsw/  multiple tags', 'transactions', records); }
function onclickLimit20() { let records = dbToList(qLimit20()); showTableSortedBy(UI.d, '20 transactions', 'transactions', records); }

function onclickReports() { let records = dbToList('select * from reports;'); showTableSortedBy(UI.d, 'reports', 'reports', records); }
function onclickAssets() { let records = dbToList('select * from assets;'); showTableSortedBy(UI.d, 'assets', 'assets', records); }
function onclickTags() { let records = dbToList('select * from tags;'); showTableSortedBy(UI.d, 'tags', 'tags', records); }
function onclickAccounts() { let records = dbToList('select * from accounts;'); showTableSortedBy(UI.d, 'accounts', 'accounts', records); }
function onclickStatements() { let records = dbToList('select * from statements;'); showTableSortedBy(UI.d, 'statements', 'statements', records); }
function onclickVerifications() { let records = dbToList('select * from verifications;'); showTableSortedBy(UI.d, 'verifications', 'verifications', records); }
function onclickTRevisions() { let records = dbToList('select * from transaction_revisions;'); showTableSortedBy(UI.d, 'transaction revisions', 'transaction_revisions', records); }
//#endregion
//#region show
function showTableSortedBy(dParent, title, tablename, records, headers, header) {
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header = headers[0];
	console.log('___ show Full Table', Counter++, DA.tinfo);
	console.log(DA.sortedBy, header);

	if (isList(header)) DA.sortedBy = null; //ist multi-sorted!
	else if (DA.sortedBy == header) { sortBy(records, header); DA.sortedBy = null; }
	else { sortByDescending(records, header); DA.sortedBy = header; }
	if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dParent);
	mText(`<h2>${title} (${tablename})</h2>`, dParent, { maleft: 12 })
	let t = UI.dataTable = mDataTable(records, dParent, null, headers, 'records');
	if (nundef(t)) return;
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = () => showTableSortedBy(dParent, title, tablename, records, headers, ui.innerHTML);
	}
	if (tablename != 'transactions') return records;
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	}
}
//#endregion

function extractHeadersFromSelect(sc) {
	sc = stringAfter(sc, 'SELECT');
	scs = sc.split(',').map(x => x.trim()).map(x => x.includes(' as ') ? stringAfter(x, ' as ').trim() : x);
	//scs.map(x=>console.log(x));
	return scs;
}
async function onclickSort(ev) { await sortRecordsBy(); }
async function onclickSortFast(ev) { await sortRecords(null, false); }

async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar('dLeft',110);
	UI.d = mDom('dMain'); //, { className: 'section' });
	let gap = 5;

	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure',{}); mNewline(side.d, gap);mLinebreak(side.d, 10);
	UI.commands.translist = mCommand(side.d, 'translist', 'translist',{},{open:()=>showRecords(qTTList(),UI.d)}); mNewline(side.d, gap);
	//UI.commands.translistlegacy = mCommand(side.d, 'translistlegacy', 'legacy',{open:onclickTranslist}); //()=>showRecords(qTTList())}); mNewline(side.d, gap);
	// UI.commands.transcols = mCommand(side.d, 'transcols', 'transcols'); mNewline(side.d, gap);
	// mLinebreak(side.d, 10);
	// UI.commands.reports = mCommand(side.d, 'reports', 'reports'); mNewline(side.d, gap);
	// UI.commands.assets = mCommand(side.d, 'assets', 'assets'); mNewline(side.d, gap);
	// UI.commands.tags = mCommand(side.d, 'tags', 'tags'); mNewline(side.d, gap);
	// UI.commands.accounts = mCommand(side.d, 'accounts', 'accounts'); mNewline(side.d, gap);
	// UI.commands.statements = mCommand(side.d, 'statements', 'statements'); mNewline(side.d, gap);
	// UI.commands.verifications = mCommand(side.d, 'verifications', 'verifications'); mNewline(side.d, gap);
	// UI.commands.tRevisions = mCommand(side.d, 'tRevisions', 'transaction revisions'); mNewline(side.d, gap);

	await onclickCommand(null, 'translist');
}
function showNavMenuRest(){
	
	let dTop=mDom(dNav,{class:'centerFlexV'});
	//let dlogo = mDom(dTop, { fz:34 }, { html: `Omnifin` });

	mDom(dTop, { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let dm = mDom(dTop, { gap: 10, className: 'centerflexV' }); 
	let nav = mMenu(dm);
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;

	mLinebreak(dTop);
	let db = mDom(dTop, { maleft:110, gap: 10, className: 'centerflexV' },{id:'dButtons'}); 
	// mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('clear sorting', ()=>DA.info.sorting={}, db, {}, 'button', 'bSortFast');
	// mButton('clear filters', ()=>DA.info.filter={}, db, {}, 'button', 'bSortFast');
	// mButton('sort', onclickSortFast, db, {}, 'button', 'bSortFast');
	// mButton('filter', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	// mButton('custom filter', onclickFilter, db, {}, 'button', 'bFilter'); 
	// mButton('custom sort', onclickSort, db, {}, 'button', 'bSort');
	// // mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');

	// mDom(db,{w:20})
	// mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	// mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	// mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');


	return nav;
}

//#endregion

//#region stage 8
function showNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	
	let dTop=mDom(dNav,{class:'centerFlexV'});
	//let dlogo = mDom(dTop, { fz:34 }, { html: `Omnifin` });

	mDom(dTop, { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let dm = mDom(dTop, { gap: 10, className: 'centerflexV' }); 
	let nav = mMenu(dm);
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;

	mLinebreak(dTop);
	let db = mDom(dTop, { maleft:110, gap: 10, className: 'centerflexV' },{id:'dButtons'}); 
	// mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('clear sorting', ()=>DA.info.sorting={}, db, {}, 'button', 'bSortFast');
	// mButton('clear filters', ()=>DA.info.filter={}, db, {}, 'button', 'bSortFast');
	// mButton('sort', onclickSortFast, db, {}, 'button', 'bSortFast');
	// mButton('filter', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	// mButton('custom filter', onclickFilter, db, {}, 'button', 'bFilter'); 
	// mButton('custom sort', onclickSort, db, {}, 'button', 'bSort');
	// // mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');

	// mDom(db,{w:20})
	// mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	// mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	// mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');


	return nav;
}
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar('dLeft',110);
	UI.d = mDom('dMain'); //, { className: 'section' });
	let gap = 5;

	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);mLinebreak(side.d, 10);
	UI.commands.translist = mCommand(side.d, 'translist', 'translist',{open:()=>showRecords(qTTList(),UI.d)}); mNewline(side.d, gap);
	//UI.commands.translistlegacy = mCommand(side.d, 'translistlegacy', 'legacy',{open:onclickTranslist}); //()=>showRecords(qTTList())}); mNewline(side.d, gap);
	// UI.commands.transcols = mCommand(side.d, 'transcols', 'transcols'); mNewline(side.d, gap);
	// mLinebreak(side.d, 10);
	// UI.commands.reports = mCommand(side.d, 'reports', 'reports'); mNewline(side.d, gap);
	// UI.commands.assets = mCommand(side.d, 'assets', 'assets'); mNewline(side.d, gap);
	// UI.commands.tags = mCommand(side.d, 'tags', 'tags'); mNewline(side.d, gap);
	// UI.commands.accounts = mCommand(side.d, 'accounts', 'accounts'); mNewline(side.d, gap);
	// UI.commands.statements = mCommand(side.d, 'statements', 'statements'); mNewline(side.d, gap);
	// UI.commands.verifications = mCommand(side.d, 'verifications', 'verifications'); mNewline(side.d, gap);
	// UI.commands.tRevisions = mCommand(side.d, 'tRevisions', 'transaction revisions'); mNewline(side.d, gap);

	await onclickCommand(null, 'translist');
}
function sqlUpdateOrderBy(q, sorting) {
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

async function sortRecordsBy(h, allowEdit = false){
	//sorting is a dict by header 'asc','desc'
	let [q,dParent,sorting]=[DA.info.q,DA.info.dParent,DA.info.sorting];

	let s=sorting[h];if (s == 'asc') sorting[h]='desc'; else sorting[h]='asc';

	let q1=sqlUpdateOrderBy(q, sorting); console.log(q1); //return;

	await showRecords(q1,dParent);

}
async function filterRecords(exp, allowEdit = true) {
	//console.log('exp',exp);
	exp = extractFilterExpression();
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }

	await showRecords(exp,DA.info.dParent);

	return;
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];
	if (nundef(exp)) { exp = extractFilterExpression(); }
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	let i = DA.tinfo;
	records = dbToList(exp);
	showChunkedSortedBy(i.dParent, i.title, i.tablename, records, headers, header);
}
async function showRecords(q, dParent) {

	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	let recs = dbToList(q); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(DA.info)) DA.info={sorting:{}};
	DA.info.q=q;
	DA.info.dParent=dParent;
	DA.info.records=recs;
	DA.info.headers=headers;
	//let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mIfNotRelative(dParent);
	let d=mDom(dParent,{position:'absolute',h:window.innerHeight-135,w:window.innerWidth-110});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { bg:'white', fg:'black', margin:10, w:'98%', h:'97%', overy: 'auto', display: 'grid', gap: 4, box: true, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(recs[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) { 
		let th = mDom(dh, { cursor: 'pointer' }, { html: h, onclick: ()=>sortRecordsBy(h) }); 
	}

	let totalRecords = recs.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const records = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					records.push(recs[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(records);
			}, 0); // Simulate network delay
		});
	}

	function appendRecords(records) {
		let styles = {cursor:'pointer'};
		records.forEach(record => {
			for (const h of headers) {

				let html = record[h];
				styles.align = isNumber(html)?'right':'left';
				if (h.includes('amount')) html = html.toFixed(2);

				let td = mDom(dgrid, styles, { html,onclick:mToggleSelection });
			}
		});
	}

	function loadMoreRecords() {
		loadRecords(currentPage).then(records => {
			appendRecords(records);
			currentPage++;
		});
	}
	async function loadMoreRecordsAsync() {
		let records = await loadRecords(currentPage);
		appendRecords(records);
		currentPage++;
	}

	dgrid.addEventListener('scroll', () => {
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	await loadMoreRecordsAsync();
}

function sqlUpdateOrderBy(q, headers, aggregate=true) {
	let clauses = splitSQLClauses(q); // console.log('clauses',clauses)

	let cl=clauses['ORDER BY'];
	let sofar = aggregate && isdef(cl)? toWords(stringAfter(cl[0],'ORDER BY'),true):[];
	//console.log('___',sofar);
	headers.map(x=>addIf(sofar,x));

	let qnew = '';
	for(const k in clauses){
		if (k == 'ORDER BY') continue;
		for(const a of clauses[k]) qnew+= `${a.trim()}\n`;
	}

	qnew += `ORDER BY ${sofar.join(', ')};`;// = Object.values(clauses).join('\n')+ ' ' + cl;
	return qnew;
}

//#endregion

//#region stage 7
async function showRecords(q, dParent) {

	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	let recs = dbToList(q); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	DA.info = { q };//d: dParent, recs, headers };
	//let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mIfNotRelative(dParent);
	let d=mDom(dParent,{position:'absolute',h:window.innerHeight-135,w:window.innerWidth-110});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { bg:'white', fg:'black', margin:10, w:'98%', h:'97%', overy: 'auto', display: 'grid', gap: 4, box: true, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(recs[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) { 
		let th = mDom(dh, { cursor: 'pointer' }, { html: h, onclick: mToggleSelection }); 
	}

	let totalRecords = recs.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const records = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					records.push(recs[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(records);
			}, 0); // Simulate network delay
		});
	}

	function appendRecords(records) {
		let styles = {cursor:'pointer'};
		records.forEach(record => {
			for (const h of headers) {

				let html = record[h];
				styles.align = isNumber(html)?'right':'left';
				if (h.includes('amount')) html = html.toFixed(2);

				let td = mDom(dgrid, styles, { html,onclick:mToggleSelection });
			}
		});
	}

	function loadMoreRecords() {
		loadRecords(currentPage).then(records => {
			appendRecords(records);
			currentPage++;
		});
	}

	dgrid.addEventListener('scroll', () => {
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	loadMoreRecords();
}
async function filterRecords(exp, allowEdit = true) {
	console.log('exp',exp);
	exp = extractFilterExpression(q);

	return;
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];
	if (nundef(exp)) { exp = extractFilterExpression(); }
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	let i = DA.tinfo;
	records = dbToList(exp);
	showChunkedSortedBy(i.dParent, i.title, i.tablename, records, headers, header);
}
function extractFilterExpression() {
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


//#endregion

//#region stage 6
function generateSQLOrderByClause(headers) {
	let res = 'ORDER BY ' + headers.join(',');
	return res;
}

function sqlUpdateOrderBy(q, headers, aggregate=true) {
	let clauses = splitSQLClauses(q);  console.log('clauses',clauses)

	let cl=clauses['ORDER BY'];
	if (nundef(cl)) cl='ORDER BY ' + headers.join(',');
	else {
		let otherHeaders = stringAfter(cl[0],'ORDER BY').trim();
		otherHeaders = toWords(otherHeaders,true);
		console.log(otherHeaders);
		headers.map(x=>addIf(otherHeaders,x));
		cl = 'ORDER BY ' + headers.join(',');

	}

	delete clauses['ORDER BY'];

	let qnew = '';
	for(const k in clauses){
		for(const a of clauses[k]) qnew+= `${a.trim()}\n`
	}
	qnew += `${cl}`;// = Object.values(clauses).join('\n')+ ' ' + cl;
	return qnew;
}

async function showRecords(q,dParent) {

	let recs = dbToList(q); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	//let info = DA.info = { d: dParent, recs, headers };

	let styles = {w100:true,h:400,overy:'auto',display:'grid',gap:10,hpadding:10, box:true,border:'1px solid #ddd',};
	styles.gridCols = measureRecord(recs[0]);

	// let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
	let gridContainer = mDom(dParent, styles, { id: 'gridContainer' });

	let dh=mDom(gridContainer,{className:'gridHeader'});
	for(const h of headers) {
		mDom(dh,{},{html:h});
	}
	//return;

	let totalRecords = recs.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const records = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					records.push(recs[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(records);
			}, 0); // Simulate network delay
		});
	}

	function appendRecords(records) {
		records.forEach(record => {
			for (const h of headers) {
				mDom(gridContainer, {}, { html: record[h] });
			}
	
			// const item = document.createElement('div');
			// item.className = 'gridItem';
			// item.textContent = record.dateof;
			// gridContainer.appendChild(item);
		});
	}

	function loadMoreRecords() {
		loadRecords(currentPage).then(records => {
			appendRecords(records);
			currentPage++;
		});
	}

	gridContainer.addEventListener('scroll', () => {
		if (gridContainer.scrollTop + gridContainer.clientHeight >= gridContainer.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	loadMoreRecords();
}

//#endregion

//#region stage 6
function gridAddRows(dgrid, records, headers, ifrom, n) {
	ifrom = valf(ifrom, 0); console.log(ifrom);
	n = valf(n, records.length - ifrom);
	for (const rec of arrTake(records, n, ifrom)) {
		for (const h of headers) {
			mDom(dgrid, {}, { html: rec[h] });
		}
	}
	return ifrom + n;
}
function gridCreate(dParent, records, headers) {
	let [rows, cols] = [records.length, headers.length];
	let styles = { gap: 4, overy: 'auto', display: 'inline-grid' }; //, gridRows: 'repeat(' + rows + ',auto)' };
	styles.gridCols = measureRecord(records[0]); // '1fr 3fr 2fr 2fr 4fr 1fr 1fr 1fr 3fr';
	//styles.gridCols = 'repeat(' + cols + ',auto)'
	//addKeys({ display: 'inline-grid', gridCols: 'repeat(' + cols + ',1fr)' }, styles);
	let dgrid = mDiv(dParent, styles);
	return dgrid;
}

//#endregion

//#region stage 5

function showRecords(q, dParent, info = {}) {
	//info may contain: records,headers,sorting=dict per header,w=dict per header,header
	showRecordsPrep(q, dParent, info);
	let [records, headers, header, t, sorting, diw] = [info.records, info.headers, info.header, info.t, info.sorting, info.diw];

	//tSortRecords(records,header,sorting);

	tAddHeaders(t,headers);

	tLoadMoreRows(t, records, headers, diw);

	setTimeout(()=>weiter(info),10); 
}
function weiter(info){
	let [records, headers, sorting, diw, header, tablename, tCont, t, q, dParent]=[info.records, info.headers, info.sorting, info.diw, info.header, info.tablename, info.tCont, info.t, info.q, info.dParent];
	
	
	tLoadRowsRest(t, records, headers, diw);
	console.log('DONE!')
	// tLoadMoreRows(t, records, headers,diw);
	// tCont.onscroll = () => tIfCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	tOnClickHeaders(t, q, dParent, info);
	console.log(info)

	//infoNew.wHeaders = tGetHeaders(t).map(x => x.offsetWidth); //console.log(infoNew.wHeaders)


	// addSumAmount(findHeaderWithName(t, 'amount'), records);

	// activateResizers(t)

}
function tAddHeaders(t,headers){
	let thead = mDom(t, {}, { tag: 'thead' });
	let tbody = mDom(t, {}, { tag: 'tbody' });
	let rHeaders = mDom(thead, {}, { tag: 'tr' });
	headers.forEach((hdr, i) => {
		let th = mDom(rHeaders, {className:'sortable'}, { tag: 'th',dataIndex:i });
		let d1 = mDom(th, {}, { html: hdr });
		let d2 = mDom(th); //fuer extra infos
		let dres = mDom(th, { className: 'resizer' });
		//let th = mDom(rHeaders, {}, { tag: 'th', html: `${hdr}<div class="resizer">&nbsp;</div>`, sortDir: hdr == header ? sortDir : null });
		//if (isdef(DA.wHeaders[hdr])) mStyle(th, { w: DA.wHeaders[hdr] });
	});
}
function tGetHeaderFromUi(ui){return ui.firstChild.innerHTML;}
function tGetHeaderUis(t) { return Array.from(t.querySelectorAll('th.sortable')); } //t.firstChild.getElementsByTagName('th')); }

function tIfCloseToBottomLoadMoreRecords(tCont, t, records, headers) {
	//console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		tLoadMoreRows(t, records, headers);
	}
}
function tLoadMoreRows(t, recs, headers,diw={}) {
	let tbody = t.querySelector('tbody');
	let irow = arrChildren(tbody).length; // assumes headers shown!
	let n = 30;
	for (const rec of arrTake(recs, n, irow)) {
		let r = mDom(tbody, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = rec[k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			//if (isdef(diw[k])) {mStyle(c, { w:diw[k] });console.log(diw[k]);}
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}
function tSortRecords(records,header,sorting={}){
	let sortCur = sorting[header];
	let sortDir = sortCur == 'asc' ? 'desc' : 'asc';
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);
	sorting[header] = sortDir;
	return [sorting,records];
}
function showRecordsPrep(q, dParent, info) {
	addKeys({sorting:{},diw:{id:40,dateof:40}},info);
	let records = valf(info.records, dbToList(q));
	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 }); mLinebreak(dParent);
	if (records.length == 0) return;
	let headers = valf(info.headers, Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header, headers[0]);
	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let t = mDom(tCont, { className: 'table', w100: true }, { tag: "table" });
	[info.records, info.headers, info.header, info.tablename, info.tCont, info.t, info.q,info.dParent]=[records, headers, header, tablename, tCont, t, q,dParent];
	//return [records, headers, header, tablename, tCont, t];
}

function tOnClickHeaders(t, q, dParent, info) {
	let headers = t.querySelectorAll('th.sortable');
	headers.forEach(header => {
		header.addEventListener('click', () => {
			const index = header.getAttribute('dataIndex');
			const order = header.classList.contains('asc') ? 'desc' : 'asc';
			sortTableByColumn(t, index, order);
			headers.forEach(h => h.classList.remove('asc', 'desc'));
			header.classList.add(order);
		});
	});
}
function sortTableByColumn(table, columnIndex, order) {
	const tbody = table.querySelector('tbody');
	const rows = Array.from(tbody.querySelectorAll('tr'));
	console.log(columnIndex)

	rows.sort((a, b) => {
		const cellA = a.children[columnIndex].innerText.toLowerCase();
		const cellB = b.children[columnIndex].innerText.toLowerCase();

		if (!isNaN(cellA) && !isNaN(cellB)) {
			return order === 'asc' ? cellA - cellB : cellB - cellA;
		}

		return order === 'asc' 
			? cellA.localeCompare(cellB) 
			: cellB.localeCompare(cellA);
	});

	rows.forEach(row => tbody.appendChild(row));
}

function tLoadRowsRest(t, records, headers, diw = {}) {
	let tbody = t.querySelector('tbody');
	let irow = arrChildren(tbody).length; // assumes headers shown!
	while (irow < records.length) {
		let r = mDom(tbody, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = records[irow][k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			//if (isdef(diw[k])) mStyle(c, { w: diw[k] });
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}
function tLoadRowsByChunk(t, records, headers, diw = {}) {
	let tbody = t.querySelector('tbody');
	let nChunk = 30;
	let irow = arrChildren(tbody).length; // assumes headers shown!
	while (irow < records.length) {
		for (const rec of arrTake(records, nChunk, irow)) {
			let r = mDom(tbody, {}, { tag: 'tr' });
			let icol = -1;
			for (const k of headers) {
				let html = rec[k];
				icol++;
				let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
				let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
				if (isdef(diw[k])) mStyle(c, { w: diw[k] });
				c.onclick = () => toggleItemSelection(c);
			}
			irow++;
		}
	}

}


//#endregion

//#region stage 4
function activateResizers(t){
	const resizers = document.querySelectorAll('.resizer');

	for(const resizer of resizers){
		resizer.addEventListener('mousedown',e=>startResizing(e,resizer));
	}
	
	function startResizing(e,resizer){
		evNoBubble(e);
		DA.isResizing = true;
		let info=DA.resinfo={};
		info.currentResizer = resizer;
		info.startX = e.pageX;
		let th = info.th = info.currentResizer.parentElement;
		info.header = firstWord(th.innerHTML);
		info.startWidth = info.th.offsetWidth;
		//document.mousemove = 
		resizer.addEventListener('mousemove', resizeColumn);
		resizer.addEventListener('mouseup', stopResize);
	}
	function stopResize(e) {
		console.log('stopResize!')
		evNoBubble(e);
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
	function doDrag(ev){
		let info=DA.resinfo;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';

	}
	function resizeColumn(e){
		evNoBubble(e);
		let info=DA.resinfo;
		document.addEventListener('mousemove', doDrag);
		document.addEventListener('mouseup', stopDrag);
	}
	function stopDrag() {
		console.log('stopDrag!')
		let info = DA.resinfo;
		DA.resinfo = null;
		DA.isResizing = false;
		DA.wHeaders[info.header]=firstNumber(info.th.style.width); console.log(DA.wHeaders);
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}
}
function handleScroll() {
	console.log('scrolling...')
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
		console.log('DO IT NOW!!!');
	}
};
function showRecords(q, dParent, info = {}) {
	//info may contain: records,headers,sorting=dict per header,header
	let records = valf(info.records, dbToList(qTTList()));
	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 }); mLinebreak(dParent);
	if (records.length == 0) return;

	let headers = valf(info.headers, Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header, headers[0]);
	if (nundef(DA.wHeaders)) {
		DA.wHeaders = {id:40,dateof:40};
	}
	let sorting = valf(info.sorting, {});
	let sortCur = sorting[header];
	let sortDir = sortCur == 'asc' ? 'desc' : 'asc';
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);
	console.log('showRecords', header, sortDir)
	sorting[header] = sortDir;
	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' });
	//console.log('wHeaders:',info.wHeaders)
	headers.forEach((hdr, i) => {
		let th = mDom(rHeaders, {}, { tag: 'th', html: `${hdr}<div class="resizer">&nbsp;</div>`, sortDir: hdr == header ? sortDir : null });
		if (isdef(DA.wHeaders[hdr])) mStyle(th, { w: DA.wHeaders[hdr] });
	});
	//headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: `${x}<div class="resizer">&nbsp;</div>`, sortDir: x == header ? sortDir : null }));
	let infoNew = { records, headers, header, sorting }; //console.log('showRecords_sorting:', infoNew.header, infoNew.sorting[header]);

	loadMoreRows(t, records, headers);
	//infoNew.wHeaders = tGetHeaders(t).map(x => x.offsetWidth); //console.log(infoNew.wHeaders)

	headersOnClickSort(t, q, dParent, infoNew);

	tCont.onscroll = () => ifCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	addSumAmount(findHeaderWithName(t, 'amount'), records);

	activateResizers(t)

}
function _1activateResizers(t){
	const resizers = document.querySelectorAll('.resizer');
	let currentResizer;
	const info={};

	resizers.forEach(resizer => {
		resizer.addEventListener('mousedown', (e) => {
			currentResizer = resizer;
			document.addEventListener('mousemove', resizeColumn);
			document.addEventListener('mouseup', stopResize);
		});
	});

	function resizeColumn(e) {
		const th = currentResizer.parentElement;
		const startX = e.pageX;
		const startWidth = th.offsetWidth;
		const table = th.closest('table');
		const columnIndex = Array.from(th.parentNode.children).indexOf(th);

		const doDrag = (event) => {
			const newWidth = startWidth + (event.pageX - startX);
			table.querySelectorAll('tr').forEach(row => {
				row.children[columnIndex].style.width = newWidth + 'px';
			});
		};

		document.addEventListener('mousemove', doDrag);

		function stopDrag() {
			document.removeEventListener('mousemove', doDrag);
			document.removeEventListener('mouseup', stopDrag);
		}

		document.addEventListener('mouseup', stopDrag);
	}

	function stopResize() {
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
}

function activateColumnResizers(t) {
	const resizers = document.querySelectorAll('.resizer');
	resizers.forEach(elem => {
		elem.mousedown = ev => {
			evNoBubble(e);
			DA.isResizing = true;
			let info = DA.resizeInfo = {};
			info.startX = e.pageX;
			info.th = elem.parentElement;
			info.startWidth = info.th.offsetWidth;
			const doDrag = (ev) => {
				console.log('hallo')
				let info=DA.resizeInfo;
				const newWidth = info.startWidth + (ev.pageX - info.startX);
				info.th.style.width = newWidth + 'px';
			};
		
			document.addEventListener('mousemove', doDrag);
			// elem.parentNode.parentNode.mousemove = ev=>{
			// 	let info=DA.resizeInfo;
			// 	const newWidth = info.startWidth + (ev.pageX - info.startX);
			// 	mStyle(info.th,{w:newWidth}); 
			// }
			elem.mouseup = e => {
				document.removeEventListener('mousemove', doDrag);
				if (!DA.isResizing) return;
				elem.mouseup = null;
				let info = DA.resizeInfo;
				const newWidth = info.startWidth + (ev.pageX - info.startX);
				mStyle(info.th, { w: newWidth });
				DA.isResizing = false;
				delete DA.resizeInfo;
			}
		}
	});
}

function findHeaderWithName(t, name) {
	let headeruis = tGetHeaders(t);
	return headeruis.find(x => firstWord(x.innerHTML, true) == name)
}
function headersOnClickSort(t, q, dParent, info) {
	let headeruis = tGetHeaders(t);
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' }); //console.log(ui,firstWord(ui.innerHTML),ui.offsetWidth); //mGetStyle(ui,'w'),getRect(ui))
		ui.onclick = (ev) => {
			evNoBubble(ev);
			if (DA.isResizing) return;
			info.header = firstWord(ui.innerHTML, true);
			showRecords(q, dParent, info);
		}
	}
}
function ifCloseToBottomLoadMoreRecords(tCont, t, records, headers) {
	//console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		loadMoreRows(t, records, headers);
	}
}
function loadMoreRows(t, recs, headers) {
	let irow = arrChildren(t).length - 1; // assumes headers shown!
	let n = 50;
	for (const rec of arrTake(recs, n, irow)) {
		let r = mDom(t, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = rec[k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			let w=lookup(DA,['wHeaders',k]); if (w) mStyle(c,{w});
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}
function mToggleSelection(elem) {
	let att = elem.getAttribute('selected');
	elem.setAttribute(!att)
	if (att == 'true') mClass(elem, 'framedPicture'); else mRemoveClass(elem, 'framedPicture');
}
function tGetHeaders(t) { return Array.from(t.firstChild.getElementsByTagName('th')); }

function colorCells(t, tablename) {
	let headers = tGetHeaders(t).map(x => firstWord(x.innerHTML, true));
	for (const cell of t.getElementsByTagName('td')) {//rowItems) {
		console.log('cell', cell);
		let bg = dbFindColor(tablename, headers[Number(cell.getAttribute('icol'))], cell.innerHTML);
		if (nundef(bg)) continue;
		mStyle(cell, { bg, fg: 'contrast' });
		// 	if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
	}
	return;
	// let r = iDiv(ri);

	// //console.log(r,arrChildren(r)); break;
	// //let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	// let tds = arrChildren(r);
	// for (const ui of tds) {
	// 	let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowItems.indexOf(ri), icol: tds.indexOf(ui) };
	// 	item.header = headers[item.icol];
	// 	cells.push(item);
	// 	let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
	// 	mStyle(ui, { cursor: 'pointer' });
	// 	if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
	// 	ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
	// }
}
function _showRecords(q, dParent, headers, header, sortDir = 'asc') {
	onresize = null;

	if (tablename != 'transactions') return;
	let cells = DA.cells = [];
	for (const ri of t.rowItems) {
		let r = iDiv(ri);
		//console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		let tds = arrChildren(r);
		for (const ui of tds) {
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowItems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo = { sortDir, records, headers, header, div: dParent, q, tablename };
	checkButtons();
	resizeMain('dNav', dParent, dTitle, dTable);
	onresize = () => resizeMain('dNav', dParent, dTitle, dTable);
	// let h=calcHeightLeftUnder(dTitle)-14;console.log(h)
	// mStyle(dTable,{h})
}
function resizeMain(dNav, dParent, dTitle, dTable) {
	dNav = toElem(dNav);
	let [hNav, hParent, hTitle, hTable, hWin] = [mGetStyle(dNav, 'h'), mGetStyle(dParent, 'h'), mGetStyle(dTitle, 'h'), mGetStyle(dTable, 'h'), window.innerHeight];
	console.log(hNav, hParent, hTitle, hTable, hWin);
	let [maxParent, maxTable] = [hWin - hNav, hWin - hNav - hTitle - 20];

	mStyle('dPage', { padding: 0, h: maxParent, hmax: maxParent, overy: 'hidden', bg: '#eee' });
	mStyle(dParent, { padding: 0, h: maxParent, hmax: maxParent, overy: 'hidden', bg: '#eee' });
	mStyle(dTable, { h: maxTable, bg: '#eee' });
}
function showChunk(inc) {
	let o = DA.tinfo;
	let [dParent, title, tablename, dTable, records, headers, header] = [o.dParent, o.title, o.tablename, o.dTable, o.records, o.headers, o.header];
	let [ifrom, ito] = calcIndexFromTo(inc, o); //console.log(ifrom,ito)
	let chunkRecords = records.slice(ifrom, ito);
	if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dTable);
	let t = UI.dataTable = mDataTable(chunkRecords, dTable, null, headers, 'records');
	if (nundef(t)) { console.log('UI.dataTable is NULL'); return; }
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => { evNoBubble(ev); showChunkedSortedBy(dParent, title, tablename, records, headers, ui.innerHTML); }
	}
	addSumAmount(headeruis.find(x => x.innerHTML == 'amount'), o.records);
	if (tablename != 'transactions') return;
	DA.tinfo.ifrom = ifrom;
	let cells = DA.cells = [];
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		//console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		let tds = arrChildren(r);
		for (const ui of tds) {
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowitems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}
//#endregion

//#region super mist alles
function activateColumnResizers(t){
	const resizers = document.querySelectorAll('.resizer');

	for(const resizer of resizers){
		resizer.addEventListener('mousedown',e=>startResizing(e,resizer));
	}
	
	function startResizing(e,resizer){
		evNoBubble(e);
		DA.isResizing = true;
		let info=DA.resizeColumns={};
		info.currentResizer = resizer;
		info.startX = e.pageX;
		info.th = info.currentResizer.parentElement;
		info.startWidth = info.th.offsetWidth;
		//document.mousemove = 
		resizer.addEventListener('mousemove', resizeColumn);
		resizer.addEventListener('mouseup', stopResize);
	}
	function stopResize(e) {
		evNoBubble(e);
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
	function doDrag(ev){
		let info=DA.resizeColumns;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';
	}
	function resizeColumn(e){
		evNoBubble(e);
		let info=DA.resizeColumns;
		document.addEventListener('mousemove', doDrag);
		document.addEventListener('mouseup', stopDrag);
	}
	function stopDrag() {
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}
}

function resizeColumn(e) {
	//console.log('resize');
	evNoBubble(e);
	let info=DA.resizeColumns;

	const doDrag = (ev) => {
		let info=DA.resizeColumns;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';
	};

	document.addEventListener('mousemove', doDrag);

	function stopDrag() {
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}

	document.addEventListener('mouseup', stopDrag);
}
//#endregion

//#region stage 3

function showRecords2(q, dParent, headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	console.log('showRecords', header, sortDir)

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x, sortDir: x == header ? sortDir : null }));
	headersOnClickSort(t, ...arguments);

	tCont.onscroll = () => ifCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	loadMoreRows(t, records, headers);

}
//#endregion

//#region stage 2
function showRecords(q, dParent, headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	console.log('showRecords',header,sortDir)

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x, sortDir:x == header?sortDir:null }));
	headersOnClickSort(t,...arguments);

	tCont.onscroll= () => ifCloseToBottomLoadMoreRecords(tCont,t,records,headers);

	loadMoreRows(t, records, headers);

}
function  ifCloseToBottomLoadMoreRecords(tCont,t,records,headers){
	console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		loadMoreRows(t, records, headers);
	}
}
function headersOnClickSort(t, q, dParent, headers){
	let headeruis = Array.from(t.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => {
			evNoBubble(ev);
			let dir = ui.getAttribute('sortDir'); //asc desc or unset==not sorted yet
			let sortDir = dir == 'asc'?'desc':'asc';
			let text = firstWord(ui.innerHTML); console.log(text,sortDir)
			showRecords(q, dParent, headers, text, sortDir);
		}
	}
}
//#endregion

//#region stage 1
function showRecords(q, dParent, headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x }));

	// tCont.addEventListener('scroll', () => {
	// 	console.log('Element is scrolling');
	// 	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
	// 		console.log('...adding records...');
	// 		loadMoreRows(t, records, headers);
	// 	}
	// });
	// tCont.onscroll= () => {
	// 	console.log('Element is scrolling');
	// 	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
	// 		console.log('...adding records...');
	// 		loadMoreRows(t, records, headers);
	// 	}
	// };
	tCont.onscroll= () => ifCloseToBottomLoadMoreRecords(tCont,t,records,headers);

	loadMoreRows(t, records, headers);

}
function  ifCloseToBottomLoadMoreRecords(tCont,t,records,headers){
	console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		loadMoreRows(t, records, headers);
	}
}
//#endregion

//#region stage 0
function showRecords(q,dParent,headers,header,sortDir='asc'){
	onresize = null;
	if (nundef(dParent)) dParent = UI.d; if (nundef(dParent)) return;	
	dParent = toElem(dParent); mClear(dParent); //mStyle(dParent,{scroll:'auto'});
	let records = dbToList(q); //console.log(q)
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	let tablename = dbGetTableName(q); //console.log(tablename);
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header=headers[0];
	records = sortDir == 'asc'?sortByEmptyLast(records, header):sortByDescending(records,header);

	let dTitle=mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding:6 });

	let dTable = mDom(dParent);
	let t = UI.dataTable = mTableInfinite(records, dTable, null, headers, 'records');
	
	if (nundef(t)) { console.log('UI.dataTable is NULL'); return; }
	// onscroll = ()=>{
	// 	console.log('HALLO!!!!!')
	// 	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
	// 		mTableAddRows(t,100);
	// 	}
	// } 
	

	let d = t.div;
	mTableAddRows(t,100);	

	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		
		ui.onclick = (ev) => { 
			evNoBubble(ev); 
			let currentDir=DA.tinfo.sortDir;
			
			let text = firstWord(ui.innerHTML);console.log(text)
			let currentHeader = DA.tinfo.header;
			let sortDir = currentHeader == text? currentDir == 'asc'?'desc':'asc':'asc';
			showRecords(q, dParent, headers, text, sortDir); 
		}
	}
	addSumAmount(headeruis.find(x=>x.innerHTML == 'amount'),records);
	if (tablename != 'transactions') return;
	let cells = DA.cells = [];
	for (const ri of t.rowItems) {
		let r = iDiv(ri);
		//console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		let tds = arrChildren(r);
		for (const ui of tds) {
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowItems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => {toggleItemSelection(item);checkButtons();} //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo={sortDir,records,headers,header,div:dParent,q,tablename};
	checkButtons();
	resizeMain('dNav',dParent,dTitle,dTable);
	onresize = ()=>resizeMain('dNav',dParent,dTitle,dTable);
	// let h=calcHeightLeftUnder(dTitle)-14;console.log(h)
	// mStyle(dTable,{h})
}
//#endregion

//#_endregion

//#region mSwitch
function mSwitch(offstate,onstate){
	let d=mDom(null,{className:'swcontainer'})
	let sp=mDom(d,{className:'swoff-text'},{tag:'span',html:offstate});
	let l=mDom(d,{className:'swswitch'},{tag:'label'});
	let inp=mDom(l,{className:'swswitch'},{tag:'input',type:'checkbox',id:'exampleSwitch'});
	let sp1=mDom(l,{className:'swslider round'},{tag:'span'});
	let spon=mDom(d,{className:'swon-text'},{tag:'span',html:onstate});
	return d;
	let html = `
			<div class="swcontainer">
			<span class="swoff-text">${offstate}</span>
			<label class="swswitch">
				<input type="checkbox" id="exampleSwitch">
				<span class="swslider round"></span>
			</label>
			<span class="swon-text">${onstate}</span>
			</div>
		`;
	return mCreateFrom(html);
}

//#endregion




