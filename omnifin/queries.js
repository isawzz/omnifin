

function qTT() {
	let recs = dbToList('select * from tags',false);
	//console.log(recs)
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));
	//console.log(names);
	let s='';
	for(const name of names){
		s+=`MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}'`;
		if (name != arrLast(names)) s+=',';
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
			t.description
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
	let recs = dbToList('select * from tags',false);
	//console.log(recs)
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));
	//console.log(names);
	let s='';
	for(const name of names){
		s+=`MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}'`;
		if (name != arrLast(names)) s+=',';
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
			${s},
			t.description
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
function qTTColsSorted(sorting) {
	if (nundef(sorting)) sorting=DA.info.sorting;
	let recs = dbToList('select * from tags',false);
	//console.log(recs)
	let names = recs.map(x=>x.tag_name);
	names = names.filter(x=>!isNumber(x));

	let keysFirst = Object.keys(sorting).filter(x=>isdef(sorting[x]));
	names = keysFirst.concat(arrMinus(names,keysFirst));

	//console.log(names);
	let s='';
	for(const name of names){
		s+=`MAX(CASE WHEN tg.tag_name = '${name}' THEN 'X' ELSE '' END) AS '${name}'`;
		if (name != arrLast(names)) s+=',';
	}

  let q = `
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
			${s},
			t.description
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
		//separate non-tag_names from tag_names
		//sort by tagNames first
		//then by non-tag_names as sorting is set

	q+= `ORDER BY ${keysFirst.map(x => x + ' DESC').join(', ')};`;
	return q;
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

function dbGetSampleQuery() {
	let qs = [qTransactions, qTransFlex, qTranstags, qTransmultitag, qLimit20, qTags,];
	let q = rChoose(qs)();
	q = replaceAllSpecialChars(q, '\t', ' ');
	q = replaceAll(q, '  ', ' ');
	//q=splitOnUpperCaseWord(q);
	return q.trim();
}

//special queries
function qTablenames() { return `SELECT name FROM sqlite_master WHERE type='table';`; }

function qiTransactionTag(id, tag_id, report) {
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}
function qiReport() {
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}





