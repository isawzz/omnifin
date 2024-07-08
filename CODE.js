
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
		if (isLast(item,selitems)) exp += ';'; else exp +=' or ';
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
