# zbTreetb
zero base Native JavaScript Tree，may only tree, may only table, or combine tree and table。
#### Installation

1.  download zbTreetb.js, zbTreetb.css, zbTreetb.png to you file directory(css and png in same directory).
2.  And Use zbTreetb in html file.

#### Instructions

1.  Use zbTreetb in html
```html
	<link href="zbTreetb.css" rel="Stylesheet" type="text/css" />
	<script src="zbTreetb.js" type="text/javascript"></script>
```
2.  call tree
```html
<div id="ttb1" class="zbTreetb">
</div>
```
The html div(it contain tree) element, must have class name zbTree. 
```javascript
<script type="text/javascript">
var flds = [
	{fld:"id", label: "id", width: "50px" },
	{fld:"name", label: "名称", width: "50px"},	
	{fld:"num", label: "编号", width: "50px", ro: true },
	{fld:"indate", label: "入库时间长一点点", width: "90px"}
    ...
];
var nodes = [
	{id: 1, pid:0, num: "218",name: "肉类", indate:"2017-08-09", amount:"20", rate: 2, sex: false, note: "散养"},
	{id: 2, pid:1, num: "219",name: "精禽", indate:"2017-08-09", amount:"30", rate: 2, sex: 1, note: "土家"},
	{id: 3, pid:2, num: "405",name: "瘦肉猪", indate:"2017-08-09", amount:"8", rate: 3, sex: 0, note: "场购"},
	{id: 4, pid:2, num: "518",name: "桃谷鸭", indate:"2017-08-09", amount:"10", rate: 1, sex: 1, note: "收购"},
	{id: 5, pid:2, num: "656", name: "散养鹅", indate: "2017-08-09", amount:"5", rate: 1, sex: true, note:"山货"},
	...
];
var ttb = new zbTree({
	dom: "ttb1",
	tree: true,	// 包含树形
	idCol: "id",	// 缺省为 "id", 区分大小写
	pidCol: "pid",	// 缺省为 "pid"
	titleCol: "name",	// 缺省为 "title"
	tab: true,	// 表格形式
	flds: flds,	// 表格字段集
	chkbox: true,
	editable: true,
	onTapnode: tapNode,
	onSave: save
});
ttb.addItems(nodes);
ttb.fixTh("300px");

function tapNode(nodeid, nodename, isFather) {
	...
}

function save(rid) {
	var ordata = ttb.getRowdata(rid);
	// todo: 把数据获取到，经过提交服务器等，返回数据到树表
	...
	ttb.returnRow(data);
}

</script>
```
The nodes is Array, the item id must unique(id can not contain "-", best as integer), and pid point parent item id.

3.  Detailed usage method see the zbTreetb.html.