
async function clearFilters() {
	let q = DA.info.q;

	let clauses = sqlSplitClauses(q);
	delete clauses.WHERE;
	delete clauses.HAVING;

	let qnew = sqlComposeClauses(clauses);

	showRecords(qnew, UI.d);
}




