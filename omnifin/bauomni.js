
function measureRecord(rec) {
	let res = '';
	var di = { dateof: 100, id: 40, sender_name: 120, receiver_name: 130, amount: 80, unit: 40, MCC: 40, tag_names:'auto', description:'1fr' };
	for (const h in rec) {
		let val = rec[h]; //console.log(typeof val, val, h);
		let w=di[h];
		w=isNumber(w)?`${w}px`:w??'auto';
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

//#region sorting records ui
async function onclickAscDescButton(ev){
	let inp = ev.target;
	console.log(':::',inp)
}
async function onclickSort(ev) { await sortRecordsBy(); }
async function onclickSortFast(ev) { await sortRecords(null, false); }
function onToggleState(ev, states, colors) {
	let elem = ev.target;
	toggleState(elem,states,colors);
}
async function sortRecords(headerlist, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	if (nundef(headerlist)) {
		let cells = DA.cells;
		let selitems = cells.filter(x=>x.isSelected); console.log(selitems);
		headerlist = selitems.map(x=>x.header);
	}
	assertion(!isEmpty(headerlist),'sortRecords with empty headerlist!!!');

	console.log(headerlist);

	let result = await mGather(null, {}, { content:{func:uiTypeSortForm,data:headerlist}, type: 'freeForm' });
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

	let headerlist=data;

	let dlist = mDom(dParent);
	for(const h of headerlist){

		let d=mDom(dlist,{className:'centerFlexV',gap:4});
		let d1=mDom(d,{},{html:h});
		let b=mToggleButton('asc','desc',null,d)


	}


	let handler = () => resolve(null);
	// mButton('done', handler, d, { classes: 'input', margin: 10 });
}
//#endregion

//#region menu overview
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar('dLeft',110);
	let gap = 5;
	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);
	mLinebreak(side.d, 10);
	UI.d = mDom('dMain'); //, { className: 'section' });

	UI.commands.translist = mCommand(side.d, 'translist', 'translist',{open:()=>showRecords(qTTList(),UI.d)}); mNewline(side.d, gap);
	UI.commands.translistlegacy = mCommand(side.d, 'translistlegacy', 'legacy',{open:onclickTranslist}); //()=>showRecords(qTTList())}); mNewline(side.d, gap);
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
function addSumAmount(ui,records){
	if (nundef(ui)) return;
	//console.log(ui);

	let sum = arrSum(records,'amount');
	if (isNumber(sum)) sum=Math.round(sum);

	mDom(ui,{},{html:sum})

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
	addSumAmount(headeruis.find(x=>x.innerHTML == 'amount'),o.records);
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
			ui.onclick = () => {toggleItemSelection(item);checkButtons();} //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}
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
	let bs=arrChildren('dButtons'); bs.map(x=>disableButton(x));
	if (DB) enableButton('bDownload');
	let info = DA.tinfo; //are there records shown?
	if (nundef(info)) return;
	let [ifrom, ito, records] = [info.ifrom, info.ito, info.records];
	//console.log('checkButtons',ifrom,ito,records.length)
	if (ifrom > 0) enableButton('bPgUp');
	if (ito < records.length) enableButton('bPgDn');
	if (!isEmpty(M.qHistory)) enableButton('bBack');
	if (DA.cells.find(x=>x.isSelected)) ['bFilter','bFilterFast','bSort','bSortFast'].map(x=>enableButton(x));
}
function mNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	
	let dTop=mDom(dNav,{class:'centerFlexV'});
	mDom(dTop, { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let dm = mDom(dTop, { gap: 10, className: 'centerflexV' }); 
	let nav = mMenu(dm);
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;

	mLinebreak(dTop);
	let db = mDom(dTop, { gap: 10, className: 'centerflexV' },{id:'dButtons'}); 
	mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('filter', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	mButton('custom filter', onclickFilter, db, {}, 'button', 'bFilter'); 
	mButton('sort', onclickSortFast, db, {}, 'button', 'bSortFast');
	mButton('custom sort', onclickSort, db, {}, 'button', 'bSort');
	// mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');

	mDom(db,{w:20})
	mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');


	return nav;
}

//#endregion

//#region history
async function onclickBackHistory() {
	console.log(M.qHistory)
	let o = M.qHistory.pop();
	if (isdef(o)) {
		let records = dbToList(o.q,false);
		showChunkedSortedBy(UI.d, o.tablename, o.tablename, records);
	}
}
function dbHistory(q,addToHistory){
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
async function menuOpenTest(){}
async function menuCloseTest(){closeLeftSidebar();mClear('dMain')}
//#endregion

//#region onclickAddTag
async function onclickAddTag(idtrans, index) {

	let item = UI.dataTable.rowitems[index];
	//console.log('item',item);

	let colitem = item.colitems.find(x=>x.key == 'tag_names');
	//console.log(colitem);
	if (nundef(colitem)) {console.log('cannot execute because tag_names column missing!'); return;}

	let currentTagNames = colitem.val.split(',');
	console.log('current tagnames',currentTagNames);

	let allTagNames = Object.keys(M.tagsByName).filter(x=>!isNumber(x)); //console.log(allTagNames.filter(x=>x.startsWith('palma')));
	let content = allTagNames.map(x => ({ key: x, value:currentTagNames.some(y=>y == x) }));
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput', charsAllowedInWord:['-_'] });
	console.log(list);
	if (!list) {console.log('add tag CANCELLED!!!'); return; }
	//look if there is any tag that has not been there before
	let newTagNames=arrWithout(list,currentTagNames);
	console.log('new tags',newTagNames);

	return;
	for(const t of newTagNames){
		//need to create a report and add it to reports,
		//need to add a record in transaction_tags with corresponding trans_id,tag_id,report_id
		dbAddTagAndReport(idtrans,t);
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
function buildTransactionQuery(){
	let q=`
	
		`;
}
//#endregion








