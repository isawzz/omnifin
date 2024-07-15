function tOnClickHeaders(t, q, dParent, info) {
	let headers = t.querySelectorAll('th.sortable');
	headers.forEach(header => {
		header.addEventListener('click', () => {
			const index = header.getAttribute('dataIndex');
			const order = header.classList.contains('asc') ? 'desc' : 'asc';
			sortTableByColumn(t, index, order);
			headers.forEach(h => h.classList.remove('asc', 'desc'));
			header.classList.add(order);
		});
	});
}
function sortTableByColumn(table, columnIndex, order) {
	const tbody = table.querySelector('tbody');
	const rows = Array.from(tbody.querySelectorAll('tr'));
	console.log(columnIndex)

	rows.sort((a, b) => {
		const cellA = a.children[columnIndex].innerText.toLowerCase();
		const cellB = b.children[columnIndex].innerText.toLowerCase();

		if (!isNaN(cellA) && !isNaN(cellB)) {
			return order === 'asc' ? cellA - cellB : cellB - cellA;
		}

		return order === 'asc' 
			? cellA.localeCompare(cellB) 
			: cellB.localeCompare(cellA);
	});

	rows.forEach(row => tbody.appendChild(row));
}









