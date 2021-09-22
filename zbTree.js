/** zbTree 0.6 Copyright (c) 2013-2021
 * @param {Object} opts 选项 
 */
function zbTree(opts) {
	if (!opts.tag) return;
	if (!opts.divid) return;

	/** 树标记 */
	var tag = opts.tag;
	/** 领域 */
	var dom = document.getElementById(opts.divid);
	/** 节点数组 */
	var nodes = [];

	/** 加入树
	 * @param {Array[Object]} items 条目数组
	 * @param {String} pid 加入的父id
	 */
	this.addTree = function (items, pid) {
		if (!Object.prototype.toString.call(items) === '[object Array]') return;
		if (items.length < 1) return;
		/** 工作栈 */
		var nowStk = [];
		/** 工作层 */
		var lev = 0;
		/** 插入行号 */
		var insn = 0;

		var i, eFold;
		var embed = false; // 植入否
		if (pid) {	// 指定父id
		for (i = 0; i < nodes.length; i++) {
		if (nodes[i].id == pid) {	// 找到父id
			var pnum = i;	// 父行号
			var pnode = nodes[i];
			for (var j = 0; j < pnode.pref.length; j++) {
				nowStk.push({open:true, lined: pnode.pref[j].lined });
			}	 // open只用到顶部一个

			insn = subafter(pnum);
			var lsn = lastson(pnum);	// 幺儿行号
			if (lsn > 0) {	// 有儿
				subOp(lsn, "link");	// 幺儿分支连线
				openRow(pnum);
			}
			else {	// 新儿
				eFold = pnode.pref[pnode.pref.length - 1].esp;
				if (eFold.className == "line3") eFold.className = "open0";
				if (eFold.className == "line4") eFold.className = "open1";
				eFold.onclick = foldNode;
				pnode.isFather = true;
			}
			lev = pnode.lev + 1;
			embed = true;	// 已植入
			break;
		}
		}
		}

		var itemStk = [];
		if (embed) {	// 植入,指向pid或=="0"为起始条目
			for (i = items.length - 1; i >= 0; i--) {
				if (items[i].pid == pid || items[i].pid == "0") {
					items[i].lev = lev + 1;
					itemStk.push(items[i]);
				}
			}
		}
		else {
			for (i = items.length - 1; i >= 0; i--) {
				if (items[i].pid == "0") {
					items[i].lev = 0;
					itemStk.push(items[i]);
				}
			}
		}

		var open = true;
		var hidelev = lev;
		while (itemStk.length > 0) {
			var item = itemStk.pop();
			var nid = item.id;
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
				if (items[i].pid == nid) {
					items[i].lev = lev + 1;
					itemStk.push(items[i]);
					isFather = true;
				}
			}

			//节点 ediv:节点div元素; pref:行前缀栈:esp元素,lined 连线否
			var node = { id: nid, lev: lev, ediv: null, isFather: isFather, open: open, pref: [] };

			// 节点
			var dNode = document.createElement("div");
			dNode.id = tag + "-nd-" + nid;
			dNode.className = "nodediv";
			if (!open) dNode.style.display = "none";
			if (insn < nodes.length) dom.insertBefore(dNode, nodes[insn].ediv);
			else dom.appendChild(dNode);
			node.ediv = dNode;

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
				eFold.onclick = foldNode;
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
				var eChk = document.createElement("input"); // 选取
				eChk.id = tag + "-chk-" + nid;
				eChk.type = "checkbox";
				eChk.name = tag + "-box";
				eChk.value = nid;
				if (item.chked) eChk.checked = "checked";
				eChk.onclick = chk;			
				dNode.appendChild(eChk);
			}

			var eIcon = document.createElement("span"); // 图标
			if (isFather) eIcon.className = "icon1";
			else eIcon.className = "icon3";
			dNode.appendChild(eIcon);

			var eTit = document.createElement("span"); // 标题
			eTit.id = tag + "-ti-" + nid;
			eTit.innerHTML = item.name;
			eTit.className = "nodename";

			if (item.link) {
				var eLink = document.createElement("a");
				eLink.href = item.link;
				dNode.appendChild(eLink);
				eLink.appendChild(eTit);
			}
			if (!item.dis) eTit.onclick = aim;
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
			nodes.splice(insn, 0, node);
			insn = insn + 1;
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
	
	/** 删除分支
	 * @param {String} nodeid 节点id
	 */
	this.delSub = function(nodeid) {
		var num = getRowNum(nodeid);
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
		dom.removeChild(nodes[num].ediv);
		n4 = num + 1;
		while (n4 < len && nodes[n4].lev > lev) {
			dom.removeChild(nodes[n4].ediv);
			n4++;
		}
		nodes.splice(num, n4 - num);
	}

	/** 定位到节点
	 * @param {String} nodeid 节点id
	 */
	this.locate = function (nodeid) {
		var num = getRowNum(nodeid);
		if (num < 0) return;
		var node = nodes[num];
		if (aimNode) aimNode.ediv.className = "nodediv";
		node.ediv.className = "aimnode";
		aimNode = node;

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
	var disNode;
	/** 禁用当前单节点 */
	this.disOne = function (){
		if (disNode || !aimNode) return;
		disNode = aimNode;
		disNode.dis = true;
		disNode.ediv.className = "disnode";
		aimNode = null;
	}

	/** 禁用当前分支 */
	this.disSub = function () {
		if (disNode || !aimNode) return;
		disNode = aimNode;
		var num = getRowNum(aimNode.id)
		subOp(num, "dis");
		aimNode = null;
	}

	/** 取消禁用 */
	this.undis = function () {
		if (!disNode) return;
		var num = getRowNum(disNode.id);
		subOp(num, "undis");
		disNode = null;
	}

	/** 勾选了吗
	 * @param {String} nodeid 节点id
	 */
	this.chked = function (nodeid) {
		var nbox = document.getElementById(tag + "-chk-" + nodeid);
		if (nbox) {
			if (nbox.checked) return true;
		}
		return false;
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

	/** 获取行 idn */
	function getRowNum(nodeid) {
		var n = -1;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id == nodeid) {
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
				nd.ediv.className = "disnode";
				break;
			case "undis":
				nd.dis = false;
				nd.ediv.className = "nodediv";
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
					nd.ediv.className = "disnode";
					break;
				case "undis":
					nd.dis = false;
					nd.ediv.className = "nodediv";
					break;
			}
			num++;
		}
	}

	/** 折叠和展开 */
	function foldNode() {
		var nid = this.id.substring((tag + "-fold-").length);
		var num = getRowNum(nid);
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
			nodes[num].ediv.style.display = "none";
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
				nodes[num].ediv.style.display = "";
				if (!nodes[num].open) {
					hidelev = nodes[num].lev;
					open = false;
				}
			}
			num++;
		}
	}

	var aimNode;	//选中节点
	function aim() {
		var nid = this.id.substring((tag + "-ti-").length);
		var tit = this.innerText;

		var node = getNode(nid);
		if (!node) return;
		if (node.dis) return;

		if (aimNode) aimNode.ediv.className = "nodediv";
		node.ediv.className = "aimnode";
		aimNode = node;
		
		if (opts.onTap) {
			opts.onTap(nid, tit, node.isFather);
		}
	};

	function chk() {
		var nid = this.id.substring((tag + "-chk-").length);

		if (opts.onCheck) {
			opts.onCheck(nid, boxId);
		}
	}

	function addon() {
		var nid = this.id.substring((tag + "-aon-").length);
		var aonspan = document.getElementById(tag + "-aon-" + nid).title;
		opts.addon(nid, aonspan);
	}

};

