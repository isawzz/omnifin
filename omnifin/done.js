//#region db
function dbAddTagAndReport(transactionId, tagName, reportCategory = 'default') {
	// Insert a new report with default values
	let db = DB;
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
function dbCreateNew() {
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
function dbFindColor(s,header){
	return nundef(header)||header.includes('_name')? lookup(M.dbColors,[s,'color']):null;
}
function dbGetTagNames() { 
	let recs = dbToList('select * from tags',false); 
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));
	names.sort();
	return names;
}
function dbGetTableName(q) { return wordAfter(q.toLowerCase(), 'from'); }

function dbGetTableNames() { return dbToList(qTablenames(),false); }

async function dbInit(path) {
	try {
		const response = await fetch(path);
		const buffer = await response.arrayBuffer();
		// const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const SQL = DA.SQL = await initSqlJs({ locateFile: filename => `../basejs/alibs/${filename}` });
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
function dbSaveFiltered() {
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
function dbToDict(q, keyprop = 'id', addToHistory) { return list2dict(dbToList(q,addToHistory), keyprop); }

function dbToList(q, addToHistory = true) {
	if (q.toLowerCase().includes('insert') || q.toLowerCase().includes('update')) {
		if (!DA.editMode){
			showMessage('Entering Edit Mode...');
			DA.editMode = true;
		}
	}
	let res = dbToObject(q); 
	let headers = res.columns;
	let records = [];
	for (const row of res.values) {
		let o = {};
		for (let i = 0; i < headers.length; i++) {
			o[headers[i]] = row[i];
		}
		records.push(o);
	}
	dbHistory(q,addToHistory);
	return records;
}
function dbToObject(q) {
	let res = dbRaw(q);
	//console.log('tablename',dbGetTableName(q))
	return isList(res) && res.length == 1 && isdef(res[0].columns) ? res[0] : isEmpty(res) ? { columns: [], values: [] } : res;
}
//#endregion

//#region helpers
function calcIndexFromTo(inc, o) {
	let ito, ifrom = o.ifrom, records = o.records;
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
	return [ifrom, ito];
}
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

