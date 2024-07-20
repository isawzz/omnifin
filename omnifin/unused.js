

function calcIndexFromTo(inc, o) {
	let ito, ifrom = o.ifrom, records = o.records;
	if (inc == 0) ito = Math.min(ifrom + o.size, records.length);
	if (inc == 1) {
		ifrom = Math.min(ifrom + o.size, records.length);
		if (ifrom >= records.length) ifrom = 0;
		ito = Math.min(ifrom + o.size, records.length);
	}
	if (inc == -1) {
		ifrom = ifrom - o.size;
		if (ifrom < 0) ifrom = Math.max(0, records.length - o.size);
		ito = Math.min(ifrom + o.size, records.length);
	}
	return [ifrom, ito];
}
function _getHeaderHtml(header, sorting) {
	let arrowHtml = '';

	if (sorting === 'asc') {
		arrowHtml = ' &uarr;'; // Up arrow
	} else if (sorting === 'desc') {
		arrowHtml = ' &darr;'; // Down arrow
	}

	return `${header}${arrowHtml}`;
}
function insertWhereClause(sql, whereClause) {

	// // Example usage:
	// const sql = `
	//   SELECT id, name, age
	//   FROM employees
	//   LEFT JOIN departments ON employees.department_id = departments.id
	//   WHERE salary > 50000
	//   GROUP BY department_id
	//   HAVING COUNT(*) > 5
	//   ORDER BY age DESC
	//   LIMIT 10 OFFSET 5;
	// `;

	// const whereClause = `age > 30`;

	// console.log(insertWhereClause(sql, whereClause));

	// Trim any existing semicolons and whitespace from the input
	sql = sql.trim().replace(/;$/, '');
	whereClause = whereClause.trim().replace(/^WHERE\s+/i, '');

	// Define regex patterns to locate positions in the SQL statement
	const selectPattern = /SELECT\s+.*?\s+FROM\s+/i;
	const fromPattern = /\bFROM\b/i;
	const wherePattern = /\bWHERE\b/i;
	const groupByPattern = /\bGROUP BY\b/i;
	const orderByPattern = /\bORDER BY\b/i;
	const havingPattern = /\bHAVING\b/i;
	const limitPattern = /\bLIMIT\b/i;
	const offsetPattern = /\bOFFSET\b/i;
	const joinPattern = /\b(JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN)\b/i;

	// Check if the SQL already contains a WHERE clause
	if (wherePattern.test(sql)) {
		// If there is an existing WHERE clause, append the new one with AND
		sql = sql.replace(wherePattern, match => `${match} (${whereClause}) AND `);
	} else {
		// Find the position to insert the WHERE clause
		let position = sql.search(groupByPattern);
		const insertPositionPatterns = [fromPattern, groupByPattern, orderByPattern, havingPattern, limitPattern, offsetPattern, joinPattern];
		insertPositionPatterns.forEach(pattern => {
			const pos = sql.search(pattern);
			if (pos !== -1 && (position === -1 || pos < position)) {
				position = pos;
			}
		});

		if (position === -1) {
			position = sql.length;
		}

		// Insert the WHERE clause at the correct position
		sql = `${sql.slice(0, position)} WHERE ${whereClause} ${sql.slice(position)}`;
	}

	// Remove consecutive spaces
	sql = sql.replace(/\s+/g, ' ').trim();

	return sql;
}
async function onclickFilter1(ev, ofilter) {

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header]

	let content = { headers }; //.map(x => ({ name: x, value: false }));

	//let result = {val:'sender_name',op:'==',val2:'dkb-4394'}; //
	let result = ofilter;
	if (nundef(result)) result = await mGather(mBy('bFilter'), {}, { content, type: 'filter' });

	// result = ['unit','!=','USD'];
	// result = ['amount','<','1000'];
	// result = ['receiver_name','==','merchant'];

	if (!result || isEmpty(result)) { console.log('operation cancelled!'); return; }
	console.log(result)
	let recs = records.filter(x => {
		let [val1,op,val2] = [x[result[0]],result[1],result[2]];
		if (headers.includes(val2)) val2 = x[val2];
		if (isNumber(val1)) val1 = Number(val1);
		if (isNumber(val2)) val2 = Number(val2);
		let [e1, e2] = [!val1 || isEmpty(val1), !val2 || isEmpty(val2)];
		//console.log(val1,op,val2);
		switch (op) {
			case '==': return val1 == val2; break;
			case '!=': return val1 != val2; break;
			case '<': return val1 < val2; break;
			case '>': return val1 > val2; break;
			case '<=': return val1 <= val2; break;
			case '>=': return val1 >= val2; break;
			case '&&': return val1 && val2; break;
			case '||': return val1 || val2; break;
			case 'nor': return e1 && e2; break;
			case 'xor': return e1 & !e2 || e2 && !e1; break;
			case 'contains': return isString(val1) && val1.includes(val2); break;
			default: return val1 == 'X'||val1 == true; break; //for tag columns or true false columns
		}
	});

	DA.tinfo.records = recs;
	//console.log('recs',recs);
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, [])
}
function showChunkedSortedBy(dParent, title, tablename, records, headers, header) {
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header = headers[0];

	if (isList(header)) DA.sortedBy = null; //ist multi-sorted!
	else if (DA.sortedBy == header) { records = sortByEmptyLast(records, header); DA.sortedBy = null; }
	else { records = sortByDescending(records, header); DA.sortedBy = header; }

	mClear(dParent);
	let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mText(`${tablename} (${records.length})`, db, { weight: 'bold', fz: 20, maleft: 12 });
	// mButton('fifast', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	// mButton('filter', onclickFilter, db, {}, 'button', 'bFilter');
	// mButton('back', onclickBackHistory, db, {}, 'button', 'bBack');
	// mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	// mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	// mButton('multi-sort', onclickMultiSort, db, {}, 'button', 'bMultiSort');
	// // mButton('filter1', onclickFilter1, db, {}, 'button','bFilter1');
	// // mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');
	// mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');
	let dTable = mDom(dParent)
	DA.tinfo = {};
	// if (nundef(masterRecords)) masterRecords = records;
	addKeys({ q: DA.qCurrent, dParent, title, tablename, dTable, records, headers, header, ifrom: 0, size: 100 }, DA.tinfo);
	showChunk(0);
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
function _sqlReplaceStar(q){

	//console.log(':::::::::::',q);
	let qTemp = q.toLowerCase().trim();
	if (qTemp.startsWith('select * from')){

		//if (qTemp.endsWith(';')) qTemp = stringBeforeLast(qTemp,';');
		//qTemp += ` LIMIT 1;`;
		console.log(qTemp)
		let records = dbToList(qTemp); //'select * from tags');
		if (isEmpty(records)) return [q,[]];

		let headers = Object.keys(records[0]);
		let qnew = `SELECT ${headers.join(', ')}\n${stringAfter(q,' * ')}`;
		return [qnew, records];


	}
	return [q,null];
}
function sqlUpdateOrderBy(q, sorting) {
	let clauses = splitSQLClauses(q); // console.log('clauses',clauses)
	let qnew = '';
	for (const k in clauses) {
		if (k.startsWith('ORDER BY')) continue;
		for (const a of clauses[k]) qnew += `${a.trim()}\n`;
	}
	if (!isEmpty(sorting)) { qnew += `ORDER BY ${Object.keys(sorting).map(x => x + ' ' + sorting[x].toUpperCase()).join(', ')}`; }
	qnew += ';'
	return qnew;
}
function uiGadgetTypeFilter(dParent, dict, resolve, styles = {}, opts = {}) {

	addKeys({ hmax: 500, wmax: 400, bg: 'white', fg: 'black', padding: 16, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let selectStyles = { hmax, w:220, box: true };

	let d=mDom(dOuter);mFlexWrap(d)
	//checklist fuer headers
	let headers = dict.headers;
	let d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'LHS: '})
	let dSelectHeader = uiTypeSelect(headers, d1, selectStyles, opts);

	let linegap=10;
	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'op: '})
	let ops = ['contains', '==', '!=', '<=', '>=', '<', '>', '&&', '||', 'nor', 'xor'];
	let dSelectOp = uiTypeSelect(ops, d1, selectStyles, opts);

	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'RHS: '})
	let inp = mDom(d1, selectStyles, { autocomplete: 'off', className: 'input', name: 'val', tag: 'input', type: 'text', placeholder: `<enter value>` });
	
	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'or: '});
	let dSelectHeader2 = uiTypeSelect(headers, d1, selectStyles, opts);

	function collectAndResolve(){
		let val=dSelectHeader.value;
		let op = dSelectOp.value;
		let val2 = !isEmpty(inp.value)?inp.value:dSelectHeader2.value;

		resolve([val,op,val2]);
	}

	mLinebreak(d,linegap);
	d1=mDom(d,{w100:true});mCenterCenterFlex(d1);
	mButton('done', collectAndResolve, d1, {w:90}, 'input', 'bFilter');
	return dOuter;

}
