
function _dbQuery(db, q, dParent) {
	try {
		const result = db.exec(q);
		// console.log('result',result)
		// return result;
		const output = result.map(({ columns, values }) => {
			return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
		}).join('\n\n');
		if (isdef(dParent)){
			dParent = toElem(dParent);
			mClear(dParent)
			dParent.textContent = output || 'Query executed successfully.';
		}
		return output;
	} catch (error) {
		dParent.textContent = 'Error executing SQL: ' + error.message;
		return null;
	}

}

async function onclickSql(){console.log('hallo')}

//stubs
async function updateExtra(){}



// function menuCommand(dParent, menuKey, key, html, open, close) {
// 	let cmd = mCommand(dParent, key, html, { open, close });
// 	let a = iDiv(cmd);
// 	a.setAttribute('key', `${menuKey}_${key}`);
// 	a.onclick = onclickMenu;
// 	cmd.menuKey = menuKey;
// 	return cmd;
// }
// function onclickMenu(ev) {
// 	let keys = evToAttr(ev, 'key');
// 	let [menuKey, cmdKey] = keys.split('_');
// 	let menu = UI[menuKey];
// 	switchToMenu(menu, cmdKey);
// }
// async function switchToMenu(menu, key) {
// 	menuCloseCurrent(menu); console.log('switchToMenu')
// 	Menu = { key }; localStorage.setItem('menu', key);
// 	await menuOpen(menu, key);
// }
// async function menuOpen(menu, key, defaultKey='settings') {
// 	let cmd = menu.commands[key]; console.log(cmd)
// 	if (nundef(cmd)) { console.log('abandon', key); await switchToMainMenu(defaultKey); return; }
// 	menu.cur = key;
// 	mClass(iDiv(cmd), 'activeLink'); //console.log('cmd',cmd)
// 	//if (isdef(mBy('dExtra'))) await updateExtra();
// 	console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
// 	console.log('WIE BITTE???')
// 	//await menuOpenSql();
// 	await cmd.open();
// }
