
function showNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	let dTop = mDom(dNav, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
	let centerflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let startflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let [l, m, r] = [mDom(dTop, startflex), mDom(dTop, centerflex), mDom(dTop, centerflex)];
	let dlogo = mDom(l, { fz:34 }, { html: `Omnifin` });
	let commands = {};
	commands.overview = menuCommand(l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	//commands.sql = menuCommand(l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);

	let db = mDom(dNav, { matop:12,maleft:128, gap: 10, className: 'centerflexV' },{id:'dButtons'}); 
	// mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('clear sorting', ()=>DA.info.sorting={}, db, {}, 'button', 'bSortFast');

	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	//nav.commands = commands;
	return {commands,dNav}
}
async function menuOpenOverview() {
	let side = UI.sidebar = mSidebar('dLeft',110);
	UI.d = mDom('dMain'); //, { className: 'section' });
	let gap = 5;

	UI.commands.showSchema = mCommand(side.d, 'showSchema', 'DB Structure',{}); mNewline(side.d, gap);mLinebreak(side.d, 10);
	UI.commands.translist = mCommand(side.d, 'translist', 'translist',{},{open:()=>showRecords(qTTList(),UI.d)}); mNewline(side.d, gap);
	UI.commands.transcols = mCommand(side.d, 'transcols', 'transcols',{},{open:()=>showRecords(qTTCols(),UI.d)}); mNewline(side.d, gap);
	mLinebreak(side.d, 10);
	UI.commands.reports = mCommand(side.d, 'reports', 'reports',{},{open:()=>showRecords('SELECT * from reports',UI.d)}); mNewline(side.d, gap);
	UI.commands.assets = mCommand(side.d, 'assets', 'assets',{},{open:()=>showRecords('SELECT * from assets',UI.d)}); mNewline(side.d, gap);
	UI.commands.tags = mCommand(side.d, 'tags', 'tags',{},{open:()=>showRecords('SELECT * from tags',UI.d)}); mNewline(side.d, gap);
	UI.commands.accounts = mCommand(side.d, 'accounts', 'accounts',{},{open:()=>showRecords('SELECT * from accounts',UI.d)}); mNewline(side.d, gap);
	UI.commands.statements = mCommand(side.d, 'statements', 'statements',{},{open:()=>showRecords('SELECT * from statements',UI.d)}); mNewline(side.d, gap);
	UI.commands.verifications = mCommand(side.d, 'verifications', 'verifications',{},{open:()=>showRecords('SELECT * from verifications',UI.d)}); mNewline(side.d, gap);
	UI.commands.tRevisions = mCommand(side.d, 'tRevisions', 'revisions',{},{open:()=>showRecords('SELECT * from revisions',UI.d)}); mNewline(side.d, gap);

	await onclickCommand(null, 'translist');
}
async function menuCloseOverview() { closeLeftSidebar(); mClear('dMain'); M.qHistory = []; }







