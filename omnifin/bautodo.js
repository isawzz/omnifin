async function menuOpenTest(){}
async function menuCloseTest(){closeLeftSidebar();mClear('dMain')}

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
	let wmax = arrMax(items, 'w'); //console.log('wmax',wmax); //measure max width of items
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

function buildTransactionQuery(){
	let q=`
	
		`;
}
