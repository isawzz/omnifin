//#region require - constants
const express = require("express");
const bodyParser = require('body-parser');
//const fileUpload = require("express-fileupload");
const fs = require('fs');
const fsp = require('fs').promises;
const path = require("path");
const yaml = require('js-yaml');
const dotenv = require('dotenv');
dotenv.config();

//console.log('**************\n__dirname', __dirname);
const PORT = process.env.PORT || 3001;
const assetsDirectory = path.join(__dirname, '..', 'assets');
const uploadDirectory = path.join(__dirname, '..', 'y');
const dbDirectory = path.join(__dirname, '..', 'db');
const configFile = path.join(uploadDirectory, 'config.yaml');
var Session = {}; // session ist nur fuer temp data: just mem

const app = express();
app.use(bodyParser.json({ limit: '200mb' })); //works!!!
const cors = require('cors'); app.use(cors());
app.use(express.static(path.join(__dirname, '..'))); //Serve public directory

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(express.urlencoded({ extended: true }));


//#endregion

//#region functions
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function arrClear(arr) { arr.length = 0; return arr; }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMinus(arr, b) { if (isList(b)) return arr.filter(x => !b.includes(x)); else return arr.filter(x => x != b); }
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		console.log('!!!ASSERTION!!!')
		for (const a of args) {
			console.log('\n', a);
		}
		return false;
	} else return true;
}
function calcScoreSum(table) {
	let res = 0;
	for (const name in table.players) {
		res += table.players[name].score;
	}
	return res;
}
function calcErrSum(table) {
	let res = 0;
	for (const name in table.players) {
		res += valf(table.players[name].errors, 0);
	}
	return res;
}
function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}
function deleteFile(filePath) {
	fs.unlink(filePath, (err) => {
		if (err) {
			console.error('Error deleting file:', err);
			return;
		}
		console.log('File deleted:', filePath);
	});
}
function deleteTable(id) {
	delete Session.tables[id];
	deleteFile(getTablePath(id));
	let ti = Session.tableInfo[id];
	if (isdef(ti)) {
		delete Session.tableInfo[id];
		saveTableInfo();
	}

}
function emitToPlayers(namelist, msgtype, o) {
	for (const name of namelist) {
		let idlist = byUsername[name]; //console.log('name', name, '\nid', idlist);
		if (nundef(idlist)) continue;
		console.log('ids for', name, idlist)
		for (const id of idlist) {
			let client = clients[id]; //console.log(name, client.id); //isdef(client),Object.keys(client))
			if (client) client.emit(msgtype, o);
		}
	}
}
async function getFiles(dir) {
	const directoryPath = dir.startsWith('C:') ? dir : path.join(__dirname, dir);
	//console.log('dirpath', directoryPath)
	const files = await fsp.readdir(directoryPath);
	return files;

}
function getTablePath(id) { return path.join(tablesDir, `${id}.yaml`); }
function getTablesInfo() {
	let info = [];
	//console.log('session.tables',Session.tables); return [];
	for (const id in Session.tables) {
		let t = jsCopy(Session.tables[id]);
		delete t.fen;
		//delete t.players;
		info.push(t);
	}
	return info;
}
function getUniquePath(fname, dir) {
	let core = stringBefore(fname, '.');
	let ext = '.' + stringAfter(fname, '.');
	let name = core;
	let i = 1;
	while (true) {
		if (!fs.existsSync(dir + name + ext)) break;
		name = core + (i++);
	}
	return [name + ext, path.join(dir, name + ext)];

}
function getUserPath(name) { return path.join(usersDir, `${name}.yaml`); }
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function isString(param) { return typeof param == 'string'; }
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function lookup(dict, keys) {
	if (nundef(dict)) return null;
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue;
		//if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {}); //only uses val if hasn't been set!
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function normalizeString(s, sep = '_', keep = []) {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i]) || keep.includes(s[i])) res += s[i]; else res += sep; }
	return res;
}
function nundef(x) { return x === null || x === undefined; }
function recFlatten(o) {
	if (isLiteral(o)) return o;
	else if (isList(o)) return o.map(x => recFlatten(x)).join(', ');
	else if (isDict(o)) {
		let valist = [];
		for (const k in o) { let val1 = recFlatten(o[k]); valist.push(`${k}: ${val1}`); }
		return valist.join(', ');
	}
}
function removeInPlace(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function saveConfig() { let y = yaml.dump(Session.config); fs.writeFileSync(configFile, y, 'utf8'); }
function saveDetails() { let y = yaml.dump(M.details); fs.writeFileSync(detailsFile, y, 'utf8'); }
function saveLists() { let y = yaml.dump(M.lists); fs.writeFileSync(listsFile, y, 'utf8'); }
function saveTable(id, o) {
	lookupSetOverride(Session, ['tables', id], o);
	let y = yaml.dump(Session.tables[id]);
	fs.writeFileSync(getTablePath(id), y, 'utf8');
}
function saveTableInfo() {
	let y = yaml.dump(Session.tableInfo); fs.writeFileSync(tablesFile, y, 'utf8');
}
function saveUser(name, o) {
	let nogo = ['div', 'isSelected', 'button', 'button99', 'button98', 'button97', 'playmode'];
	nogo.map(x => delete o[x]);
	for (const k in o) {
		let val = o[k];
		if (!isDict(val)) continue;
		delete val['playmode'];
	}

	lookupSetOverride(Session, ['users', name], o);
	let y = yaml.dump(Session.users[name]);
	fs.writeFileSync(getUserPath(name), y, 'utf8');
}
function saveYaml(o,p) { let y = yaml.dump(o); fs.writeFileSync(p, y, 'utf8'); }
function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function toFlatObject(o) {
	if (isString(o)) return { details: o };
	for (const k in o) { let val = o[k]; o[k] = recFlatten(val); }
	return o;
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
//#endregion

//#region db
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const uploaddb = multer({ dest: 'y/' });

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
function dbGetTableName(q) { 
	return wordAfter(q.toLowerCase(), 'from'); 
	//return firstWord(stringAfterLast(q.toLowerCase(),'from'));
}
function dbGetTableNames() { return dbToList(qTablenames(),false); }

function dbGetSampleQuery() {
	let qs = [qTTList,qTTCols,qCurrency,qStocks,qAusgaben,qEinnahmen];
	let q = rChoose(qs)();
	q = replaceAllSpecialChars(q, '\t', ' ');
	q = replaceAll(q, '  ', ' ');
	//q=splitOnUpperCaseWord(q);
	return q.trim();
}
function dbHistory(q, addToHistory) {
	if (addToHistory) {
		let q1 = q.toLowerCase().trim();
		if (q1.startsWith('select')) {
			if (isdef(DA.qCurrent)) M.qHistory.push({ q: DA.qCurrent, tablename: wordAfter(q1, 'from') });
			DA.qCurrent = q1;
		}
	}
}
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

app.get('/config', (req, res) => {
	console.log('==> get config')
	res.json(Session.config);
});
app.get('/filenames', async (req, res) => {
	const { directory: dir } = req.query;
	if (!dir) { return res.status(400).json({ error: 'Directory parameter is missing' }); }
	try {
		const directoryPath = dir.startsWith('C:') ? dir : path.join(assetsDirectory, dir);
		//console.log('dirpath', directoryPath)
		const files = await fsp.readdir(directoryPath);
		//console.log('files',files)
		res.json({ files });
	} catch (err) {
		res.status(500).json({ error: 'Error reading directory', details: err.message });
	}
});
app.get('/session', (req, res) => {
	console.log('==> get session')
	res.json({ config: Session.config });
});

//#region post routes (uses emit)
app.post('/dbSave', uploaddb.single('dbFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, '..', 'y', req.file.originalname);
	console.log(targetPath);

  fs.rename(tempPath, targetPath, err => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Database file uploaded successfully' });
  });
});
app.post('/postConfig', (req, res) => {
	console.log('<== post config')
	Session.config = req.body;
	let y = yaml.dump(Session.config);
	fs.writeFileSync(configFile, y, 'utf8');
	io.emit('config', Session.config);
	res.json("config saved!");
});
app.post('/postYaml', (req, res) => {
	let o=req.body.o;
	let p=path.join(__dirname,req.body.path);
	saveYaml(o,p);
	if (p.includes('y/lists')) M.lists=o;
	if (p.includes('y/details')) M.details=o;
	if (p.includes('y/superdi')) M.superdi=o;
	if (p.includes('y/cache')) M.cache=o;
	if (p.includes('y/config')) Session.config=o;
	res.json(o);
});
app.post('/postImage', (req, res) => {
	console.log('<== post image')
	const data = req.body;
	let fname = data.filename;
	let base64Data = data.image.replace(/^data:image\/png;base64,/, "");
	let p;
	if (isdef(data.coll)) {

		// let name = stringBefore(p, '.');
		// console.log('name', name);

		let dir = path.join(assetsDirectory, 'img', data.coll);
		// console.log('dir', dir);

		if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		[fname, p] = getUniquePath(fname, dir);
		// fname = path.join(dir, p);
		// if (fs.existsSync(fname)) {
		// 	console.log()
		// 	res.json(`the file ${fname} already exists and nothing was saved!`);
		// 	return;
		// }

	} else {
		fname = path.join(__dirname, fname);
	}
	console.log('fname', fname, 'saved');
	fs.writeFileSync(p, base64Data, 'base64');
	res.json({
		message: 'File uploaded successfully',
		path: p,
		filename: fname
	});
});

async function init() {
	let yamlFile = fs.readFileSync(configFile, 'utf8');
	Session.config = yaml.load(yamlFile);

	app.listen(PORT, () => console.log('ode: listening on port ' + PORT));
}
init();



