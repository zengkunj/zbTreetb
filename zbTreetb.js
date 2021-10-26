var zbTagmaxn = 0;
/** zbTreetb 树-20211018
 * @param {Object} opts 选项 
 */
function zbTreetb(opts) {
	"use strict";
	if (!opts.dom) return;
	/** 领域 */
	var dom = document.getElementById(opts.dom);
	if (dom == null) return;

	/** 标记 */
	zbTagmaxn++;
	var tag = "ttb"+ zbTagmaxn;
	/** 主区 */
	var maind;
	maind = document.createElement("div");
	dom.appendChild(maind);

	var isTree = false;
	var idcol = "id";
	var pidcol = "pid";
	var titcol = "title";
	if (opts.tree) {
		isTree = true;
		if (opts.idCol) idcol = opts.idCol;
		if (opts.pidCol) pidcol = opts.pidCol;
		if (opts.titleCol) titcol = opts.titleCol;
	}

	var isTab = false;
	if (opts.tab) isTab = true;

	/** 节点数组 */
	var nodes = [];
	/** 字段定义集 */
	var flds;
	if (isTab) {
		if (!opts.flds) return;
		flds = opts.flds;
		if (!Array.isArray(flds)) return;
		setTb();
	}

	/** 在编行标识 */
	var edRowid = "";
	var mainTb, fixedTb;

	/** 表头 */
	function setTh(isMain) {
		var trobj, th, chk;
		trobj = document.createElement("tr");
		if (isTree) {
			th = document.createElement("th");
			th.style.width = "150px";
			th.innerHTML = "";
			if (isMain) {
				th.onmousedown = onDownCols;
				th.onmousemove = onMoveCols;
				th.onmouseup = onUpCols;
			}
			trobj.appendChild(th);
		}
		if (!isTree && opts.chkbox) {
			if (isMain) {
			th = document.createElement("th");
			th.style.width = "22px";
			trobj.appendChild(th);
			chk = document.createElement("input");
			chk.id = tag + "-allbox";
			chk.type = "checkbox";
			chk.value = "";
			chk.onclick = onChkAll;
			th.appendChild(chk);				
			} else {
				th = document.createElement("th");
				th.style.width = "22px";
				th.innerHTML = "&nbsp;";
				trobj.appendChild(th);
			}

		}
		for (var i = 0; i < flds.length; i++) {
			if (i == 0 && flds[i].hide) { continue; }	// 隐藏id
			th = document.createElement("th");
			if (flds[i].label) th.innerHTML = flds[i].label;
			else th.innerHTML = "";
			if (flds[i].width) th.style.width = flds[i].width;
			else th.style.width = "60px";
			if (isMain) {
				th.onmousedown = onDownCols;
				th.onmousemove = onMoveCols;
				th.onmouseup = onUpCols;
			}
			trobj.appendChild(th);
		}
		if (opts.editable) {	// 取消列
			th = document.createElement("th");
			th.style.width = "32px";
			th.innerHTML = "";
			trobj.appendChild(th);
		}

		return trobj;
	}

	/** 初始表 */
	function setTb() {
		mainTb = document.createElement("table");
		maind.appendChild(mainTb);

		var i, eTr, eTd, chk, ePut, e;
		eTr = setTh(true);
		mainTb.appendChild(eTr);
		// 输入行 tag-0-tr
		if (opts.editable) {
			eTr = document.createElement("tr");
			eTr.id = tag + "-0-tr";
			eTr.classList.add("edit-at");
			eTr.style.display = "none";
			mainTb.appendChild(eTr);
			if (isTree) {
				eTd = document.createElement("td");
				eTd.id = tag + "-0-tree";
				eTd.innerHTML = "";
				eTr.appendChild(eTd);
			}
			if (!isTree && opts.chkbox) {
				eTd = document.createElement("td");
				eTr.appendChild(eTd);
				chk = document.createElement("input");
				chk.id = tag + "-0-chk";
				chk.type = "checkbox";
				chk.value = "";
				eTd.appendChild(chk);
			}
			ePut = document.createElement("input");
			ePut.id = flds[0].fld;
			ePut.name = flds[0].fld;
			ePut.type = "hidden";
			ePut.value = "";
			eTr.appendChild(ePut);
			if (!flds[0].hide) {
				eTd = document.createElement("td");
				eTd.id = tag + "-0-0";
				eTd.className = "ro";
				eTr.appendChild(eTd);
			}
			for (i = 1; i < flds.length; i++) {
				eTd = document.createElement("td");
				eTd.id = tag + "-0-" + i;
				eTd.onclick = focusTd;
				if (!flds[i].fld) {
					eTr.appendChild(eTd);
					continue;
				}
				if (flds[i].ro) {
					eTd.className = "ro";
					eTd.innerHTML = "";
					eTr.appendChild(eTd);
					continue;
				}
				if (flds[i].bit) {
					// 开关式样
					var eSw = document.createElement("div");
					eSw.className="sw-chk";
					chk = document.createElement("input");
					chk.id = flds[i].fld;
					chk.name = flds[i].fld;
					chk.type = "checkbox";
					chk.classList.add("sw-chk");
					eSw.appendChild(chk);
					var eLb = document.createElement("label");
					eLb.setAttribute("for", flds[i].fld);
					eLb.classList.add("sw-chk");
					var eTx = document.createElement("span");
					if(flds[i].tx0) eTx.innerHTML= flds[i].tx0;
					else eTx.innerHTML= " ";
					eLb.appendChild(eTx);
					eTx = document.createElement("span");
					if(flds[i].tx1) eTx.innerHTML= flds[i].tx1;
					else eTx.innerHTML= "√";
					eLb.appendChild(eTx);
					eSw.appendChild(eLb);
					eTd.appendChild(eSw);
				}
				else if (flds[i].lis && Object.prototype.toString.call(flds[i].lis)=== '[object Array]') {
					var dSel = document.createElement("select");
					dSel.id = flds[i].fld;
					dSel.name = flds[i].fld;
					var fldlis = flds[i].lis;
					for (var j = 0; j < fldlis.length; j++) {
						if (fldlis[j].tx) {
							if (fldlis[j].val) dSel.options.add(new Option(fldlis[j].tx,fldlis[j].val));
							else dSel.options.add(new Option(fldlis[j].tx,fldlis[j].tx));
						}
					}
					eTd.appendChild(dSel);
				}
				else {
					ePut = document.createElement("input");
					ePut.id = flds[i].fld;
					ePut.name = flds[i].fld;
					ePut.type = "text";
					if (flds[i].width) ePut.style.width = flds[i].width;
					ePut.value = "";
					eTd.appendChild(ePut);
				}
				eTr.appendChild(eTd);
			}
			// 操作列
			eTd = document.createElement("td");
			eTr.appendChild(eTd);
			var eBtn = document.createElement("button");
			eBtn.type = "button";
			eBtn.onclick = onBtnsave;
			eBtn.title = "保存";
			eBtn.innerHTML = "↩";
			eTd.appendChild(eBtn);
			e = document.createElement("span");
			e.innerHTML = "&nbsp;";
			eTd.appendChild(e);
			eBtn = document.createElement("button");
			eBtn.type = "button";
			eBtn.title = "放弃";
			eBtn.onclick = onCancel;
			eBtn.innerHTML = "↺";
			eTd.appendChild(eBtn);
			// 空行 tag-empty
			eTr = document.createElement("tr");
			eTr.id = tag + "-empty";
			mainTb.appendChild(eTr);
			if (isTree) {
				eTd = document.createElement("td");
				eTd.innerHTML = "";
				eTr.appendChild(eTd);
			}
			if (!isTree && opts.chkbox) {
				eTd = document.createElement("td");
				eTd.innerHTML = "";
				eTr.appendChild(eTd);
			}
			if (!flds[0].hide) {
				eTd = document.createElement("td");
				eTd.id = tag + "-empty-0";
				eTd.className = "ro";
				eTr.appendChild(eTd);
			}
			for (i = 1; i < flds.length; i++) {
				eTd = document.createElement("td");
				eTd.id = tag + "-empty-" + i;
				if (flds[i].fld) {
					if (!flds[i].ro) eTd.onclick = onTapin;
				}
				eTd.innerHTML = "&nbsp;";
				eTr.appendChild(eTd);
			}
			// 空行操作列
			eTd = document.createElement("td");
			eTd.innerHTML = "&nbsp;";
			eTr.appendChild(eTd);

		}	// 输入行
	}

	/** 固定标题, 垂直滚动
	 * @param {String} height 主区域高度px, 比如："200px"
	 */
	this.fixTh = function(height) {
		fixedTb = document.createElement("table");
		fixedTb.classList.add("fix-th");
		fixedTb.style.visibility = "hidden";
		var eTr = setTh(false);
		fixedTb.appendChild(eTr);
		dom.style.height = height;
		dom.style.position = "relative";
		maind.className = "scrolltb";
		maind.style.height = height;
		maind.onscroll = onScrolly;
		dom.appendChild(fixedTb);
	}

	/** 加入树
	 * @param {Array[Object]} items 条目数组
	 * @param {String} pid 嵌入的父id */
	this.addItems = function (items, pid) {	
		if (!Array.isArray(items)) return;
		var trobj;
		if (!isTree) {
			for (var i = 0; i < items.length; i++) {
				trobj = newDatarow(items[i]);
				if (opts.editable) mainTb.insertBefore(trobj.tr, document.getElementById(tag + "-empty"));
				else mainTb.appendChild(trobj.tr);
			}
			return;
		}
		/** 工作栈 */
		var nowStk = [];
		/** 工作层 */
		var lev = 0;
		/** 新行号 */
		var newnum = 0;

		var i, eFold;
		var embed = false; // 嵌入否
		if (pid) {	// 指定父id
		for (i = 0; i < nodes.length; i++) {
		if (nodes[i].id == pid) {	// 找到父id
			var pnum = i;	// 父行号
			var pnode = nodes[i];
			for (var j = 0; j < pnode.pref.length; j++) {
				nowStk.push({open:true, lined: pnode.pref[j].lined });
			}	 // open只用到顶部一个

			newnum = subafter(pnum);
			var lsn = lastson(pnum);	// 幺儿行号
			if (lsn > 0) {	// 有儿
				subOp(lsn, "link");	// 幺儿分支连线
				openRow(pnum);
			}
			else {	// 新儿
				eFold = pnode.pref[pnode.pref.length - 1].esp;
				if (eFold.className == "line3") eFold.className = "open0";
				if (eFold.className == "line4") eFold.className = "open1";
				eFold.onclick = onFold;
				pnode.isFather = true;
			}
			lev = pnode.lev + 1;
			embed = true;	// 是嵌入
			break;
		}
		}
		}

		var itemStk = [];
		if (embed) {	// 嵌入,指向pid或=="0"为起始条目
			for (i = items.length - 1; i >= 0; i--) {
				if (items[i][pidcol] == pid || items[i][pidcol] == "0") {
					items[i].lev = lev + 1;
					itemStk.push(items[i]);
				}
			}
		}
		else {
			for (i = items.length - 1; i >= 0; i--) {
				if (items[i][pidcol] == "0") {
					items[i].lev = 0;
					itemStk.push(items[i]);
				}
			}
		}

		var open = true;
		var hidelev = lev;
		while (itemStk.length > 0) {
			var item = itemStk.pop();
			var nid = item[idcol];
			var havAft = false;	// 有弟否
			if (itemStk.length > 0) {
				if (item.lev == itemStk[itemStk.length - 1].lev) {
					havAft = true;
				}
			}

			while (item.lev < lev) {	// 回朔工作栈到当前层
				nowStk.pop();
				lev--;
			}
			if (lev <= hidelev && nowStk.length > 0) {
				open = nowStk[nowStk.length - 1].open;
			}
			if (lev == 0) {
				open = true;
				hidelev = 0;
			}

			// 子节点倒序压栈
			var isFather = false;
			for (i = items.length - 1; i >= 0; i--) {
				if (items[i][pidcol] == nid) {
					items[i].lev = lev + 1;
					itemStk.push(items[i]);
					isFather = true;
				}
			}

			//节点 rowd:行域; pref:行前缀栈:esp元素,lined 连线否
			var node = { id: nid, lev: lev, rowd: null, isFather: isFather, open: open, pref: [] };

			// 节点
			var pe, rowdm, dNode;
			if (isTab) {
				pe = mainTb;
				trobj = newDatarow(item);
				rowdm = trobj.tr;
				dNode = trobj.treetd;
			}	else {
				pe = maind;
				rowdm = document.createElement("div");
				rowdm.id = tag +"-"+ nid +"-nd";
				rowdm.className = "nodediv";
				dNode = rowdm;
			}

			if (!open) rowdm.style.display = "none";
			if (newnum < nodes.length) pe.insertBefore(rowdm, nodes[newnum].rowd);
			else {
				if (opts.editable) pe.insertBefore(rowdm, document.getElementById(tag + "-empty"));
				else pe.appendChild(rowdm);
			}
			node.rowd = rowdm;

			// 前缀线
			for (i = 0; i < nowStk.length; i++) {
				var eLine = document.createElement("span");
				if (nowStk[i].lined) eLine.className = "line1";
				else eLine.className = "line0";
				dNode.appendChild(eLine);
				node.pref.push({ esp: eLine, lined: nowStk[i].lined });
			}

			// 折叠
			eFold = document.createElement("span");
			eFold.id = tag + "-fold-" + nid;
			if (isFather) { // 折叠
				if (item.open) node.open = true;
				else node.open = false;
				if (item.open) {
					if (havAft) eFold.className = "open0";
					else eFold.className = "open1";
				}
				else {
					if (havAft) eFold.className = "off0";
					else eFold.className = "off1";
				}
				dNode.appendChild(eFold);
				eFold.onclick = onFold;
			}
			else { // 叶
				node.open = true;
				if (havAft) eFold.className = "line3";
				else eFold.className = "line4";
				dNode.appendChild(eFold);
			};
			node.pref.push({ esp: eFold, lined: havAft });

			if (open && !node.open) {
				open = false;
				hidelev = lev;
			}

			if (opts.chkbox) {
				var chk = document.createElement("input"); // 选取
				chk.id = tag + "-chk-" + nid;
				chk.type = "checkbox";
				chk.name = tag + "-box";
				chk.value = nid;
				if (item.chked) chk.checked = "checked";
				chk.onclick = onChk;			
				dNode.appendChild(chk);
			}

			var eIcon = document.createElement("span"); // 图标
			if (isFather) eIcon.className = "icon1";
			else eIcon.className = "icon3";
			dNode.appendChild(eIcon);

			var eTit = document.createElement("span"); // 标题
			eTit.id = tag +"-ti-"+ nid;
			eTit.innerHTML = item[titcol];
			eTit.className = "nodename";

			if (item.link) {
				var eLink = document.createElement("a");
				eLink.href = item.link;
				dNode.appendChild(eLink);
				eLink.appendChild(eTit);
			}
			if (!item.dis) eTit.onclick = onTapnode;
			dNode.appendChild(eTit);

			if (opts.addon) {	// 附加项
				var e = document.createElement("span");
				e.id = tag + "-aon-" + nid;
				e.onclick = addon;
				e.innerHTML = "...";
				e.className = "addon";
				dNode.appendChild(e);
			}

			if (isFather) {	// 新层工作栈
				lev++;
				nowStk.push({open:node.open, lined: havAft });
			};
			nodes.splice(newnum, 0, node);
			newnum = newnum + 1;
		} // 树
	}

	/** 幺儿行号 */
	function lastson(n) {
		var lsn = 0; 
		var len = nodes.length;
		var lev = nodes[n].lev;
		n++;
		while (n < len && nodes[n].lev > lev) {
			if (nodes[n].lev == lev + 1) lsn = n;
			n++; 
		}
		return lsn;
	}

	/** 分支完后-行号 */
	function subafter(n) {
		var len = nodes.length;
		var lev = nodes[n].lev;
		n++;
		while (n < len && nodes[n].lev > lev) {
			n++;
		} 
		return n;
	}

	/** 清空表数据 */
	this.empty = function () {
		if (!isTab) return;

		var i = 0;
		while (i < mainTb.rows.length) {
			var rid = parseInt(mainTb.rows[i].id.split('-')[1]);
			if (rid > 0) {
				mainTb.removeChild(mainTb.rows[i]);
			}
			else {
				i++;
			}
		}
		if (isTree) {
			nodes = [];
		}
	}

	/** 删除分支
	 * @param {String} nodeid 节点id */
	this.delSub = function(nodeid) {
		var num = getRownum(nodeid);
		if (num < 0) return;

		var len = nodes.length;
		var lev = nodes[num].lev;

		// 找弟
		var n2 = num + 1;
		while (n2 < len && nodes[n2].lev > lev) {
			n2++;
		}
		// 出界或超出分支, 无弟, >0, 找兄 
		if ((n2 == len || nodes[n2].lev < lev) && num > 0) {
			var n3 = num - 1;
			while (n3 > 0 && nodes[n3].lev > lev) {
				n3--;
			}
			if (nodes[n3].lev==lev) {	// 找到兄
				subOp(n3, "unlink");
			}
			else {	// 无弟无兄，独子
				var nd = nodes[n3];	// 其父
				nd.isFather = false;
				var efold = nd.pref[nd.pref.length - 1].esp;
				if (efold.className == "open0" || efold.className == "off0") efold.className = "line3";
				else if (efold.className == "open1" || efold.className == "off1") efold.className = "line4";
				efold.onclick = null;
			}
		}

		// 删除分支元素和节点
		var pe;
		if (isTab) {
			pe = mainTb;
		} else {
			pe = maind;
		}

		pe.removeChild(nodes[num].rowd);
		var n4 = num + 1;
		while (n4 < len && nodes[n4].lev > lev) {
			pe.removeChild(nodes[n4].rowd);
			n4++;
		}
		nodes.splice(num, n4 - num);
	}

	/** 定位到节点
	 * @param {String} rowid 行id	 */
	this.locate = function (rowid) {
		var num = getRownum(rowid);
		if (num < 0) return;
		var node = nodes[num];
		if (hotRow) hotRow.classList.remove("hotrow");
		hotRow = node.rowd;
		hotRow.classList.add("hotrow");

		var lev = node.lev;
		if (lev == 0) return;	// 0层 不需要再打开
		if (num == 0) return; // 出界
		num--;
		while (num > 0 && nodes[num].lev > 0) {
			var nd = nodes[num];
			if (nd.lev < lev) {	// 回溯到父, 打开状态
				var efold = nd.pref[nd.pref.length - 1].esp;
				if (efold.className == "off0") efold.className = "open0";
				else if (efold.className == "off1") efold.className = "open1";
				nd.open = true;
				lev = nd.lev;
			}
			num--;
		}
		openRow(num);	// 一次打开
	}

	/** 禁用的节点 */
	var disRow;
	/** 禁用当前单节点 */
	this.disOne = function (){
		if (disRow || !hotRow) return;
		var arrstr = hotRow.id.split("-");
		if (arrstr.length != 3) return;
		var rid = arrstr[1];
		var node = getNode(rid);
		if (!node) return;
		node.dis = true;

		disRow = hotRow;
		hotRow.classList.remove("hotrow");
		disRow.classList.add("disrow");
		hotRow = null;
	}

	/** 禁用当前分支 */
	this.disSub = function () {
		if (disRow || !hotRow) return;
		var arrstr = hotRow.id.split("-");
		if (arrstr.length != 3) return;
		var rid = arrstr[1];
		var node = getNode(rid);
		if (!node) return;
		node.dis = true;

		var num = getRownum(rid);
		subOp(num, "dis");

		disRow = hotRow;
		hotRow.classList.remove("hotrow");
		disRow.classList.add("disrow");
		hotRow = null;
	}

	/** 取消禁用 */
	this.undis = function () {
		if (!disRow) return;
		var arrstr = disRow.id.split("-");
		if (arrstr.length != 3) return;
		var rid = arrstr[1];
		var num = getRownum(rid);
		subOp(num, "undis");
		disRow = null;
	}

	/** 勾选了吗
	 * @param {String} rowid 节点id */
	this.chked = function (rowid) {
		var nbox = document.getElementById(tag + "-chk-" + rowid);
		if (nbox) {
			if (nbox.checked) return true;
		}
		return false;
	}

	/** 添加数据行 */
	function newDatarow(dataRow) {
		var eTr = document.createElement("tr");
		var rowid = dataRow["" + flds[0].fld];
		eTr.id = tag +"-"+ rowid +"-tr";

		var eTd;
		var trobj = {};
		trobj.tr = eTr;
		trobj.treetd = null;
		if (isTree) {
			eTd = document.createElement("td");
			eTd.id = tag +"-"+ rowid +"-tree";
			eTr.appendChild(eTd);
			trobj.treetd = eTd;
		}
		if (!isTree && opts.chkbox) {
			eTd = document.createElement("td");
			eTd.innerHTML = "";
			eTr.appendChild(eTd);
			var chk = document.createElement("input");
			chk.id = tag +"-chk-"+ rowid;
			chk.type = "checkbox";
			chk.name = tag +"-box";
			chk.value = rowid;
			chk.onclick = onChk;
			eTd.appendChild(chk);
		}
		for (var i = 0; i < flds.length; i++) {
			if (i == 0 && flds[0].hide) continue;
			eTd = document.createElement("td");
			eTd.id = tag +"-"+ rowid +"-"+ i;	// 标识+列号
			if (flds[i].fld && opts.editable) {
				if (flds[i].bit) eTd.className = "tx-ctr";
				if (flds[i].ro) {	// 只读
					eTd.classList.add("ro");
					eTd.onclick = onTaptr;
				}
				else eTd.onclick = onTapin;
			}
			if (i == 0) {
				eTd.classList.add("ro");
				eTd.classList.add("tx-rt");
				if (opts.editable) eTd.onclick = onTaptr;	// 编辑表，从标识命中行
			}
			if (flds[i].fld) {
				var RowFldData = dataRow["" + flds[i].fld];
				setTd(flds[i], eTd, RowFldData);
			}
			else { eTd.innerHTML = ""; }
			eTr.appendChild(eTd);
		}
		if (opts.editable) {	// 操作列
			eTd = document.createElement("td");
			eTd.id = tag +"-"+ rowid +"-op";
			eTd.onclick = onTaptr;
			eTd.innerHTML = "&nbsp;";
			eTr.appendChild(eTd);
		}
		return trobj;
	}

	/** 设置单元值
	 * @param fld 字段定义
	 * @param td 单元格 
	 * @param val 值 */
	function setTd(fld, td, val) {
		if (fld.bit) {	// flds[i]
			if (val==0 || val==false) {
				if (fld.tx0) td.innerHTML = fld.tx0;
				else td.innerHTML = " ";
			}
			else if (val==1 || val==true) {
				if(fld.tx1) td.innerHTML = fld.tx1;
				else td.innerHTML = "√";
			}
		}
		else if (fld.lis && Object.prototype.toString.call(fld.lis) === '[object Array]') {
			if (val) td.innerHTML = val;
			else td.innerHTML = " ";
			for (var i = 0; i < fld.lis.length; i++) {
				if (fld.lis[i].val == val) {
					td.innerHTML = fld.lis[i].tx;
					break;
				}
			}
		}
		else {
			if (val) td.innerHTML = val;
			else td.innerHTML = " ";
		}
	}

	/** 获取单元值
	 * @param fld 字段
	 * @param td 单元格
	 * @return 值 */
	function getTdval(fld, td) {
		var val;
		var tdtx = trim(td.innerHTML);
		if (fld.bit) {	// 布尔格式
			if (fld.tx1) {	// 指定内容
				if (tdtx == fld.tx1) val = true;
				else val = false;
			}
			else {
				if (tdtx == "√") val = true;
				else val = false;
			}
		}
		else if (fld.lis && Array.isArray(fld.lis)) {
			val = 0;
			for (var i = 0; i < fld.lis.length; i++) {
				if (fld.lis[i].tx == tdtx) {
					val = fld.lis[i].val;
					break;
				}
			}
		}
		else {
			val = tdtx;
		}
		return val;
	}

	/** 获取行数据
	 * @param rowid 行标识 */
	this.getRowdata = function(rowid) {
		var data = {};
		data[flds[0].fld] = rowid;
		for (var i = 1; i < flds.length; i++) {
			if (flds[i].fld) {
				var eTd = document.getElementById(tag + "-" + rowid + "-" + i);
				var dd = getTdval(flds[i], eTd);
				data[flds[i].fld] = dd;
			}
		}

		return data;
	}

	function onTapin() {
		var tdid = this.id;
		if (hotRow) {
			hotRow.classList.remove("hotrow"); 
			hotRow = null;
		}
		if (edRowid != "") {
			if (changed()) {
				saveRow();
				editRow(tdid);
			}
			else {
				editRow(tdid);
			}
		}
		else {
			editRow(tdid);
		}
	}

	/** 编辑行
	 * @param tdid 进入的单元格 */
	function editRow(tdid) {	// 编辑，从表格导入输入框
		var strs = tdid.split('-');
		if (strs.length < 3) return;
		if (strs[0] != tag) return;
		var rowid = strs[1];
		var fld = strs[2];
		var i;
		if (rowid == "empty") {	// 空行
			if (isTree) {
				document.getElementById(tag + "-0-tree").innerHTML = "&nbsp;"
			}
			if (!flds[0].hide) document.getElementById(tag + "-0-0").innerHTML = "&nbsp;"; // id列td
			document.getElementById(flds[0].fld).value = "";
			for (i = 1; i < flds.length; i++) {
				if (flds[i].fld && flds[i].ro) { // 只读列
					document.getElementById(tag + "-0-" + i).innerHTML = " ";
				}
				else {
					document.getElementById(flds[i].fld).value = "";
					if (flds[i].bit) {
						document.getElementById(flds[i].fld).checked = false;
					}
				}
			}
			mainTb.insertBefore(document.getElementById(tag + "-0-tr"), document.getElementById(tag + "-empty"));
			document.getElementById(tag + "-0-tr").style.display = "";
		}
		else {
			if (isTree) {
				document.getElementById(tag + "-0-tree").innerHTML 
					= document.getElementById(tag +"-"+ rowid +"-tree").innerHTML;
			}
			if (!flds[0].hide) document.getElementById(tag + "-0-0").innerHTML = rowid;	// id列
			document.getElementById(flds[0].fld).value = rowid
			for (i = 1; i < flds.length; i++) {
				var eTd = document.getElementById(tag +"-"+ rowid +"-"+ i);
				if (flds[i].fld && !flds[i].ro) {
					var tdd = getTdval(flds[i], eTd);
					if (flds[i].bit) {
						var eChk = document.getElementById(flds[i].fld);
						if (tdd == true) { tdd = 1; eChk.checked = true;}
						else { tdd = 0; eChk.checked = false;}
					}
					document.getElementById(flds[i].fld).value = tdd; 
				}
				else {	// 放入本行
					document.getElementById(tag + "-0-" + i).innerHTML = eTd.innerHTML;
				}
			}
			mainTb.insertBefore(document.getElementById(tag + "-0-tr"), document.getElementById(tag +"-"+ rowid +"-tr"));
			document.getElementById(tag +"-"+ rowid +"-tr").style.display = "none";
			document.getElementById(tag + "-0-tr").style.display = "";
		}

		var n = parseInt(fld);
		if (n > 0 && n < flds.length) {
			document.getElementById(flds[n].fld).focus();
			if (edtTd) edtTd.classList.remove("edit-on");
			edtTd = document.getElementById(tag +"-0-"+ n);
			edtTd.classList.add("edit-on");
		}
		edRowid = rowid;
	}

	var edtTd;
	function focusTd() {
		if (edtTd) edtTd.classList.remove("edit-on");
		edtTd = this;
		edtTd.classList.add("edit-on");
	}
	
	function changed() {
		var chg = false;
		var i, input, val;
		if (edRowid == "empty") {	// 新行
		for (i = 1; i < flds.length; i++) {
			if (!flds[i].fld || flds[i].ro) continue;
			input = document.getElementById(flds[i].fld);
			if (flds[i].bit) val = input.checked;
			else val = trim(input.value);
			if (flds[i].bit) {
				if (val !== false) { chg = true; break; }
			}
			else if (flds[i].lis) {
				if (val !== "" && val !== input.options[0].value) {
					chg = true; break;
				}
			}
			else if (val !== "") {
				chg = true;
				break;
			}
		}
		}
		else { // 已有行
		for (i = 1; i < flds.length; i++) {
			if (!flds[i].fld || flds[i].ro) continue;
			var tdval = getTdval(flds[i],document.getElementById(tag +"-"+ edRowid +"-"+ i));
			input = document.getElementById(flds[i].fld);
			if (flds[i].bit) val = input.checked;
			else val = trim(input.value);
			if (val != tdval) {
				chg = true;
				break;
			}
		}
		}
		if (!chg) {
			document.getElementById(tag + "-0-tr").style.display = "none";
			if (edRowid != "empty") document.getElementById(tag +"-"+ edRowid +"-tr").style.display = "";
		}

		return chg;
	}

	function saveRow() {
		if (opts.onSave) opts.onSave(edRowid);
	}

	/** 返回数据, 保存数据(onSave)后返回
	 * @param {Array} data 返回的数据 */
	this.returnRow = function (data) {
		document.getElementById(tag + "-0-tr").style.display = "none";
		if (!(data["" + flds[0].fld])) return;
		if (edRowid == "empty") {	// 添加新行
			var trobj = newDatarow(data);
			mainTb.insertBefore(trobj.tr, document.getElementById(tag + "-empty"));
		}
		else {	// 修改原有行
			for (var i = 1; i < flds.length; i++) {
				if (flds[i].fld) {
					var RowFldData = data["" + flds[i].fld];
					var eTd = document.getElementById(tag + "-" + edRowid + "-" + i);
					setTd(flds[i], eTd, RowFldData);
				}
			}
			document.getElementById(tag +"-"+ data[""+flds[0].fld] +"-tr").style.display = "";
		}
		edRowid = "";

	};

	/** onSave 失败后，取消行编辑	 */
	this.saveErr = function() {
		onCancel();
	}

	function onBtnsave(){
		if (edRowid != "") {
			if (changed()) {
				saveRow();
			}
			else {
				edRowid = "";
			}
		}
	}

	function onCancel() {
		document.getElementById(tag + "-0-tr").style.display = "none";
		if (edRowid != "empty") {
			document.getElementById(tag +"-"+ edRowid +"-tr").style.display = "";
		}
		edRowid = "";
	}

	// 标题列鼠键按下
	function onDownCols() {
		//记录单元格 
		var adjTd = this;
		if (event.offsetX > adjTd.offsetWidth - 10) {
			adjTd.mouseDown = true;
			adjTd.oldX = event.x;
			adjTd.oldWidth = adjTd.offsetWidth;
		}
	}

	// 标题列鼠键放开，结束宽度调整
	function onUpCols() {
		var adjTd = this;
		adjTd.mouseDown = false;
		adjTd.style.cursor = 'default';
	}

	function onMoveCols() {
		// 指针样式 
		if (event.offsetX > this.offsetWidth - 10)
			this.style.cursor = 'col-resize';
		else
			this.style.cursor = 'default';
		//取出暂存 Table Cell 
		var adjTd = this;
		//调整宽度 
		if (adjTd.mouseDown != null && adjTd.mouseDown == true) {
			adjTd.style.cursor = 'default';
			if (adjTd.oldWidth + (event.x - adjTd.oldX) > 0)
				adjTd.width = adjTd.oldWidth + (event.x - adjTd.oldX);

			adjTd.style.width = adjTd.width;//调整列宽
			adjTd.style.cursor = 'col-resize';
			//调整该列每个Cell 
			for (var j = 0; j < mainTb.rows.length; j++) {
				mainTb.rows[j].cells[adjTd.cellIndex].width = adjTd.width;
			}
			if (fixedTb != null)
				fixedTb.rows[0].cells[adjTd.cellIndex].style.width = adjTd.width + "px";
			
		}
	}

	function onScrolly() {
		var top = this.scrollTop;
		if (top > 20) fixedTb.style.visibility = "visible";
		else fixedTb.style.visibility = "hidden";
	}

	function getNode(nodeid) {
		var node;
		if (!nodeid) return node;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id == nodeid) {
				node = nodes[i];
				break;
			}
		}
		return node;
	}

	/** 取行号
	 * @param rowid 行标识 */
	function getRownum(rowid) {
		var n = -1;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id == rowid) {
				n = i;
				break;
			}
		}
		return n;
	}

	/** 分支操作
	 * @param {int} num 分支行号
	 * @param {string} op 操作: "link":下连线, "unlink":, "dis":禁用, "undis":
	 */
	function subOp(num, op) {
		var len = nodes.length;
		var nd = nodes[num];
		var lev = nd.lev;
		var preft = nd.pref[nd.pref.length - 1];
		var et = preft.esp;
		switch (op) {
			case "link":
				preft.lined = true;
				if (et.className == "open1") et.className = "open0";
				else if (et.className == "off1") et.className = "off0";
				else if (et.className == "line4") et.className = "line3";
				break;
			case "unlink":
				preft.lined = false;
				if (et.className == "open0") et.className = "open1";
				else if (et.className == "off0") et.className = "off1";
				else if (et.className == "line3") et.className = "line4";
				break;
			case "dis":
				nd.dis = true;
				nd.rowd.classList.add("disrow");
				break;
			case "undis":
				nd.dis = false;
				nd.rowd.classList.remove("disrow");
				break;
		}

		num++;
		while (num < len && nodes[num].lev > lev) {
			nd = nodes[num];
			switch (op) {
				case "link":
					nd.pref[lev].lined = true;
					nd.pref[lev].esp.className = "line1";
					break;
				case "unlink":
					nd.pref[lev].lined = false;
					nd.pref[lev].esp.className = "line0";
					break;
				case "dis":
					nd.dis = true;
					nd.rowd.classList.add("disrow");
					break;
				case "undis":
					nd.dis = false;
					nd.rowd.classList.remove("disrow");
					break;
			}
			num++;
		}
	}

	/** 折叠和展开 */
	function onFold() {
		var nid = this.id.substring((tag + "-fold-").length);
		var num = getRownum(nid);
		if (nodes[num].open) shutRow(num);
		else openRow(num);
	}

	/** 关闭行 */
	function shutRow(num) {
		if (!nodes[num].open) return;
		var len = nodes.length;
		var nd = nodes[num];
		var lev = nd.lev;
		var efold = nd.pref[nd.pref.length - 1].esp;
		if (efold.className == "open0") efold.className = "off0";
		else efold.className = "off1";
		nd.open = false;

		// 关闭后代
		num++;
		while (num < len && nodes[num].lev > lev) {
			nodes[num].rowd.style.display = "none";
			num++;
		}
	}

	/** 打开行 */
	function openRow(num) {
		var len = nodes.length;
		var nd = nodes[num];
		var lev = nd.lev;
		var efold = nd.pref[nd.pref.length - 1].esp;
		if (efold.className == "off0") efold.className = "open0";
		else if (efold.className == "off1") efold.className = "open1";
		nd.open = true;
		
		// 层层打开
		var open = true;
		var hidelev = lev;	// 隐藏层
		num++;
		while (num < len && nodes[num].lev > lev) {
			if (nodes[num].lev <= hidelev) open = true;
			if (open) {
				nodes[num].rowd.style.display = "";
				if (!nodes[num].open) {
					hidelev = nodes[num].lev;
					open = false;
				}
			}
			num++;
		}
	}
	
	/** 热行(树div, 表tr) */
	var hotRow;
	/** 点击表行 */
	function onTaptr() {
		var arrId = this.id.split('-');
		if (arrId.length != 3) return;
		var rid = arrId[1];
		if (edRowid != "") {
			if (changed()) {
				saveRow();
			}
			else {
				edRowid = "";
			}
		}

		if (hotRow) hotRow.classList.remove("hotrow");
		var tr = document.getElementById(tag +"-"+ rid +"-tr");
		if (hotRow == tr) {
			hotRow = null;
			rid = "";
		}
		else {
			hotRow = tr;
			hotRow.classList.add("hotrow");
		}

		if (opts.onAim) {
			opts.onAim(rid);
		}
	}

	this.disHot = function () {
		if (hotRow) hotRow.classList.remove("hotrow");
		hotRow = null;
	}

	function trim(str) {
		var strRe = str.replace(/&nbsp;/ig, "");
		strRe = strRe.replace(/^\s+/g, "");
		strRe = strRe.replace(/\s+$/g, "");
		return strRe;
	}

	/** 勾选框 name */
	this.chkName = tag + "-box";

	/** 点击节点 */
	function onTapnode() {
		var nid = this.id.substring((tag + "-ti-").length);
		var tit = this.innerText;

		var node = getNode(nid);
		if (!node) return;
		if (node.dis) return;
		var isFather = node.isFather;
		if (hotRow) hotRow.classList.remove("hotrow");
		if (hotRow == node.rowd) {
			hotRow = null;
			nid = "";
			tit = "";
			isFather = false;
		}	else {
			hotRow = node.rowd;
			hotRow.classList.add("hotrow");
		}

		if (opts.onTapnode) {
			opts.onTapnode(nid, tit, isFather);
		}
	};

	function onChkAll() {
		var chked = document.getElementById(tag + "-allbox").checked;
		var rowchk = document.getElementsByName(tag + "-box");
		for (var i = 0; i < rowchk.length; i++) {
			if (chked) rowchk[i].checked = true;
			else rowchk[i].checked = false;
		}
	}
	
	function onChk() {
		var rid = this.id.substring((tag + "-chk-").length);
		var chked = this.checked;

		if (opts.onChk) {
			opts.onChk(rid, chked);
		}
	}

	this.getChks = function() {
		var strs = "";
		var rowchk = document.getElementsByName(tag + "-box");
		for (var i = 0; i < rowchk.length; i++) {
			if (rowchk[i].checked) {
				if (strs == "") {
					strs = rowchk[i].value.toString();
				} else {
					strs += "," + rowchk[i].value;
				}
			}
		}
	}

	function addon() {
		var nid = this.id.substring((tag + "-aon-").length);
		var aonspan = document.getElementById(tag + "-aon-" + nid).title;
		opts.addon(nid, aonspan);
	}

};