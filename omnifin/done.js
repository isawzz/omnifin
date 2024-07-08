//#region db
function dbAddTagAndReport(transactionId, tagName, reportCategory='default') {
  // Insert a new report with default values
	let db=DB;
  db.run(`
    INSERT INTO reports (category, associated_account, description)
    VALUES (?, NULL, '')
  `, [reportCategory]);

  // Get the last inserted report ID
  const reportId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];

  // Check if the tag already exists
  const tagResult = db.exec(`
    SELECT id FROM tags WHERE tag_name = ?
  `, [tagName]);

  let tagId;

  if (tagResult.length > 0) {
    // Tag already exists, get the tag ID
    tagId = tagResult[0].values[0][0];
  } else {
    // Insert the tag
    db.run(`
      INSERT INTO tags (tag_name, category, description, report)
      VALUES (?, '', '', ?)
    `, [tagName, reportId]);

    // Get the last inserted tag ID
    tagId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];
  }

  // Associate the tag with the transaction
  db.run(`
    INSERT INTO transaction_tags (id, tag_id, report)
    VALUES (?, ?, ?)
  `, [transactionId, tagId, reportId]);

  // Save the database
  const data = db.export();
  localStorage.setItem('database', JSON.stringify(Array.from(data)));

  //alert("Tag and report added successfully.");
}
function dbDownload() {
	let db = DB;
	const data = db.export();
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = '_download_test.db';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
function dbGetTableName(q) { return wordAfter(q.toLowerCase(), 'from'); }

function dbGetTableNames() { return dbToList(qTablenames()); }

async function dbInit(path) {
	try {
		const response = await fetch(path);
		const buffer = await response.arrayBuffer();
		// const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const SQL = DA.SQL = await initSqlJs({ locateFile: filename => `../omnifin/libs/${filename}` });
		let db = null;
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

function dbSaveToLocalStorage() {
	// Save the database
	const data = DB.export();
	localStorage.setItem('database', JSON.stringify(Array.from(data)));
}
function dbToDict(q, keyprop = 'id') { return list2dict(dbToList(q), keyprop); }

function dbToList(q,addToHistory=true) {
	//runs query, returns dict of records by id
	//assumes that query selects keyprop
	//console.log('____dbToList',q,addToHistory)
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
	if (addToHistory){
		let q1=q.toLowerCase().trim(); 
		if (q1.startsWith('select')) {
			if (isdef(DA.qCurrent))	M.qHistory.push({q:DA.qCurrent,tablename:wordAfter(q1,'from')}); 	
			DA.qCurrent = q1;
		}

		//consloghist();
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
	await onclickCommand(null, 'translist');
}
async function menuCloseOverview() { closeLeftSidebar(); mClear('dMain'); M.qHistory=[]; }

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
async function menuCloseSql() { mClear('dMain'); M.qHistory=[]; }
async function onclickExecute() {
	let q = UI.ta.value;
	let tablename = dbGetTableName(q);
	let records = dbToList(q);
	showTableSortedBy(UI.d, 'Result', tablename, records);
}
//#endregion

//#region helpers
function calcIndexFromTo(inc,o){
	let ito, ifrom=o.ifrom,records = o.records;
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
  return [ifrom,ito];
}
function checkButtons(){
  let info = DA.tinfo;
  let [ifrom,ito,records]=[info.ifrom,info.ito,info.records];
  if (ifrom == 0) disableButton('bPgUp'); else enableButton('bPgUp'); 
  if (ito == records.length) disableButton('bPgDn'); else enableButton('bPgDn'); 
  if (isEmpty(M.qHistory)) disableButton('bBack'); else enableButton('bBack'); 

  
}
function consloghist(){
	for(const s of M.qHistory){
		let q=s.q;
		let q1=replaceAllSpecialCharsFromList(q,['\t','\n'],' ');
		console.log(q)
		console.log(q1)
	}
}
function extractFilterExpression(){
	let cells = DA.cells;
	let selitems = cells.filter(x=>x.isSelected); //console.log(selitems);

	let q=DA.tinfo.q;
	let clauses = splitSQLClauses(q); //console.log(clauses); 
	let sc = clauses.SELECT[0]; 
	assertion(isdef(sc),`NO SELECT CLAUSE!!! ${q}`);
	assertion(clauses.SELECT.length == 1,`WRONG NUMBER OF SELECT CLAUSES!!! ${q}`);

	let headers = extractHeadersFromSelect(sc).map(x=>x.toLowerCase()); //console.log(headers)

	for(const item of selitems){
		let h = item.header.toLowerCase(); //console.log(h)
		let match=headers.find(x=>x == h);
		if (isdef(match)) {item.h=item.header;item.header=match;}//console.log('found',match);continue;}
		match = headers.find(x=>x.endsWith(h));
		if (isdef(match)) {item.h=item.header;item.header=match;}//console.log('found',match);}
	}

	let where = generateSQLWhereClause(selitems); //console.log(where)
	clauses.WHERE = [where];

	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let sql='';
	for(const k of order){
		let list = lookup(clauses,[k]);
		if (!list) continue;
		sql+='\n'+list.join('\n');
	}
	return sql+';';

}
function extractHeadersFromSelect(sc){
	sc=stringAfter(sc,'SELECT');
	scs=sc.split(',').map(x=>x.trim()).map(x=>x.includes(' as ')?stringAfter(x,' as ').trim():x);
	//console.log(scs,sc)
	//scs.map(x=>console.log(x));
	return scs;
}
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
  for(const irow in rows){
    let rcells = rows[irow];
    let cl = rcells.map(cell=>`${cell.header} = '${cell.text}'`).join(' AND ');
    ands.push(cl);
  }
  let res = ' WHERE ' + ands.join(' OR ');
  return res;
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
      const insertPositionPatterns = [fromPattern,groupByPattern, orderByPattern, havingPattern, limitPattern, offsetPattern, joinPattern];
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
function arrIsLast(arr,el){return arrLast(arr)==el;}
async function onclickBackHistory(){
	console.log(M.qHistory)
	let o=M.qHistory.pop();
	// o=M.qHistory.pop();
	if (isdef(o)){
		let records = dbToList(o.q); 
		showChunkedSortedBy(UI.d, o.tablename, o.tablename, records);	
	}
}
async function onclickFilter2(ev, exp) {

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	if (nundef(exp)) {
		exp=extractFilterExpression();
		let content = { exp, caption: 'Filter' };
		exp = await mGather(null, {}, { content, type: 'textarea', value:exp });
	}


	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	
  //console.log('exp', exp);


  let i=DA.tinfo;
  records = dbToList(exp);
  showChunkedSortedBy(i.dParent,i.title,i.tablename,records,headers,header);

}
async function onclickTagForAll(ev,list){
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header];

	let allTags = dbToList(`select * from tags`,'tag_name').filter(x=>!isNumber(x.tag_name));
	let allTagNames = allTags.map(x=>x.tag_name)
	let content = allTagNames.map(x => ({ key: x, value:false }));
	if (nundef(list)) list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput', charsAllowedInWord:['-_'] });
	//console.log('result',list)
	if (!list || isEmpty(list)) {console.log('add tag CANCELLED!!!'); return; }


	for(const tname of list){
		let otag = allTags.find(x=>x.tag_name == tname);
		for(const rec of records){
			let recs1 = dbToList(`select * from transaction_tags where id='${rec.id}' and tag_id='${otag.id}';`); // where tag_id = '${otag.id}' and id = '${rec.id}'`);
			//console.log(recs1);
			if (isEmpty(recs1)){
				//console.log('adding tag',tname)
				dbAddTagAndReport(rec.id, tname, reportCategory='default');
			}
			// addTagAndReport(rec.id, tagName, reportCategory='default') 
		}
	}

	onclickCommand(null,UI.lastCommandKey);
	//rerunCurrentCommand();

}
async function onclickMultiSort(ev) {
	//console.log('multisort',DA.tinfo);

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(ev.target, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}
async function onclickDownloadDb() { dbDownload(); }

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
	let db = mDom(dParent, { gap: 10,mabottom:10,className:'centerflexV' }); //mCenterCenterFlex(db);
	// mText(`<h2>${title} (${tablename})</h2>`, db, { maleft: 12 });
	mButton('back', onclickBackHistory, db, {}, 'button','bBack');
	mText(`${title} (${tablename})`, db, { weight:'bold',fz:20,maleft: 12 });
	mButton('PgDn', () => showChunk(1), db, {w:25}, 'button','bPgDn');
	mButton('PgUp', () => showChunk(-1), db, {w:25}, 'button','bPgUp');
	mButton('multi-sort', onclickMultiSort, db, {}, 'button','bMultiSort');
	// mButton('filter1', onclickFilter1, db, {}, 'button','bFilter1');
	mButton('filter2', onclickFilter2, db, {}, 'button','bFilter2');
	// mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');
	mButton('download db', onclickDownloadDb, db, {}, 'button','bDownload');
	let dTable = mDom(dParent)
	DA.tinfo = {};
	// if (nundef(masterRecords)) masterRecords = records;
	addKeys({ q:DA.qCurrent, dParent, title, tablename, dTable, records, headers, header, ifrom: 0, size: 100 }, DA.tinfo);
	showChunk(0);
}
function showChunk(inc) {
	let o = DA.tinfo;
	let [dParent, title, tablename, dTable, records, headers, header] = [o.dParent, o.title, o.tablename, o.dTable, o.records, o.headers, o.header];
  let [ifrom,ito]=calcIndexFromTo(inc,o); //console.log(ifrom,ito)
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
	DA.tinfo.ifrom = ifrom;
	// return;
  let cells = DA.cells = [];
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
    //console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
    let tds = arrChildren(r);
		for (const ui of tds) {
      mStyle(ui,{cursor:'pointer'});
      let item = {ri,div:ui,text:ui.innerHTML,record:ri.o,isSelected:false,irow:t.rowitems.indexOf(ri),icol:tds.indexOf(ui)};
			item.header = headers[item.icol];
      cells.push(item);
			ui.onclick = ()=>toggleItemSelection(item); //async()=>await onclickTablecell(ui,ri,o);
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
  assertion(parts.length%2 == 0,'WTF')
  // console.log(parts.length,parts)
  const clauses = {};
  for(let i=0;i<parts.length;i+=2){
    //console.log(parts[i].toUpperCase())
    let key = parts[i].toUpperCase().trim();
    if (nundef(clauses[key])) clauses[key]=[];
    lookupAddToList(clauses,[key],`${key}\n${parts[i+1]}`);
  }
  return clauses;
}
function uiGadgetTypeTextarea(dParent, dict, resolve, styles = {}, opts = {}) {
	//let wIdeal = 500;
	let formStyles = { maleft: 10, box: true, padding: 10, bg: 'white', fg: 'black', rounding: 10 };
	let form = mDom(dParent, formStyles, {})
	addKeys({ className: 'input', tag: 'textarea', id:'taFilter', rows:25 }, opts);
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

