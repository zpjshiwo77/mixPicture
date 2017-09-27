$(document).ready(function(){
	//变量定义
	var icamera = new camera();
	var filters = ["自然增强","仿lomo","美肤","柔焦"];
	var panels = $("#panels");

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
		$("#photoContainer").on("click",".removeBtn",removeSticker);
		$("#frame").on("click",".block",changeFrame);
		$(".cancel").on("click",resetPhoto);
		$(".confirm").on("click",creatMixPhoto);
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
		var opts = {
			x:100,
			y:10
		};
		icamera.addTextLayer("testWord","测试文字",opts);
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
		console.log(11);
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
	}//end func

	//显示贴纸插件
	function showStickerBox(){
		icamera.stkClick = true;
		$("#sticker").show();
	}//end func

	//显示边框插件
	function showFrameBox(){
		$("#frame").show();
		icamera.stkClick = false;
		icamera.setBaseEvent();
		$(".removeBtn").hide();
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
