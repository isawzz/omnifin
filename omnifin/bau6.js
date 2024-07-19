
function showNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	let dTop = mDom(dNav, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
	let centerflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let startflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let [l, m, r] = [mDom(dTop, startflex), mDom(dTop, centerflex), mDom(dTop, centerflex)];
	let dlogo = mDom(l, { fz: 34 }, { html: `Omnifin` });
	let commands = {};
	commands.overview = menuCommand(l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	//commands.sql = menuCommand(l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);

	let db = mDom(dNav, { matop: 12, maleft: 128, gap: 10, className: 'centerflexV' }, { id: 'dButtons' });
	// mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('clear sorting', () => { DA.info.sorting = { id: 'desc' }; sortRecordsBy('id') }, db, {}, 'button', 'bSortFast');

	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	//nav.commands = commands;
	return { commands, dNav }
}
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar('dLeft', 110);
	UI.d = mDom('dMain'); //, { className: 'section' });
	let gap = 5;

	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure', {}); mNewline(side.d, gap); mLinebreak(side.d, 10);
	UI.commands.translist = mCommand(side.d, 'translist', 'translist', {}, { open: () => showRecords(qTTList(), UI.d, true) }); mNewline(side.d, gap);
	UI.commands.transcols = mCommand(side.d, 'transcols', 'transcols', {}, { open: () => showRecords(qTTCols(), UI.d, true) }); mNewline(side.d, gap);
	mLinebreak(side.d, 10);
	UI.commands.reports = mCommand(side.d, 'reports', 'reports', {}, { open: () => showRecords('SELECT * from reports', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.assets = mCommand(side.d, 'assets', 'assets', {}, { open: () => showRecords('SELECT * from assets', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.tags = mCommand(side.d, 'tags', 'tags', {}, { open: () => showRecords('SELECT * from tags', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.accounts = mCommand(side.d, 'accounts', 'accounts', {}, { open: () => showRecords('SELECT * from accounts', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.statements = mCommand(side.d, 'statements', 'statements', {}, { open: () => showRecords('SELECT * from statements', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.verifications = mCommand(side.d, 'verifications', 'verifications', {}, { open: () => showRecords('SELECT * from verifications', UI.d, true) }); mNewline(side.d, gap);
	UI.commands.tRevisions = mCommand(side.d, 'tRevisions', 'revisions', {}, { open: () => showRecords('SELECT * from revisions', UI.d, true) }); mNewline(side.d, gap);

	//await onclickCommand(null, 'translist');
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


//#region filter records
async function onclickFilter(ev) { await filterRecords(); }
async function onclickFilterFast(ev) { await filterRecords(null, false); }
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
		let cl = rcells.map(cell => generateSQLEqualsWHERE(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x => !isEmpty(x))
	let res = isEmpty(ands) ? null : ' WHERE ' + ands.join(' OR ');
	return res;
}
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





