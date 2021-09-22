# zbTree
zero base Native JavaScript Tree.
#### Installation

1.  download zbTree.js, zbTree.css, zbTree.png to you file directory(css and png in same directory).
2.  And Use zbTree in html file.

#### Instructions

1.  Use zbTree in html
```
	<link href="zbTree.css" rel="Stylesheet" type="text/css" />
	<script src="zbTree.js" type="text/javascript"></script>
```
2.  call tree
```
<div id="tree1" class="zbTree" style="width: 350px; overflow-y: auto;">
</div>
```
The html div(it contain tree) element, must have class name zbTree. 
```
	var nodes = [
		{ id: 1, pid: 0, name: "父节点1 - 展开", open: true, gr:"2" },
		{ id: 11, pid: 1, name: "父节点11 - 折叠" },
		...
	];
	var mytree = new zbTree({ tag: "t1", divid: "tree1", chkbox:true, 
		onTap: tapNode, addon: addon });
	mytree.addTree(nodes);
```
The tag assign the tree tag, is different from other tree. All element of the tree, the id include prefix tag- , used to distinguish other element.
The nodes is Array, the item id must unique, and pid point parent item id.

3.  Detailed usage method see the zbTree.html.