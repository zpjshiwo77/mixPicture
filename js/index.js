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
		icamera.setBaseEvent();
	}//end func

	//显示贴纸插件
	function showStickerBox(){
		$("#sticker").show();
	}//end func

	//显示边框插件
	function showFrameBox(){
		$("#frame").show();
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
