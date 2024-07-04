
const DB_PATH = '../omnifin/db/test.db'; // relative to omnifin dir

onload = start;
onscroll = handleSticky;

async function start() { await prelims(); test6(); }

async function test6(){

	await switchToMainMenu('overview');

	//createNewDatabase();
}
async function test5(){
	await switchToMainMenu('home');
	let q=qTransactionsFlexperks();
	let res=dboutput(q);
	mBy('dPre').textContent = res;
}
async function test4() {
	await switchToMainMenu('sql');

	let res=dbq('select * from transactions');
	console.log(res[0].columns,res[0].values)

}

//#region preliminary tests
async function test3_getdb() {
	let db = await dbInit('../db/test.db');
	if (!db) return; //	console.log(db)
	let text = await dbQuery(db, `SELECT sql FROM sqlite_master WHERE type='table';`, mBy('output'))
}
async function test2() {
	const fileUrl = './test.db';

	try {
		const response = await fetch(fileUrl);
		const buffer = await response.arrayBuffer();

		const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const db = new SQL.Database(new Uint8Array(buffer));
		const query = "SELECT * FROM transactions;";

		try {
			const result = db.exec(query);
			const output = result.map(({ columns, values }) => {
				return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
			}).join('\n\n');
			document.getElementById('output').textContent = output || 'Query executed successfully.';
		} catch (error) {
			document.getElementById('output').textContent = 'Error executing SQL: ' + error.message;
		}
	} catch (error) {
		console.error('Error:', error);
		document.getElementById('output').textContent = 'Error: ' + error.message;
	}
}
async function test1() {
	const fileUrl = './test.db';

	fetch(fileUrl)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` })
				.then(SQL => {
					const db = new SQL.Database(new Uint8Array(buffer));
					const query = "SELECT * FROM transactions;";
					try {
						const result = db.exec(query);
						const output = result.map(({ columns, values }) => {
							return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
						}).join('\n\n');
						document.getElementById('output').textContent = output || 'Query executed successfully.';
					} catch (error) {
						document.getElementById('output').textContent = 'Error executing SQL: ' + error.message;
					}
				})
				.catch(error => {
					console.error('Error initializing SQL.js:', error);
				});
		})
		.catch(error => {
			console.error('Error fetching database file:', error);
		});

}
async function test0() {
	document.body.innerHTML = `
			<h1>SQLite Database Viewer</h1>
			<textarea id="sql-input" rows="10" cols="50" placeholder="Enter SQL commands here..."></textarea>
			<button onclick="executeSQL()">Execute</button>
			<pre id="output"></pre>
		`;
	const fileUrl = './test.db';

	fetch(fileUrl)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` })
				.then(SQL => {
					const db = new SQL.Database(new Uint8Array(buffer));
					// Example: Query to show tables
					const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
					document.getElementById('output').textContent = JSON.stringify(tables, null, 2);
				})
				.catch(error => {
					console.error('Error initializing SQL.js:', error);
				});
		})
		.catch(error => {
			console.error('Error fetching database file:', error);
		});
}
//#endregion

async function prelims() {
	M={};
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	mStyle('dMain',{padding:10})
	UI.commands = {};
	UI.nav = showNavbar(); 
	setColors('skyblue', 'white');
	DB = await dbInit(DB_PATH);

	let tablenames = dbGetTableNames();
	tablenames = tablenames.map(x=>x.name);
	tablenames.map(x=>M[x]=dbToDict(`select * from ${x}`));
	M.tagsByName=dbToDict(`select * from tags`,'tag_name');
	//console.log(M)
}









