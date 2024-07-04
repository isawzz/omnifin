
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



//*********************** */

async function onclickAddTag(idtrans, item) {

	//transaction id 3 hat tag id 51
	let currentTagObjects = M.transaction_tags.filter(x=>x.id == idtrans); //console.log(rtags); //return;

	let currentTagNames = currentTagObjects.map(x=>M.tagsIndex[x.tag_id].tag_name); //console.log(rtagNames); //return;//M.tag_name.

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

function saveDatabase() {
	const data = db.export();
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'test.db';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}



function createNewDatabase() {
	// Get the schema of the existing database
	const schemaQuery = `
		SELECT sql
		FROM sqlite_master
		WHERE type IN ('table', 'index', 'trigger');
	`;
	const schemaResult = DB.exec(schemaQuery);

	if (schemaResult.length === 0) {
		alert("No schema found in the existing database.");
		return;
	}

	// Create a new database
	const newDb = new DA.SQL.Database();

	// Apply the schema to the new database
	newDb.exec("PRAGMA foreign_keys = ON;");
	schemaResult[0].values.forEach(row => {
		console.log('row',row,row[0] && row[0].includes('sqlite_sequence'));
		if (row[0] && !row[0].includes('sqlite_sequence')) newDb.run(row[0]);
	});

	// Export the new database
	const data = newDb.export();
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'new_database.db';
	a.click();
}

function saveFilteredDatabase() {
	// Create a new database
	const newDb = new DA.SQL.Database();

	// Copy the schema to the new database
	newDb.run("CREATE TABLE transactions AS SELECT * FROM transactions WHERE 1=0;");
	newDb.run("CREATE TABLE transaction_tags AS SELECT * FROM transaction_tags WHERE 1=0;");
	newDb.run("CREATE TABLE tags AS SELECT * FROM tags WHERE 1=0;");
	newDb.run("CREATE TABLE accounts AS SELECT * FROM accounts WHERE 1=0;");
	newDb.run("CREATE TABLE assets AS SELECT * FROM assets WHERE 1=0;");

	// Insert filtered transactions with multiple tags
	newDb.run(`
		INSERT INTO transactions
		SELECT t.*
		FROM transactions t
		JOIN (
				SELECT id
				FROM transaction_tags
				GROUP BY id
				HAVING COUNT(tag_id) > 1
		) tt
		ON t.id = tt.id;
	`);

	// Insert related transaction_tags
	newDb.run(`
		INSERT INTO transaction_tags
		SELECT tt.*
		FROM transaction_tags tt
		JOIN transactions t
		ON tt.id = t.id;
	`);

	// Insert related tags
	newDb.run(`
		INSERT INTO tags
		SELECT tg.*
		FROM tags tg
		JOIN transaction_tags tt
		ON tg.id = tt.tag_id
		GROUP BY tg.id;
	`);

	// Insert related accounts
	newDb.run(`
		INSERT INTO accounts
		SELECT DISTINCT a.*
		FROM accounts a
		JOIN transactions t
		ON a.id = t.sender OR a.id = t.receiver;
	`);

	// Insert related assets
	newDb.run(`
		INSERT INTO assets
		SELECT DISTINCT a.*
		FROM assets a
		JOIN transactions t
		ON a.id = t.unit OR a.id = t.received_unit;
	`);

	// Export the new database
	const data = newDb.export();
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'filtered_test.db';
	a.click();
}




























