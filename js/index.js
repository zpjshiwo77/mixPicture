$(document).ready(function(){
	//变量定义
	var icamera = new camera();
	var filters = ["自然增强","仿lomo","美肤","柔焦"];
	var panels = $("#panels");
	var inputBox = $(".inputBox");
	var startCoords = [0,0];
	var endCoords = [0,0];

	pageInit();

	//页面初始化
	function pageInit(){
		cameraInit();
		eventInit();
	}//end func

	//事件初始化
	function eventInit(){
		$("#filter").on("click",".photo",changeFilter);
		$(".switch .btn").on("click",switchEditFunc);
		$("#sticker").on("click","img",addSticker);
		$(".removeBtn").on("click",removeSticker);
		$("#frame").on("click",".block",changeFrame);
		$(".cancel").on("click",resetPhoto);
		$(".confirm").on("click",creatMixPhoto);
		inputBox.on("blur",showInputTips);
		inputBox.on("focus",hideInputTips);
		inputBox.on("touchstart",wordBoxStart);
		inputBox.on("touchmove",wordBoxMove);
	}//end func

	//点击wordbox
	function wordBoxStart(e) {
		startCoords = [e.changedTouches[0].pageX,e.changedTouches[0].pageY];
	}//end func

	//移动文字盒子
	function wordBoxMove(e){
		endCoords = [e.changedTouches[0].pageX,e.changedTouches[0].pageY];
		var oftX = endCoords[0] - startCoords[0];
		var oftY = endCoords[1] - startCoords[1];

		inputBox.css({
			top: '+='+oftY,
			left: '+='+oftX
		});

		startCoords = endCoords;
		e.preventDefault();
	}//end func

	//隐藏提示
	function hideInputTips(){
		if($(this).text() == "请输入您的文字...") $(this).text('');
	}//end func

	//显示提示
	function showInputTips(){
		if($(this).text() == "") $(this).text('请输入您的文字...');
	}//end func

	//创建合成的图片
	function creatMixPhoto () {
		addText();
		addQRcode(function(){
			setTimeout(function(){
				icamera.canvasTrfImg({callback:renderResult});
			},300);
		});
	}//end func

	//新增文字
	function addText(){
		var text = inputBox.text();
		if(text != "" || text != "请输入您的文字..."){
			var opts = {
				x:delPX(inputBox.css('left')),
				y:delPX(inputBox.css('top')),
				fontSize:delPX(inputBox.css('fontSize')),
				lineHeight:1.2,
				maxNum:14
			};
			icamera.addTextLayer("testWord",text,opts);
		}
		inputBox.hide();
		//去掉单位
		function delPX(str){
			return parseInt(str.split("px")[0])
		}//end func
	}//end func

	//新增二维码
	function addQRcode(callback){
		var opts = {
			src:"images/code.jpg",
			wd:70,
			ht:70,
			x:290,
			y:410,
			autoSize: false,
			fromCenter:false,
			index:999,
			callback:function(){
				if(callback) callback();
			}
		}
		icamera.img_creat("test",icamera.photoCanvas,opts);
	}//end func

	//渲染结果页面
	function renderResult (src) {
		var resultBox = $(".resultBox");
		resultBox.find("img")[0].src = src;
		resultBox.show();
	}//end func

	//重置
	function resetPhoto () {
		icamera.reset();
		panels.hide();
		inputBox.hide();
	}//end func

	//修改封面
	function changeFrame(){
		var src = $(this).find('.iframe').attr('src');
		var canvas = icamera.photoCanvas;

		var opts = {
			src:src,
			index:999,
			intangible: true
		}

		icamera.img_creat("frame",canvas,opts);
	}//end func

	//添加贴纸
	function addSticker(){
		var src = $(this).attr('src');
		var wd = $(this).width();
		var ht = $(this).height();
		icamera.addSticker(src,[wd,ht]);
	}//end func

	//移除sticker
	function removeSticker(){
		icamera.removeSticker();
	}//end func

	//选择编辑功能
	function switchEditFunc(){
		var type = $(this).attr("data-type");
		panels.find('.switch .btn').removeClass('active');
		$(this).addClass('active');
		panels.find('.choseBox').hide();

		switch(type){
			case "filter":
				showFilterBox();
				break;
			case "sticker":
				showStickerBox();
				break;
			case "frame":
				showFrameBox();
				break;
		}
	}//end func

	//显示滤镜插件
	function showFilterBox(){
		$("#filter").show();
		$(".removeBtn").hide();
		icamera.stkClick = false;
		icamera.setBaseEvent();
		inputBox.hide();
	}//end func

	//显示贴纸插件
	function showStickerBox(){
		icamera.stkClick = true;
		$("#sticker").show();
		inputBox.hide();
	}//end func

	//显示边框插件
	function showFrameBox(){
		$("#frame").show();
		icamera.stkClick = false;
		icamera.setBaseEvent();
		$(".removeBtn").hide();
		inputBox.show();
	}//end func

	//改变滤镜
	function changeFilter(){
		if(!$(this).hasClass('active')){
			$('#filter .photo').removeClass('active');
			$(this).addClass('active');
			var type = $(this).find('p').attr("data-val");
			icamera.changeFilter(type);
		}
	}//end func

	//相机初始化
	function cameraInit(){
		var opts = {
			filter:true,
			loadBox:$("#loading"),
			onUpload:creatFilters,
			stkRemoveBtn:$(".removeBtn")
		}
		icamera.init($("#photoContainer"),opts);
	}//end func
	
	//创建滤镜
	function creatFilters(img){
		icamera.creatFilter(filters,renderFilter);
	}//end func

	//渲染滤镜缩略图
	function renderFilter(data){
		var box = $("#filter");
		box.empty();
		var cont = "";
		for (var i = 0; i < data.length; i++) {
			var type = i == 0 ? "原图" : filters[filters.length - i];
			var act = i == 0 ? "active" : "";
 			cont += '<div class="photo '+act+'"> <img src="'+data[i].src+'"> <p data-val="'+type+'">'+type+'</p>  </div>';
		};
		box.append(cont);
		$("#panels").show();
	}//end func
});//end ready
