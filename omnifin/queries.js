
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
function qTranstags(){
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
function qTransmultitag(){
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
function qLimit20(){
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
function qTags() { return 'select * from tags;'; }

function dbGetSampleQuery(){
	let qs = [qTransactions,qTransFlex,qTranstags,qTransmultitag,qLimit20,qTags,];
	let q=rChoose(qs)();
	q=replaceAllSpecialChars(q,'\t',' ');
	q=replaceAll(q,'  ',' ');
	//q=splitOnUpperCaseWord(q);
	return q.trim();
}

//special queries
function qTablenames(){ return `SELECT name FROM sqlite_master WHERE type='table';`; }

function qiTransactionTag(id,tag_id,report){
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}





