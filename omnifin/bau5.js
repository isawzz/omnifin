
function clsGetHeaderMapping1(clauses, sorting) {
	let sc = clauses.SELECT[0];
	assertion(isdef(sc), `NO SELECT CLAUSE!!! ${clauses}`);
	assertion(clauses.SELECT.length == 1, `WRONG NUMBER OF SELECT CLAUSES!!! ${clauses}`);
	//jetzt hab ich die clauses!

	sc = stringAfter(sc, 'SELECT');
	let selectHeaders = sc.split(',').map(x=>x.trim());
	let res = [];
	for(const h of selectHeaders){
		let parts = splitAtStringCI(h, ' as ');
		//console.log(parts);
		addIf(res,{use:parts[0].trim(),compare:parts.length>1?parts[1].trim():parts[0].trim()});
	}
	selectHeaders = res;
	
	//selectHeaders=selectHeaders.map(x=>trimQuotes(x)); console.log('select headers:', selectHeaders);
	//assertion(false,"*** THE END ***")

	//die sorting params sollen jetzt verwandelt werden in die select headers
	let sortHeaders = Object.keys(sorting).filter(x => isdef(sorting[x]));
	//console.log('sort headers:', sortHeaders);
	let headerMapping = {};
	for (const hSort of sortHeaders) {
		let hSelect = selectHeaders.find(x => x.compare.endsWith(hSort))
		if (hSelect) headerMapping[hSort] = hSelect.use.includes('.')?hSelect.use:`"${hSelect.use}"`;
	}
	return headerMapping;
}








