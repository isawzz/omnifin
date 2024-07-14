//#region 14.7.24
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


//#region menu overview 13.7.24
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


//#region 10.7.24
function _mToggleButton(offstate, onstate, handler, dParent, styles = {}, opts = {}) {

	let d = mDom(dParent, { fz: 20 });
	mAppend(d, mSwitch(offstate, onstate));


	// addKeys({state:'off'},opts); //which is initial state
	// //let dbotswitch = mDom(dParent, { align: 'right', patop: 10, gap: 6 }, { html: offstate }); mFlexLine(dbotswitch, 'end')


	// let d=mDom(dParent,{className:'centerFlexV'});
	// mDom(d,{},{html:offstate})

	// let oSwitch = mSwitch(d, {}, { id: 'bot', val:''});// amIHuman(table) ? '' : 'checked' });
	// let inp = oSwitch.inp;
	// oSwitch.inp.onchange = handler;
	// for(const x of arrChildren(dParent)) console.log(x);

	// let div=d.firstChild; console.log(div)
	// mStyle(div,{display:'inline'});
	// //let sw=div.firstChild;
	// //mAppend(dParent,sw);
	// //mRemove(div);
	// //return sw;

}

async function sortRecords(exp, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(null, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}
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
	let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);
	// mText(`<h2>${title} (${tablename})</h2>`, db, { maleft: 12 });
	mButton('fifast', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	mButton('filter', onclickFilter, db, {}, 'button', 'bFilter');
	mButton('back', onclickBackHistory, db, {}, 'button', 'bBack');
	mText(`${tablename} (${records.length})`, db, { weight: 'bold', fz: 20, maleft: 12 });
	mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	mButton('multi-sort', onclickMultiSort, db, {}, 'button', 'bMultiSort');
	// mButton('filter1', onclickFilter1, db, {}, 'button','bFilter1');
	// mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');
	mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');
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
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowitems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => toggleItemSelection(item); //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}
function showNavbar() {
	mDom('dNav', { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let nav = mMenu('dNav');
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;
	return nav;
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

//#region
function mist(){
  const clauses = {};
  let currentClause = null;

  parts.forEach(part => {
      //console.log('___',part)
      const upperPart = part.trim().toUpperCase();
      if (pattern.test(upperPart)) {
          // If the part matches the pattern, it's a new clause
          currentClause = upperPart;
          if (!clauses[currentClause]) {
              clauses[currentClause] = [];
          }
      } else if (currentClause) {
          // If it's not a new clause, append it to the current clause
          clauses[currentClause].push(part.trim());
      }
  });

  // Join multiple similar clauses into a single string
  Object.keys(clauses).forEach(key => {
      if (clauses[key].length === 1) {
          clauses[key] = clauses[key][0];
      } else {
          clauses[key] = clauses[key].join(' ');
      }
  });

  return clauses;
}


function mist(){

	return '';
	let selectClause = clauses.SELECT; 
	let correctHeaders = selectClause.split(',').map(x=>x.trim());
	correctHeaders=correctHeaders.map(x=>x.includes(' ')?stringAfterLast(x,' '):x)
	console.log('correct',correctHeaders)

	for(const item of selitems){
		let h=item.header.includes(' ')?stringAfterLast(item.header,' '):item.header;
		console.log('h',h)
		if (correctHeaders.includes(h)) item.correctHeader = h;
		else {
			let h1=correctHeaders.find(x=>stringAfter(x,'.')==h);
			if (isdef(h1)) item.correctHeader = h1;
			else showMessage(`need to correct header ${h} in where clause!`,5000)
		}
	}
	
	let q=DA.info.q;
	let where = generateSQLWhereClause(selitems); console.log(where)
	//let qres = insertWhereClause(DA.tinfo.q, where); //console.log(qres)

	let di=splitSQLClauses(q);
	return '';
	let order = `SELECT|FROM|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET`.split('|');
	let final = '';
	for(const k of order){
		if (isdef(di[k])) {
			console.log(typeof(di[k]),di[k]);
			//final += k + ' ' + di[k] + '\n';
		}
	}
	return final;
	// const pattern = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|FULL JOIN|CROSS JOIN|UNION)\b/gi;
  // const parts = qres.split(pattern).filter(Boolean);
	// qres = parts.join('\n');
	//console.log(qres)
	//console.log(clauses,where);
	return qres;
}
function mist(){	
	let qtrim=DA.tinfo.q.trim().toLowerCase();
	assertion(qtrim.endsWith(';'),'WTF!!!!!!!!!!!!!!!!!!!');
	let q=qtrim;

	q=replaceAllSpecialCharsFromList(q,['\t','\n'],' ');

	//generateSQLWhereClause

	exp=stringBeforeLast(exp,';') + ' where ';
	//console.log(exp)

	for(const item of selitems){
		let header = info.headers[item.icol];
		let text = iDiv(item).innerHTML;
		//if (exp != '') exp += ' or ';
		exp += `${header}='${text}'`;
		if (arrIsLast(selitem,item)) exp += ';'; else exp +=' or ';
	}
	return exp;

}

function uiGadgetTypeTablecell(dParent, dict, resolve, styles = {}, opts = {}) {

	addKeys({ hmax: 500, wmax: 400, bg: 'white', fg: 'black', padding: 16, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let selectStyles = { hmax, w:220, box: true };

  console.log('dict',dict);

  //ich moecht wissen ob es ein filtering n

  return dOuter;
}async function onclickTablecell(ui,ri,o){

  let result = await mGather(ui, {}, { content: { ri, o }, type: 'tablecell' });

	console.log('result',result)

} 

function _mist() {
	let ops = ['contains', '==', '!=', '<=', '>=', '<', '>'];
	let dSelectOp = uiTypeSelect(ops, dParent, styles, opts);

	let inputs = [];
	let formStyles = opts.showLabels ? { wmin: 400, padding: 10, bg: 'white', fg: 'black' } : {};
	let form = mDom(dParent, formStyles, { tag: 'form', method: null, action: "javascript:void(0)" })
	for (const k in dict) {
		let [content, val] = [k, dict[k]];
		if (opts.showLabels) mDom(form, {}, { html: content });
		let inp = mDom(form, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', value: val, placeholder: `<enter ${content}>` });
		inputs.push({ name: content, inp: inp });
		mNewline(form)
	}
	mDom(form, { display: 'none' }, { tag: 'input', type: 'submit' });
	form.onsubmit = ev => {
		ev.preventDefault();
		let di = {};
		inputs.map(x => di[x.name] = x.inp.value);
		resolve(di);
	}
	return form;
}
function _generateTagColumns() {
  // Get unique tag names
  //const tagNamesResult = DB.exec(`SELECT DISTINCT tag_name FROM tags WHERE tag_name NOT GLOB '*[0-9]*'`);
  const tagNamesResult = db.exec(`SELECT DISTINCT tag_name FROM tags WHERE tag_name NOT GLOB '*[0-9]*'`);
  const tagNames = tagNamesResult[0].values.map(row => row[0]);

  // Construct the dynamic SQL part for tag columns
  const tagColumns = tagNames.map(tagName => 
    `MAX(CASE WHEN tg.tag_name = '${tagName}' THEN 'X' ELSE '' END) AS ${tagName}`
  ).join(', ');

  return tagColumns;
}
function _generateTagColumns() {
  // Get unique tag names
  const tagNamesResult = DB.exec(`SELECT DISTINCT tag_name FROM tags WHERE tag_name NOT GLOB '*[0-9]*';`);


  
  // Extract tag names from the query result
  const tagNames = tagNamesResult[0].values.map(row => row[0]);

  // Construct the dynamic SQL part for tag columns
  const tagColumns = tagNames.map(tagName => 
    `MAX(CASE WHEN tg.tag_name = '${tagName}' THEN 'X' ELSE '' END) AS ${tagName.replace(/\s+/g, '_')}`
  ).join(', ');

  return tagColumns;
}
function _qTT() {
  const tagColumns = generateTagColumns();
  
  return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      ${tagColumns}
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
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit;
  `;
}
function qTT() {

	let recs = dbToList('select * from tags');
	console.log(recs)
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));
	console.log(names);
	let s='';
	for(const name of names){
		s+=`MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS ${name},\n`
	}

  return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      MAX(CASE WHEN tg.tag_name = 'utility' THEN 'X' ELSE '' END) AS utility,
      MAX(CASE WHEN tg.tag_name = 'tag2' THEN 'X' ELSE '' END) AS tag2,
      MAX(CASE WHEN tg.tag_name = 'tag3' THEN 'X' ELSE '' END) AS tag3
    FROM 
      transactions t
    JOIN 
      accounts sender ON t.sender = sender.id
    JOIN 
      accounts receiver ON t.receiver = receiver.id
    JOIN 
      assets a ON t.unit = a.id
    JOIN 
      transaction_tags tt ON t.id = tt.id
    JOIN 
      tags tg ON tt.tag_id = tg.id
    GROUP BY 
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit
		HAVING 
			COUNT(tg.tag_name) > 1
		Limit 20;
  `;
}
function qTransactions() {
	return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      GROUP_CONCAT(tg.tag_name) AS tag_names 
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
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit;

  `;
}
function qTransFlex() {
	return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      GROUP_CONCAT(tg.tag_name) AS tag_names 
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
		WHERE
				sender_name = 'flex-perks'
    GROUP BY 
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit;

  `;
}
function qTranstags() {
	return `
		SELECT 
				t.id, 
				t.dateof, 
				sender.account_name AS sender_name, 
				receiver.account_name AS receiver_name, 
				t.amount, 
				a.asset_name AS unit, 
				GROUP_CONCAT(tg.tag_name) AS tag_names 
		FROM 
				transactions t
		JOIN 
				accounts sender ON t.sender = sender.id
		JOIN 
				accounts receiver ON t.receiver = receiver.id
		JOIN 
				assets a ON t.unit = a.id
		JOIN 
				transaction_tags tt ON t.id = tt.id
		JOIN 
				tags tg ON tt.tag_id = tg.id
		GROUP BY 
				t.id;

		`;
}
function qTransmultitag() {
	return `
		SELECT 
				t.id, 
				t.dateof, 
				sender.account_name AS sender_name, 
				receiver.account_name AS receiver_name, 
				t.amount, 
				a.asset_name AS unit, 
				GROUP_CONCAT(tg.tag_name) AS tag_names 
		FROM 
				transactions t
		JOIN 
				accounts sender ON t.sender = sender.id
		JOIN 
				accounts receiver ON t.receiver = receiver.id
		JOIN 
				assets a ON t.unit = a.id
		JOIN 
				transaction_tags tt ON t.id = tt.id
		JOIN 
				tags tg ON tt.tag_id = tg.id
		GROUP BY 
				t.id
		HAVING 
				COUNT(tg.tag_name) > 1;
	
		`;
}
function qLimit20() {
	return `
		SELECT 
				t.id, 
				t.dateof, 
				sender.account_name AS sender_name, 
				receiver.account_name AS receiver_name, 
				t.amount, 
				a.asset_name AS unit, 
				GROUP_CONCAT(tg.tag_name) AS tag_names 
		FROM 
				transactions t
		JOIN 
				accounts sender ON t.sender = sender.id
		JOIN 
				accounts receiver ON t.receiver = receiver.id
		JOIN 
				assets a ON t.unit = a.id
		JOIN 
				transaction_tags tt ON t.id = tt.id
		JOIN 
				tags tg ON tt.tag_id = tg.id
		GROUP BY 
				t.id
		HAVING 
				COUNT(tg.tag_name) > 1
		LIMIT 20;	
		`;
}


async function restOnclickTag(){

	//transaction id 3 hat tag id 51
	let currentTagObjects = Object.values(M.transaction_tags).filter(x=>x.id == idtrans); //console.log(rtags); //return;

	let currentTagNames = currentTagObjects.map(x=>M.tags[x.tag_id].tag_name); //console.log(rtagNames); //return;//M.tag_name.

	let allTagNames = Object.keys(M.tagsByName); console.log(allTagNames)
	let content = allTagNames.map(x => ({ key: x, value:currentTagNames.includes(x) }));
	//content = sortBy(content,x=>x.value)
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput' });
	console.log(list);
	if (!list) {console.log('add tag CANCELLED!!!'); return; }
	//look if there is any tag that has not been there before
	let newTagNames=arrWithout(list,currentTagNames);
	console.log('new tags',newTagNames);

	for(const t of newTagNames){
		//need to create a report and add it to reports,
		//need to add a record in transaction_tags with corresponding trans_id,tag_id,report_id
	}
}
function splitOnUpperCaseWord(s){
	let w=s.split(' ');
}
function ensuredT(){
	let dParent = mBy('dT');
	if (isdef(dParent)) { mClear(dParent); }
	else dParent = mDom('dMain', {}, { className: 'section', id: 'dT' });
	return dParent;
}
async function showQueryResult(tablename,res,headers) {
	let records = dbResultToList(res);
	let dParent = ensuredT();
	if (isEmpty(records)) { mText('no records', dParent); return []; }
	if (nundef(headers)) headers = Object.keys(records[0]);
	showTableSortedBy(dParent, tablename, records, headers, headers[0]);
}
function showTableInMain(q,headers){
	let tablename = wordAfter(q.toLowerCase(),'from').trim(); //console.log('tablename',tablename);
	let res = dbq(q);
	
	if (isdef(res)) res=res[0];
	if (nundef(res)) {let d=ensuredT();d.innerHTML = `no records found in ${tablename}`; return []; }
	//console.log(res)
	showQueryResult(tablename,res,headers);

}


//menu sql MIT sidebar!!!
async function menuOpenSql() {
	//let side = UI.sidebar = mSidebar();
	let d = mDom('dMain'); //, { w: window.innerWidth - side.wmin - 20, box: true, padding: 10 });
	let ta = UI.ta = mDom(d, { 'white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { tag: 'textarea', id: 'taSql', rows: 4, value: 'select * from transactions' });
	ta.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onclickExecute();
		}
	});
}
function qTransactionTags(){
	return `select * from transaction_tags where tag_id = '51'`;
}
function qTransactionsTagnames(){
	return `
		SELECT 
				t.id, 
				t.dateof, 
				sender.account_name AS sender_name, 
				receiver.account_name AS receiver_name, 
				t.amount, 
				a.asset_name AS unit, 
				tg.tag_name 
		FROM 
				transactions t
		JOIN 
				accounts sender ON t.sender = sender.id
		JOIN 
				accounts receiver ON t.receiver = receiver.id
		JOIN 
				assets a ON t.unit = a.id
		JOIN 
				transaction_tags tt ON t.id = tt.id
		JOIN 
				tags tg ON tt.tag_id = tg.id;
	`;
}
function qTaggedTransactions(){
	return `SELECT * FROM transactions WHERE id IN (SELECT id FROM transaction_tags);`
}
function qTaggedTransactionsLimit10(){
	return `SELECT * FROM transactions WHERE id IN (SELECT id FROM transaction_tags) limit 10;`
}
function _qTransactions() {
	return `
			SELECT
					t.id,
					t.dateof,
					t.location,
					sender_account.account_name AS sender_name,
					receiver_account.account_name AS receiver_name,
					t.amount,
					t.unit,
					t.received_amount,
					t.received_unit,
					t.description,
					t.reference,
					t.report
			FROM
					transactions t
			JOIN
					accounts sender_account ON t.sender = sender_account.id
			JOIN
					accounts receiver_account ON t.receiver = receiver_account.id;
		`;
}
function _qTransactionsSelected() {
	return `
			SELECT
					t.id,
					t.dateof,
					t.location,
					sender_account.account_name AS sender_name,
					sender_account.account_owner AS sender_owner,
					receiver_account.account_name AS receiver_name,
					receiver_account.account_owner AS receiver_owner,
					t.amount,
					t.unit,
					t.description
			FROM
					transactions t
			JOIN
					accounts sender_account ON t.sender = sender_account.id
			JOIN
					accounts receiver_account ON t.receiver = receiver_account.id;
		`;
}
function _qTransactionsFlexperks() {
	return `
			SELECT
					t.id,
					t.dateof,
					t.location,
					sender_account.account_name AS sender_name,
					sender_account.account_owner AS sender_owner,
					receiver_account.account_name AS receiver_name,
					receiver_account.account_owner AS receiver_owner,
					t.amount,
					t.unit,
					t.description
			FROM
					transactions t
			JOIN
					accounts sender_account ON t.sender = sender_account.id
			JOIN
					accounts receiver_account ON t.receiver = receiver_account.id
			WHERE
					sender_name = 'flex-perks';
		`;
}
function _qTransactions10() {
	return `
			SELECT
					t.id,
					t.dateof,
					t.location,
					sender_account.account_name AS sender_name,
					sender_account.account_owner AS sender_owner,
					receiver_account.account_name AS receiver_name,
					receiver_account.account_owner AS receiver_owner,
					t.amount,
					t.unit,
					t.description
			FROM
					transactions t
			JOIN
					accounts sender_account ON t.sender = sender_account.id
			JOIN
					accounts receiver_account ON t.receiver = receiver_account.id
			WHERE
					sender_name = 'flex-perks'
			LIMIT 10;
		`;
}
function showTransactionsInMain(q) {
	let res = dbq(q);
	mClear('dMain');
	showTransactions(res[0])
}

async function showTransactions(res) {
	let records = dbResultToList(res);
	let dParent = mBy('dT');
	if (isdef(dParent)) { mClear(dParent); }
	else dParent = mDom('dMain', {}, { className: 'section', id: 'dT' });
	if (isEmpty(records)) { mText('no records', dParent); return []; }
	records.map(x => x.amount = Number(x.amount));
	records.map(x => x.from = `${x.sender_name} (${x.sender_owner})`);
	records.map(x => x.to = `${x.receiver_name} (${x.receiver_owner})`);
	let units = ['$', '€'];
	records.map(x => x.amt = `${x.unit < units.length ? units[x.unit] : '?'}${x.amount}`);
	showTableSortedBy(dParent, 'transactions', records, ['id', 'dateof', 'from', 'to', 'amount', 'unit'], 'dateof');
}
function dbq(q) {	let res = DB.exec(q);	if (isdef(res)) res = res[0];	return res;}
function dbResultToDict(res, keyprop) {
	let list = dbResultToList(res);
	return list2dict(list, keyprop);
}
function dbResultToList(res) {
	//if (isList(res) && res.length == 1 && isdef(res[0].columns)) res = res[0];
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

function _onclickFlex() { showTransactionsInMain(qTransactionsFlexperks()); }
function _onclickLimit10() { showTransactionsInMain(qTransactions10()); }
function onclickTaggedLimit10() { showTableInMain(qTaggedTransactionsLimit10(), ['id', 'dateof', 'description']); }
function onclickTranstagname() { showTableInMain(qTranstags()); }
function onclickTransmultitag() { showTableInMain(qTransmultitag()); }
