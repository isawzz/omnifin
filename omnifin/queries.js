

function qTransactions() {
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
function qTransactionsSelected() {
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
function qTransactionsFlexperks() {
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
function qTransactions10() {
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
function qTags() { return 'select * from tags;'; }
function qTablenames(){ return `SELECT name FROM sqlite_master WHERE type='table';`; }
function qTransactionTags(){
	return `select * from transaction_tags where tag_id = '51'`;
}
function qTaggedTransactions(){
	return `SELECT * FROM transactions WHERE id IN (SELECT id FROM transaction_tags);`
}
function qTaggedTransactionsLimit10(){
	return `SELECT * FROM transactions WHERE id IN (SELECT id FROM transaction_tags) limit 10;`
}
function qiTransactionTag(id,tag_id,report){
	return `INSERT INTO transaction_tags (id, tag_id, report) VALUES (${id}, ${tag_id}, ${report});`;
}






