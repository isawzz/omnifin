function addTagAndReport(transactionId, tagName, reportCategory='default') {
  // Insert a new report with default values
	let db=DB;
  db.run(`
    INSERT INTO reports (category, associated_account, description)
    VALUES (?, NULL, '')
  `, [reportCategory]);

  // Get the last inserted report ID
  const reportId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];

  // Check if the tag already exists
  const tagResult = db.exec(`
    SELECT id FROM tags WHERE tag_name = ?
  `, [tagName]);

  let tagId;

  if (tagResult.length > 0) {
    // Tag already exists, get the tag ID
    tagId = tagResult[0].values[0][0];
  } else {
    // Insert the tag
    db.run(`
      INSERT INTO tags (tag_name, category, description, report)
      VALUES (?, '', '', ?)
    `, [tagName, reportId]);

    // Get the last inserted tag ID
    tagId = db.exec("SELECT last_insert_rowid() AS id;")[0].values[0][0];
  }

  // Associate the tag with the transaction
  db.run(`
    INSERT INTO transaction_tags (id, tag_id, report)
    VALUES (?, ?, ?)
  `, [transactionId, tagId, reportId]);

  // Save the database
  const data = db.export();
  localStorage.setItem('database', JSON.stringify(Array.from(data)));

  //alert("Tag and report added successfully.");
}

function mist() {
	let ops = ['contains', '==', '!=', '<=', '>=', '<', '>'];
	let dSelectOp = uiTypeSelect(ops, dParent, styles, opts);

	let inputs = [];
	let formStyles = opts.showLabels ? { wmin: 400, padding: 10, bg: 'white', fg: 'black' } : {};
	let form = mDom(dParent, formStyles, { tag: 'form', method: null, action: "javascript:void(0)" })
	for (const k in dict) {
		let [content, val] = [k, dict[k]];
		if (opts.showLabels) mDom(form, {}, { html: content });
		let inp = mDom(form, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', value: val, placeholder: `<enter ${content}>` });
		inputs.push({ name: content, inp: inp });
		mNewline(form)
	}
	mDom(form, { display: 'none' }, { tag: 'input', type: 'submit' });
	form.onsubmit = ev => {
		ev.preventDefault();
		let di = {};
		inputs.map(x => di[x.name] = x.inp.value);
		resolve(di);
	}
	return form;
}












