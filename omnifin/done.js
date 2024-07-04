//#region db
function dbGetTableName(q) { return wordAfter(q.toLowerCase(), 'from'); }

function dbGetTableNames() { return dbToList(qTablenames()); }

async function dbInit(path) {
	try {
		const response = await fetch(path);
		const buffer = await response.arrayBuffer();
		// const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const SQL = DA.SQL = await initSqlJs({ locateFile: filename => `../omnifin/libs/${filename}` });
		const db = new SQL.Database(new Uint8Array(buffer));
		return db;
	} catch (error) {
		console.error('Error:', error);
		document.getElementById('output').textContent = 'Error: ' + error.message;
		return null;
	}
}
function dbRaw(q) { return DB.exec(q); }

function dbToDict(q,keyprop='id'){	return list2dict(dbToList(q),keyprop); }

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
function dbToObject(q){
	let res = dbRaw(q); 
	//console.log('tablename',dbGetTableName(q))
	return isList(res) && res.length == 1 && isdef(res[0].columns)? res[0]: isEmpty(res)?{columns:[],values:[]}:res;
}
//#_endregion

//#region menu overview
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar();
	let gap = 5;
	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);
	UI.commands.transactions = mCommand(side.d, 'transactions', 'transactions'); mNewline(side.d, gap);
	UI.commands.flex = mCommand(side.d, 'flex', 'flex-perks'); mNewline(side.d, gap);
	UI.commands.tagged = mCommand(side.d, 'tagged', 'tagged'); mNewline(side.d, gap);
	UI.commands.multiTagged = mCommand(side.d, 'multiTagged', 'multi-tagged'); mNewline(side.d, gap);
	UI.commands.limit20 = mCommand(side.d, 'limit20', 'just 20'); mNewline(side.d, gap);

	UI.d=mDom('dMain',{className:'section'});
	onclickLimit20();
}
async function menuCloseOverview(){closeLeftSidebar();mClear('dMain')}

function onclickShowSchema() {
	let res = dbRaw(`SELECT sql FROM sqlite_master WHERE type='table';`);
	let text = res.map(({ columns, values }) => {
		// return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
		return values.map(row => row.join('\t')).join('\n');
	}).join('\n\n');
	let d= UI.d;
	mClear(d)
	mText(`<h2>Schema</h2>`, d, { maleft: 12 })
	mDom(d, {}, { tag: 'pre', html: text });
}
function onclickTransactions() { let records = dbToList(qTransactions()); showTableSortedBy(UI.d, 'transactions', records); }
function onclickFlex() { let records = dbToList(qTransFlex()); showTableSortedBy(UI.d, 'flex-perks', records); }
function onclickTagged() { let records = dbToList(qTranstags()); showTableSortedBy(UI.d, 'tagged transactions', records); }
function onclickMultiTagged() { let records = dbToList(qTransmultitag()); showTableSortedBy(UI.d, 'transactionsw/  multiple tags', records); }
function onclickLimit20() { let records = dbToList(qLimit20()); showTableSortedBy(UI.d, '20 transactions', records); }

//#region menu sql

