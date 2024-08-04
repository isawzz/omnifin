
function qToTagView(q) {
	let names = dbGetTagNames();

	let s = '';
	for (const name of names) { s += `MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}',\n`; }
	let sparts = s.split(',').map(x=>x.trim());

	let clauses = splitSQLClauses(q); //console.log(clauses); 

	//console.log(clauses);
	let cl = clauses.SELECT[0];

	let parts=stringAfter(cl,'SELECT',false).trim().split(',').map(x=>x.trim());
	//console.log(jsCopy(parts));

	//1. remove the group concat that ends with 'tag_names'
	removeInPlace(parts,parts.find(x=>x.endsWith('tag_names')));

	//2. insert s after description or before last col
	let desc=parts.find(x=>x.endsWith('description'));
	if (isdef(desc)){
		let i = parts.indexOf(desc);
		parts.splice(i+1,0,...sparts);
	}else{
		parts.splice(parts.length-1,0,...sparts);
	}
	//console.log(jsCopy(parts));
	parts = parts.filter(x=>!isEmpty(x));

	clauses.SELECT[0] = 'SELECT\n' + parts.join(',\n');

	//clauses wieder zusammensetzen
	let qnew = '';
	for (const k in clauses) {
		for (const a of clauses[k]) qnew += `${a.trim()}\n`;
	}

	return qnew; //Sclauses.join('\n');
}

function qFromTagView(q) {

	let clauses = splitSQLClauses(q); //console.log(clauses); 

	//console.log(clauses);
	let cl = clauses.SELECT[0];

	let parts=stringAfter(cl,'SELECT',false).trim().split(',').map(x=>x.trim());
	//console.log(jsCopy(parts));

	//remove all parts that start with MAX
	parts = arrMinus(parts,parts.filter(x=>x.startsWith('MAX(')));

	//2. insert GROUP_CONCAT before description or before last col
	let s=`GROUP_CONCAT(CASE WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) AS tag_names`;

	let desc=parts.find(x=>x.endsWith('description'));
	if (isdef(desc)){
		let i = parts.indexOf(desc);
		parts.splice(i,0,s);
	}else{
		parts.splice(parts.length-1,0,s);
	}
	//console.log(jsCopy(parts));
	parts = parts.filter(x=>!isEmpty(x));

	clauses.SELECT[0] = 'SELECT\n' + parts.join(',\n');

	//clauses wieder zusammensetzen
	let qnew = '';
	for (const k in clauses) {
		for (const a of clauses[k]) qnew += `${a.trim()}\n`;
	}

	return qnew; //Sclauses.join('\n');
}









