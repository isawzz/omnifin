//#region db
function dbGetTableName(q) { return wordAfter(q.toLowerCase(), 'from'); }

function dbGetTableNames() { return dbToList(qTablenames()); }

async function dbInit(path) {
	try {
		const response = await fetch(path);
		const buffer = await response.arrayBuffer();
		// const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const SQL = DA.SQL = await initSqlJs({ locateFile: filename => `../omnifin/libs/${filename}` });
		let db=null;
		if (nundef(path)) db = dbLoadFromLocalStorage();
		if (!db) db = new SQL.Database(new Uint8Array(buffer));
		return db;
	} catch (error) {
		console.error('Error:', error);
		document.getElementById('output').textContent = 'Error: ' + error.message;
		return null;
	}
}
function dbLoadFromLocalStorage() {
	// Load existing database or create a new one
	if (localStorage.getItem('database')) {
		const storedData = JSON.parse(localStorage.getItem('database'));
		const Uints = new Uint8Array(storedData);
		db = new DA.SQL.Database(Uints);
		return db;
	} else {
		console.log('database not found in localStorage!');
		return null;
	}

}
function dbRaw(q) { return DB.exec(q); }

function dbSaveToLocalStorage(){
	// Save the database
	const data = DB.export();
	localStorage.setItem('database', JSON.stringify(Array.from(data)));
}
function dbToDict(q, keyprop = 'id') { return list2dict(dbToList(q), keyprop); }

function dbToList(q) {
	//runs query, returns dict of records by id
	//assumes that query selects keyprop
	let res = dbToObject(q); //console.log(res)
	let headers = res.columns;
	let records = [];
	for (const row of res.values) {
		let o = {};
		for (let i = 0; i < headers.length; i++) {
			o[headers[i]] = row[i];
		}
		records.push(o);
	}
	return records;
}
function dbToObject(q) {
	let res = dbRaw(q);
	//console.log('tablename',dbGetTableName(q))
	return isList(res) && res.length == 1 && isdef(res[0].columns) ? res[0] : isEmpty(res) ? { columns: [], values: [] } : res;
}
//#endregion

//#region menu overview
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar();
	let gap = 5;
	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);
	mLinebreak(side.d, 10);
	// UI.commands.testtrans = mCommand(side.d, 'testtrans', 'test'); mNewline(side.d, gap);
	UI.commands.translist = mCommand(side.d, 'translist', 'translist'); mNewline(side.d, gap);
	UI.commands.transcols = mCommand(side.d, 'transcols', 'transcols'); mNewline(side.d, gap);
	// UI.commands.transactions = mCommand(side.d, 'transactions', 'transactions'); mNewline(side.d, gap);
	// UI.commands.flex = mCommand(side.d, 'flex', 'flex-perks'); mNewline(side.d, gap);
	// UI.commands.tagged = mCommand(side.d, 'tagged', 'tagged'); mNewline(side.d, gap);
	// UI.commands.multiTagged = mCommand(side.d, 'multiTagged', 'multi-tagged'); mNewline(side.d, gap);
	// UI.commands.limit20 = mCommand(side.d, 'limit20', 'just 20'); mNewline(side.d, gap);
	mLinebreak(side.d, 10);
	UI.commands.reports = mCommand(side.d, 'reports', 'reports'); mNewline(side.d, gap);
	UI.commands.assets = mCommand(side.d, 'assets', 'assets'); mNewline(side.d, gap);
	UI.commands.tags = mCommand(side.d, 'tags', 'tags'); mNewline(side.d, gap);
	UI.commands.accounts = mCommand(side.d, 'accounts', 'accounts'); mNewline(side.d, gap);
	UI.commands.statements = mCommand(side.d, 'statements', 'statements'); mNewline(side.d, gap);
	UI.commands.verifications = mCommand(side.d, 'verifications', 'verifications'); mNewline(side.d, gap);
	UI.commands.tRevisions = mCommand(side.d, 'tRevisions', 'transaction revisions'); mNewline(side.d, gap);

	UI.d = mDom('dMain', { className: 'section' });
	onclickTranslist();
}
async function menuCloseOverview() { closeLeftSidebar(); mClear('dMain') }

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
async function menuCloseSql() { mClear('dMain') }
async function onclickExecute() {
	let q = UI.ta.value;
	let tablename = dbGetTableName(q);
	let records = dbToList(q);
	showTableSortedBy(UI.d, 'Result', tablename, records);
}
//#endregion

//#region show functions
function showChunkedSortedBy(dParent, title, tablename, records, headers, header) {

  if (isEmpty(records)) { mText('no data', dParent); return null; }
  if (nundef(headers)) headers = Object.keys(records[0]);
  if (nundef(header)) header = headers[0];
  //console.log('___ show', Counter++, DA.tinfo);
  //console.log(DA.sortedBy, header);

  if (isList(header)) DA.sortedBy = null; //ist multi-sorted!
  else if (DA.sortedBy == header) { records = sortByEmptyLast(records, header); DA.sortedBy = null; }
  else { records = sortByDescending(records, header); DA.sortedBy = header; }
  mClear(dParent);
  mText(`<h2>${title} (${tablename})</h2>`, dParent, { maleft: 12 });
	let db = mDom(dParent, { gap: 10 }); mFlex(db);
  mButton('next', () => showChunk(1), db, {}, 'button');
  mButton('prev', () => showChunk(-1), db, {}, 'button');
  mButton('multi-sort', onclickMultiSort, db, {}, 'button');
  mButton('filter', onclickFilter, db, {}, 'button');
  mButton('add tag', onclickTagForAll, db, {}, 'button');
  mButton('download db', onclickDownloadDb, db, {}, 'button');
  let dTable = mDom(dParent)
  DA.tinfo = {};
  // if (nundef(masterRecords)) masterRecords = records;
  addKeys({ dParent, title, tablename, dTable, records, headers, header, ifrom: 0, size: 100 }, DA.tinfo);
  showChunk(0);
}
function showChunk(inc) {
  let o = DA.tinfo;
  let [dParent, title, tablename, dTable, records, headers, header, ifrom] = [o.dParent, o.title, o.tablename, o.dTable, o.records, o.headers, o.header, o.ifrom];

  let ito;
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
  if (tablename != 'transactions') return;
  for (const ri of t.rowitems) {
    let r = iDiv(ri);
    let id = ri.o.id;
    let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
  }
  DA.tinfo.ifrom = ifrom;
}
function showTableSortedBy(dParent, title, tablename, records, headers, header) {
	if (isEmpty(records)) {mText('no data',dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
  if (nundef(header)) header = headers[0];
  console.log('___ show Full Table',Counter++,DA.tinfo);
  console.log(DA.sortedBy,header);

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

//#region onclick
async function onclickFilter(ev,ofilter){

	let [records, headers, header]=[DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = {headers}; //.map(x => ({ name: x, value: false }));
	
	let result = {val:'sender_name',op:'==',val2:'dkb-4394'}; //
	//let result = ofilter;
	if (nundef(result)) result = await mGather(mBy('bFilter'), {}, { content, type: 'filter' });

	// result = {val:'unit',op:'!=',val2:'USD'}
	// result = {val:'amount',op:'<',val2:'1000'}
	// result = {val:'receiver_name',op:'==',val2:'merchant'}
	console.log(result)

	if (!result || isEmpty(result)) { console.log('operation cancelled!'); return; }
	let recs = records.filter(x=>{
		let op = result.op;
		let val1=x[result.val];
		let val2 = headers.includes(result.val2)?x[result.val2]:result.val2;
		if (isNumber(val1)) val1=Number(val1);
		if (isNumber(val2)) val2=Number(val2);
		let [e1,e2]=[!val1 || isEmpty(val1),!val2 || isEmpty(val2)];
		//console.log(val1,op,val2);
		switch(op){
			case '==': return val1 == val2; break;
			case '!=': return val1 != val2; break;
			case '<': return val1 < val2; break;
			case '>': return val1 > val2; break;
			case '<=': return val1 <= val2; break;
			case '>=': return val1 >= val2; break;
			case '&&': return val1 && val2; break;
			case '||': return val1 || val2; break;
			case 'nor': return e1 && e2; break;
			case 'xor': return e1&!e2 || e2&&!e1; break;
			case 'contains': return isString(val1) && val1.includes(val2); break;
			default: return false;
		}
	});

	DA.tinfo.records = recs;
	console.log('recs',recs);
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, [])
}
async function onclickMultiSort(ev){
	console.log('multisort',DA.tinfo);

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(ev.target, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}

