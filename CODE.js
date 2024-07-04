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
