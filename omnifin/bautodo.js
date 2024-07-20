



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

//#region ui mNavMenu, checkButtons, handleSticky
function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }
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

//#endregion

//#region history
async function onclickBackHistory() {
	console.log(M.qHistory)
	let o = M.qHistory.pop();
	if (isdef(o)) {
		let records = dbToList(o.q, false);
		showChunkedSortedBy(UI.d, o.tablename, o.tablename, records);
	}
}
function dbHistory(q, addToHistory) {
	if (addToHistory) {
		let q1 = q.toLowerCase().trim();
		if (q1.startsWith('select')) {
			if (isdef(DA.qCurrent)) M.qHistory.push({ q: DA.qCurrent, tablename: wordAfter(q1, 'from') });
			DA.qCurrent = q1;
		}
	}
}
//#endregion

//#region main menu weiter test
async function menuOpenTest() { }
async function menuCloseTest() { closeLeftSidebar(); mClear('dMain') }
//#endregion

//#region onclickAddTag
async function onclickAddTag(idtrans, index) {

	let item = UI.dataTable.rowitems[index];
	//console.log('item',item);

	let colitem = item.colitems.find(x => x.key == 'tag_names');
	//console.log(colitem);
	if (nundef(colitem)) { console.log('cannot execute because tag_names column missing!'); return; }

	let currentTagNames = colitem.val.split(',');
	console.log('current tagnames', currentTagNames);

	let allTagNames = Object.keys(M.tagsByName).filter(x => !isNumber(x)); //console.log(allTagNames.filter(x=>x.startsWith('palma')));
	let content = allTagNames.map(x => ({ key: x, value: currentTagNames.some(y => y == x) }));
	let list = await mGather(null, { h: 800, hmax: 800 }, { content, type: 'checkListInput', charsAllowedInWord: ['-_'] });
	console.log(list);
	if (!list) { console.log('add tag CANCELLED!!!'); return; }
	//look if there is any tag that has not been there before
	let newTagNames = arrWithout(list, currentTagNames);
	console.log('new tags', newTagNames);

	return;
	for (const t of newTagNames) {
		//need to create a report and add it to reports,
		//need to add a record in transaction_tags with corresponding trans_id,tag_id,report_id
		dbAddTagAndReport(idtrans, t);
		break;
	}
}
function _addTagAndReport(transactionId, tagName, reportCategory = 'default') {
	// Insert a new report with default values
	let db = DB;
	db.run(`
		INSERT INTO reports (category, associated_account, description)
		VALUES (?, NULL, '')
	`, [reportCategory]);

	// Get the last inserted report ID
	const reportId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];

	console.log(reportId);

	// Insert the tag
	db.run(`
		INSERT INTO tags (tag_name, category, description, report)
		VALUES (?, '', '', ?)
	`, [tagName, reportId]);

	// Get the last inserted tag ID
	const tagId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];

	// Associate the tag with the transaction
	db.run(`
		INSERT INTO transaction_tags (id, tag_id, report)
		VALUES (?, ?, ?)
	`, [transactionId, tagId, reportId]);

	dbSaveToLocalStorage();

	alert("Tag and report added successfully.");
}
//#endregion

//#region NEEDS TO BE FIXED!!!!
function uiTypeCheckListInput(any, dParent, styles = {}, opts = {}) {
	addKeys({ charsAllowedInWord: [' '] }, opts);
	let dg = mDom(dParent);
	let list = toNameValueList(any); list.map(x => { if (x.value != true) x.value = false; });
	let items = [];
	for (const o of list) {
		//console.log(o.value)
		let div = mCheckbox(dg, o.name, o.value);
		items.push({ nam: o.name, div, w: mGetStyle(div, 'w'), h: mGetStyle(div, 'h') });
	}
	let wmax = arrMax(items, 'w');
	let cols = 4;
	let wgrid = wmax * cols + 100;
	dg.remove();
	dg = mDom(dParent);
	let inp = mDom(dg, { w100: true, box: true, mabottom: 10 }, { className: 'input', tag: 'input', type: 'text' });
	let db = mDom(dg, { w100: true, box: true, align: 'right', mabottom: 4 });
	mButton('cancel', () => opts.handler(null), db, {}, 'input');
	mButton('clear', ev => { onclickClear(inp, grid) }, db, { maleft: 10 }, 'input');
	mButton('done', () => opts.handler(extractWords(inp.value, opts.charsAllowedInWord)), db, { maleft: 10 }, 'input');
	mStyle(dg, { w: wgrid, box: true, padding: 10 }); //, w: wgrid })
	//let hmax = isdef(styles.hmax) ? styles.hmax - 150 : 300;
	//console.log('...hmax',styles.hmax)
	//addKeys({hmax:450},styles);
	let hmax = valf(styles.hmax, 450); //isdef(styles.hmax) ? styles.hmax - 150 : 300;
	let grid = mGrid(null, cols, dg, { w100: true, gap: 10, matop: 4, hmax: hmax - 150 }); //, bg:'red' });
	items.map(x => mAppend(grid, iDiv(x)));
	sortCheckboxes(grid);
	let chks = Array.from(dg.querySelectorAll('input[type="checkbox"]'));
	for (const chk of chks) {
		chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
	}
	inp.value = list.filter(x => x.value).map(x => x.name).join(', ');
	inp.addEventListener('keypress', ev => inpToChecklist(ev, grid, opts.charsAllowedInWord));
	return { dg, inp, grid };
}
function getSeparators(allowed) {
	let specialChars = toLetters(' ,-.!?;:');
	if (isdef(allowed)) specialChars = arrMinus(specialChars, toLetters(allowed));
	return specialChars;
}
function inpToChecklist(ev, grid, charsAllowedInWord) {
	let key = ev.key;
	let inp = ev.target;
	if (key == 'Backspace') {
		let s = inp.value;
		let cursorPos = inp.selectionStart;
		let ch = cursorPos == 0 ? null : inp.value[cursorPos - 1];
		if (!ch || isWhiteSpace(ch)) {
			doYourThing(inp, grid, charsAllowedInWord);
		}
		console.log('Backspace', ch);
		return;
	}
	if (key == 'Enter') ev.preventDefault();
	if (isExpressionSeparator(key, charsAllowedInWord) || key == 'Enter') doYourThing(inp, grid, charsAllowedInWord);
}
function isExpressionSeparator(ch, charsAllowed) {
	let seps = getSeparators(charsAllowed);
	return seps.includes(ch);
}
function doYourThing(inp, grid, charsAllowed = ' ') {
	let words = extractWords(inp.value, charsAllowed).map(x => x.toLowerCase());
	let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
	let allNames = checklist.map(x => x.name);
	let names = checklist.filter(x => x.checked).map(x => x.name);
	for (const w of words) {
		if (!allNames.includes(w)) {
			let div = mCheckbox(grid, w);
			let chk = div.firstChild;
			chk.checked = true;
			chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
			needToSortChildren = true;
		} else {
			let chk = checklist.find(x => x.name == w);
			if (!chk.checked) chk.checked = true;
		}
	}
	for (const name of names) {
		if (!words.includes(name)) {
			let chk = checklist.find(x => x.name == name);
			chk.checked = false;
		}
	}
	sortCheckboxes(grid);
	words.sort();
	inp.value = words.join(', ') + ', ';
}
//#endregion

//#region build a query (empty)
function buildTransactionQuery() {
	let q = `
	
		`;
}
//#endregion

//#region menu sql
async function menuOpenSql() {
	let d = mDom('dMain');
	let ta = UI.ta = mDom(d, { 'white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { rows: 25, tag: 'textarea', id: 'taSql', value: 'select * from reports' });
	ta.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onclickExecute();
		}
	});
	let db = mDom(d, { gap: 10 }); mFlex(db);
	mButton('Execute', onclickExecute, db, {}, 'button');
	mButton('Clear', () => UI.ta.value = '', db, {}, 'button');
	mButton('Example', () => UI.ta.value = dbGetSampleQuery(), db, {}, 'button');
	UI.d = mDom('dMain', { className: 'section' });

	onclickExecute();
}
async function menuCloseSql() { mClear('dMain'); M.qHistory = []; }
async function onclickExecute() {
	let q = UI.ta.value;
	let tablename = dbGetTableName(q);
	let records = dbToList(q);
	showTableSortedBy(UI.d, 'Result', tablename, records);
}
//#endregion

//#region helpers
function consloghist() {
	for (const s of M.qHistory) {
		let q = s.q;
		let q1 = replaceAllSpecialCharsFromList(q, ['\t', '\n'], ' ');
		console.log(q)
		console.log(q1)
	}
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
function arrIsLast(arr, el) { return arrLast(arr) == el; }

async function onclickTagForAll(ev, list) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	let allTags = dbToList(`select * from tags`, 'tag_name').filter(x => !isNumber(x.tag_name));
	let allTagNames = allTags.map(x => x.tag_name)
	let content = allTagNames.map(x => ({ key: x, value: false }));
	if (nundef(list)) list = await mGather(null, { h: 800, hmax: 800 }, { content, type: 'checkListInput', charsAllowedInWord: ['-_'] });
	//console.log('result',list)
	if (!list || isEmpty(list)) { console.log('add tag CANCELLED!!!'); return; }


	for (const tname of list) {
		let otag = allTags.find(x => x.tag_name == tname);
		for (const rec of records) {
			let recs1 = dbToList(`select * from transaction_tags where id='${rec.id}' and tag_id='${otag.id}';`,false); // where tag_id = '${otag.id}' and id = '${rec.id}'`);
			//console.log(recs1);
			if (isEmpty(recs1)) {
				//console.log('adding tag',tname)
				dbAddTagAndReport(rec.id, tname, reportCategory = 'default');
			}
			// addTagAndReport(rec.id, tagName, reportCategory='default') 
		}
	}

	onclickCommand(null, UI.lastCommandKey);
	//rerunCurrentCommand();

}
async function onclickDownloadDb() { dbDownload(); }

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
function uiGadgetTypeTextarea(dParent, dict, resolve, styles = {}, opts = {}) {
	//let wIdeal = 500;
	let formStyles = { maleft: 10, box: true, padding: 10, bg: 'white', fg: 'black', rounding: 10 };
	let form = mDom(dParent, formStyles, {})
	addKeys({ className: 'input', tag: 'textarea', id: 'taFilter', rows: 25 }, opts);
	//let df = mDom(form);

	addKeys({ fz: 14, family: 'tahoma', w: 500, padding: 10, resize: 'none' }, styles);
	let taStyles = styles;
	mDom(form, { mabottom: 4 }, { html: 'Filter expression:' });
	let ta = mDom(form, taStyles, opts);
	let db = mDom(form, { vmargin: 10, align: 'right' });

	// let ta = mDom(df, {}, { tag: 'textarea', rows: 20, cols: 80, id: 'taFilter', value:dict.exp, padding:10 });
	// let ta = UI.ta = mDom(df, { bg:'violet','white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { rows: 25, tag: 'textarea', id: 'taFilter', value: dict.exp });
	// ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); resolve(mBy('taFilter').value); } });

	mButton('Cancel', ev => resolve(null), db, { classes: 'button', maright: 10 });
	mButton(dict.caption, ev => { resolve(mBy('taFilter').value); }, db, { classes: 'button' });

	return form;
}




