async function dbInit(path) {
	try {
		const response = await fetch(path);
		const buffer = await response.arrayBuffer();
		const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const db = new SQL.Database(new Uint8Array(buffer));
		return db;
	} catch (error) {
		console.error('Error:', error);
		document.getElementById('output').textContent = 'Error: ' + error.message;
		return null;
	}
}
function dbResultToDict(res, keyprop) {
	let list = dbResultToList(res);
	return list2dict(list, keyprop);
}
function dbResultToList(res) {
	if (isList(res) && res.length == 1 && isdef(res[0].columns)) res = res[0];
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
function dbq(q) { return DB.exec(q); }

function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }

async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar();
	let gap = 5;
	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);
	UI.commands.transactions = mCommand(side.d, 'transactions', 'transactions'); mNewline(side.d, gap);
	UI.commands.flex = mCommand(side.d, 'flex', 'flex-perks'); mNewline(side.d, gap);
}
async function menuOpenSql() {
	let side = UI.sidebar = mSidebar();
	let d = mDom('dMain', { w: window.innerWidth - side.wmin - 20, box: true, padding: 10 });
	let ta = UI.ta = mDom(d, { 'white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { tag: 'textarea', id: 'taSql', rows: 4, value: 'select * from transactions' });
	ta.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onclickExecute();
		}
	});
}
async function onclickExecute() {
	let res = dbq(UI.ta.value);
	console.log(res)
}
function onclickFlex() { showTableInMain(qTransactionsFlexperks()); }

function onclickShowSchema() {
	let res = dbq(`SELECT sql FROM sqlite_master WHERE type='table';`);
	showRawInMain(res)
}
async function onclickSql() { console.log('hallo') }

function onclickTransactions() { showTableInMain(qTransactionsSelected()); }

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
function showRawInMain(res) {
	let text = res.map(({ columns, values }) => {
		return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
	}).join('\n\n');
	mClear('dMain');
	let d = mDom('dMain', {}, { tag: 'pre', html: text })
}
function showTableInMain(q) {
	let res = dbq(q);
	mClear('dMain');
	showTransactions(res[0])
}
function showTableSortedBy(dParent, records, headers, header) {
	if (DA.sortedBy == header) { sortByDescending(records, header); DA.sortedBy = null; }
	else { sortBy(records, header); DA.sortedBy = header; }
	mClear(dParent);
	mText(`<h2>transactions</h2>`, dParent, { maleft: 12 })
	let t = UI.tables = mDataTable(records, dParent, null, headers, 'records');
	let dt = t.div;
	mStyle(dt, { 'caret-color': 'transparent' });
	let headeruis = Array.from(dt.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = () => showTableSortedBy(dParent, records, headers, ui.innerHTML);
	}
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
	showTableSortedBy(dParent, records, ['id', 'dateof', 'from', 'to', 'amount', 'unit'], 'dateof');
}
async function updateExtra() { }


