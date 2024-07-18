
//#region stages showRecord SEHR COOL!!!!

//#region stage 9
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




