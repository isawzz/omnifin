
function qToTagView(q) {
	let names = dbGetTagNames();

	let s = '';
	for (const name of names) { s += `MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}',\n`; }
	let sparts = s.split(',').map(x=>x.trim());

	let clauses = sqlSplitClauses(q); //console.log(clauses); 

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

	let clauses = sqlSplitClauses(q); //console.log(clauses); 

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

function qCurrency() {
	return `
		SELECT 
			t.id, 
			t.dateof, 
			sender.account_name AS sender_name, 
			receiver.account_name AS receiver_name, 
			t.amount, 
			a.asset_name AS unit, 
			GROUP_CONCAT(
					CASE 
							WHEN tg.category = 'MCC' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS MCC,
			GROUP_CONCAT(
					CASE 
							WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS tag_names,
			t.description,
			sender.account_owner AS snd_owner, 
			receiver.account_owner AS rec_owner,
			t.report
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
			a.asset_type = 'currency'
		GROUP BY 
			t.id, t.dateof, sender_name, receiver_name, t.amount, unit
		ORDER BY t.id;
	`;
}
function qAusgaben() {
	return `
		SELECT 
			t.id, 
			t.dateof, 
			sender.account_name AS sender_name, 
			receiver.account_name AS receiver_name, 
			t.amount, 
			a.asset_name AS unit, 
			GROUP_CONCAT(
					CASE 
							WHEN tg.category = 'MCC' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS MCC,
			GROUP_CONCAT(
					CASE 
							WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS tag_names,
			t.description,
			sender.account_owner AS snd_owner, 
			receiver.account_owner AS rec_owner,
			t.report
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
			receiver.account_owner = 'external' 
			AND sender.account_owner != 'internal' 
			AND a.asset_type = 'currency'
		GROUP BY 
			t.id, t.dateof, sender_name, receiver_name, t.amount, unit
		ORDER BY t.id;
	`;
}
function qEinnahmen() {
	return `
		SELECT 
			t.id, 
			t.dateof, 
			sender.account_name AS sender_name, 
			receiver.account_name AS receiver_name, 
			t.amount, 
			a.asset_name AS unit, 
			GROUP_CONCAT(
					CASE 
							WHEN tg.category = 'MCC' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS MCC,
			GROUP_CONCAT(
					CASE 
							WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
							ELSE NULL 
					END
			) AS tag_names,
			t.description,
			sender.account_owner AS snd_owner, 
			receiver.account_owner AS rec_owner,
			t.report
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
			sender.account_owner = 'external' 
			AND sender.account_owner != 'internal' 
			AND a.asset_type = 'currency'
		GROUP BY 
			t.id, t.dateof, sender_name, receiver_name, t.amount, unit
		ORDER BY t.id;
	`;
}
function qStocks(){
	return `
		SELECT 
			t.id, 
			t.dateof, 
			sender.account_name AS sender_name, 
			receiver.account_name AS receiver_name, 
			t.amount, 
			a.asset_name AS unit, 
			t.description,
			t.report,
			sender.account_owner AS snd_owner, 
			receiver.account_owner AS rec_owner
		FROM 
			transactions t
		JOIN 
			accounts sender ON t.sender = sender.id
		JOIN 
			accounts receiver ON t.receiver = receiver.id
		JOIN 
			assets a ON t.unit = a.id
		WHERE 
			a.asset_type = 'stock';
	`;
}
function qTTList() {
	return `
		SELECT 
			t.id, 
			t.dateof, 
			sender.account_name AS sender_name, 
			receiver.account_name AS receiver_name, 
			t.amount, 
			a.asset_name AS unit, 
			GROUP_CONCAT(
				CASE 
					WHEN tg.category = 'MCC' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS MCC,
			GROUP_CONCAT(
				CASE 
					WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS tag_names,
			t.description,
			t.report
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
function qTTCols() {
	let names = dbGetTagNames();

	let s = '';
	for (const name of names) { s += `MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}',\n`; }

	return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      GROUP_CONCAT(
        CASE 
          WHEN tg.category = 'MCC' THEN tg.tag_name 
          ELSE NULL 
        END
      ) AS MCC,
			t.description,
			${s}
			t.report
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
      t.id, t.dateof, sender_name, receiver_name, t.amount, unit
  `;
}








//#region testing
function qtest0(){
	return 	`
			SELECT
					t.id,
					t.dateof,
					sender.account_name AS sender_name,
					receiver.account_name AS receiver_name,
					t.amount,
					a.asset_name AS unit,
					GROUP_CONCAT(CASE WHEN tg.category = 'MCC' THEN tg.tag_name ELSE NULL END) AS MCC,
					GROUP_CONCAT(CASE WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) AS tag_names,
					t.description,
					t.report
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
					t.id, t.dateof, sender_name, receiver_name, t.amount, unit, t.description
			ORDER BY
					t.description DESC;
		`;
}


//#region unused
function qTT() {
	let recs = dbToList('select * from tags', false);
	//console.log(recs)
	let names = recs.map(x => x.tag_name);
	names = names.filter(x => !isNumber(x));
	//console.log(names);
	let s = '';
	for (const name of names) {
		s += `MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}'`;
		if (name != arrLast(names)) s += ',';
	}

	return `
    SELECT 
      t.id, 
      t.dateof, 
      sender.account_name AS sender_name, 
      receiver.account_name AS receiver_name, 
      t.amount, 
      a.asset_name AS unit, 
      GROUP_CONCAT(
        CASE 
          WHEN tg.category = 'MCC' THEN tg.tag_name 
          ELSE NULL 
        END
      ) AS MCC,
			t.description,
			${s}
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
			GROUP_CONCAT(
				CASE 
					WHEN tg.category = 'MCC' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS MCC,
			GROUP_CONCAT(
				CASE 
					WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS tag_names 
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
			GROUP_CONCAT(
				CASE 
					WHEN tg.category = 'MCC' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS MCC,
			GROUP_CONCAT(
				CASE 
					WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS tag_names 
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
			GROUP_CONCAT(
				CASE 
					WHEN tg.category = 'MCC' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS MCC,
			GROUP_CONCAT(
				CASE 
					WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS tag_names 
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
				GROUP_CONCAT(
					CASE 
						WHEN tg.category = 'MCC' THEN tg.tag_name 
						ELSE NULL 
					END
				) AS MCC,
				GROUP_CONCAT(
					CASE 
						WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
						ELSE NULL 
					END
				) AS tag_names 
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
			GROUP_CONCAT(
				CASE 
					WHEN tg.category = 'MCC' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS MCC,
			GROUP_CONCAT(
				CASE 
					WHEN tg.category <> 'MCC' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name 
					ELSE NULL 
				END
			) AS tag_names 
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
function qTags() { return 'select * from tags;'; }

//special queries
function qTablenames() { return `SELECT name FROM sqlite_master WHERE type='table';`; }

function qiTransactionTag(id, tag_id, report) {
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}
function qiReport() {
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}

//#endregion



