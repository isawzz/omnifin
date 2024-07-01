async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar();
	let gap = 5;
	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure'); mNewline(side.d, gap);
	UI.commands.transactions = mCommand(side.d, 'transactions', 'transactions'); mNewline(side.d, gap);
	UI.commands.flex = mCommand(side.d, 'flex', 'flex-perks'); mNewline(side.d, gap);
}
function onclickShowSchema() {
	let res = dbq(`SELECT sql FROM sqlite_master WHERE type='table';`);
	showRawInMain(res)
}
function onclickFlex() { showTableInMain(getTransactionsFlexperks()); }
function onclickTransactions() { showTableInMain(getTransactionsSelected()); }


async function menuOpenSql() {
	let side = UI.sidebar = mSidebar();

	let d = mDom('dMain', { w: window.innerWidth - side.wmin - 20, box: true, padding: 10 });

	let ta = UI.ta = mDom(d, { 'white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { tag: 'textarea', id: 'taSql', rows: 4, value: 'select * from transactions' });
	ta.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onclickExecute();
		}
	});
}
async function onclickExecute() {
	let res = dbq(UI.ta.value);
	console.log(res)
}

