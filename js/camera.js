var camera = function(){
	/****************************** 变量的定义 start ************************************/
	var _self = this;

	var container;												//整个大容器
	var imgShell,filterShell;									//图片容器，滤镜图片容器
	var btnCamera;												//上传图片按钮
	var inputShell;												//输入框容器
	var imgCanvas,filterCanvas;									//图片画布，滤镜画布
	var baseLayer;												//基础图片对象
	var layerNow;												//当前layer对象
	var layerNum = 0,stickerNum = 0;							//layer对象数量,贴纸数量
	var loadBox;												//loading遮罩 
	var stkRemoveBtn;											//贴纸移除按钮

	var imgScaleMin=0.5,imgScaleMax=5;							//最小缩放比例，最大缩放比例
    var fileInput;												//读取文件的对象
    var jcanvasScale=1;											//画布的缩放比例，影响图片质量
    var imgSourceData={},imgEditData={},imgFilterData={};		//图片源数据，编辑图片的数据，滤镜图片数据
    var onUpload;												//上传图片完成后的回调方法
    var filterTime = 0;											//当前滤镜数量
	var filterArr = [];											//存储滤镜图片的数组
	var filterImgs = {};										//存储滤镜图片的对象

    _self.opts = {};											//插件的配置选项
    _self.sourceImg = "";										//上传图片的base64源文件
    _self.photoCanvas;											//canvas对象
    _self.stkClick = true;										//是否允许贴纸的click事件

	/****************************** 变量的定义 end ************************************/

	/****************************** 公开的方法 start ************************************/
    //初始化
    _self.init = function(box,options){
    	var defaultOpts = {
    		scale:1,											//缩放比例，影响清晰度和效率
    		filter:false,										//是否使用滤镜
    		loadBox:$("#loading"),	
    		stkRemoveBtn:$("#stkRemoveBtn"),							
    		onUpload:function(img){}
    	};
    	_self.opts = $.extend(defaultOpts, options);
    	
    	container = box;
    	loadBox = _self.opts.loadBox;

    	imgShell = box.find('.photo');
    	imgCanvas=$('<canvas></canvas>');
    	_self.photoCanvas = imgCanvas;
    	stkRemoveBtn = _self.opts.stkRemoveBtn;

    	btnCamera = box.find('.btnCamera');
    	jcanvasScale = _self.opts.scale;
    	if(_self.opts.onUpload) onUpload = _self.opts.onUpload;

    	fileInput=$('<input type="file" accept="image/*" name="imageInput" style="position: fixed; top:-200px; left: -200px; opacity:0;" />').appendTo('body');
		fileInput.on('change',file_select);
		
		if(_self.opts.filter) creatFilterBasePic();
		
		creatCanvas(imgCanvas,imgShell,jcanvasScale);

		btnCamera.on('touchend',uploadImg);
    }//end func

    //初始化
    _self.reset = function(){
    	stickerNum = 0;
    	layerNum = 0;
    	filterTime = 0;
    	filterArr = [];
    	baseLayer = null;
    	layerNow = null;
    	filterImgs = {};
    	textLayerArr = [];
    	imgShell.off();
    	imgCanvas.removeLayers().drawLayers();
    	if(_self.opts.filter) filterCanvas.removeLayers().drawLayers();
    	btnCamera.show();
    	stkRemoveBtn.hide();
    	fileInput.remove();
    	fileInput=$('<input type="file" accept="image/*" name="imageInput" style="position: fixed; top:-200px; left: -200px; opacity:0;" />').appendTo('body');
		fileInput.on('change',file_select);
    }//end func

    //canvas转图片
    _self.canvasTrfImg = function(opts){
		var type = opts.type || 'jpg';
		var quality = opts.quality || 0.8;
		var secretkey = opts.secretkey || "loop_test";
		var callback = opts.callback || false;

		loadBox.show();
		if(type=='png'){
			var src=imgCanvas[0].toDataURL();
			var data=src.split(",")[1];
		}
		else{
			var src=imgCanvas[0].toDataURL('image/jpeg', quality);
			var data=src.split(",")[1];
		}
		_self.base64TrfImg(data,callback,secretkey);
	}//end func

    //转换base64类型的图片
    _self.base64TrfImg = function(data,callback,secretkey){
    	var key = secretkey || "loop_test";
    	loadBox.show();
		$.post('http://upload.be-xx.com/upload', { data: data, key: key }, function (resp) {
			loadBox.hide();
			if(callback) callback(resp);
        });
    }//end func

    //复制图片至canvas
	_self.img_creat = function(name,canvas,opts){
		canvas = canvas || imgCanvas;
		var defaultOpts = {
			src:"images/default.jpg",
			wd:canvas.width(),
			ht:canvas.height(),
			x:canvas.width()*0.5,
			y:canvas.height()*0.5,
			clear:false,
			autoSize:true,
			touch:false,
			intangible:false,
			fromCenter:true,
			index:10
		};
		var options = $.extend(defaultOpts,opts);

		var iLayer = imgCanvas.getLayer(name);
		if(iLayer) imgCanvas.removeLayer(iLayer);

		if(options.autoSize) var size=imath.autoSize([options.wd,options.ht],[canvas.width(),canvas.height()],1);
		else var size = [options.wd,options.ht];

		if(options.clear) canvas.removeLayers();

		canvas.drawImage({
			layer: true,
			name:name,
			source: options.src,
			width:size[0],height:size[1],
			x: options.x, y: options.y,
			scale:1,
			fromCenter: options.fromCenter,
			index: options.index,
			intangible: options.intangible,
			touchstart: layer_touchstart,
			itouch: options.touch
		}).drawLayers();

		if(options.callback) options.callback();
		layerNum ++;
	}//end func

	//改变基础图片的源
	_self.changeBasePic = function(src){
		baseLayer.source = src;
		imgCanvas.drawLayers();
	}//end func

	//绑定基础图片的事件
	_self.setBaseEvent = function(min,max){
		imgScaleMin = min || 0.5;
		imgScaleMax = max || 5;
		img_addEvent(imgShell,imgCanvas,baseLayer);
	}//end func

	//添加贴纸
	_self.addSticker = function(src,size){
		stickerNum++;

		var opts = {
			src: src,
			wd: size[0] * jcanvasScale,
			ht: size[1] * jcanvasScale,
			clear: false,
			autoSize: false,
			touch: true,
			intangible: false,
			index:stickerNum
		};
		
		_self.img_creat("s"+stickerNum,imgCanvas,opts);
	}//end func

	//移除当前sticker
	_self.removeSticker = function(){
		imgCanvas.removeLayer(layerNow).drawLayers();
		layerNow=null;
		stickerNum--;
		layerNum--;
		stkRemoveBtn.hide();
	}//edn func

	//移除layer
	_self.removeLayer = function(name){
		var iLayer = imgCanvas.getLayer(name);
		if(iLayer) imgCanvas.removeLayer(iLayer).drawLayers();
	}//end func

	//添加一个文本
	_self.addTextLayer = function(name,text,opts){
		var defaultOpts = {
			color:"#333",
			fontStyle:"normal",
			fontSize: 24,
			x:0,
			y:0,
			align:"left",
			lineHeight:1.2,
			maxNum:100,
			index:1000,
			shadow:{
				x:0,
				y:0,
				blur:0,
				color:"#fff"
			}
		};
		opts = $.extend(defaultOpts, opts);
		if(opts.maxNum)  text = textToMulti(text,opts.maxNum);

		var iLayer = imgCanvas.getLayer(name);
		if(iLayer) imgCanvas.removeLayer(iLayer);
		
		imgCanvas.drawText({
			layer: true,
			name: name,
			index: opts.index,
			fillStyle: opts.color,
			fontStyle: opts.fontStyle,
			fontSize: opts.fontSize * jcanvasScale,
			text: text,
			align: opts.align,
			x: opts.x * jcanvasScale, y: opts.y * jcanvasScale,
			fromCenter: false,
			lineHeight: opts.lineHeight,
			shadowBlur: opts.shadow.blur,
			shadowColor: opts.shadow.color,
			shadowX: opts.shadow.x,
			shadowY: opts.shadow.y
		}).drawLayers();
	}//end func

	/******************************  私有的方法 end ************************************/

	//切割单行文字成几行
	function textToMulti(str,maxNum){
		var arr = [];
		var i = 0;
		do{
			arr.push(str.substr(i,maxNum));
			i += maxNum;
		}
		while(i < str.length)

		str = "";
		for (var i = 0; i < arr.length; i++) {
			if(i == 0) str += arr[i];
			else str += "\n" + arr[i];
		};
		return str;
	}//end func

	//点击事件
	function layer_touchstart(layer){
		if(layer.itouch && _self.stkClick){
			if(layerNow && layerNow!=layer){
		  		$(this).moveLayer(layerNow, 1);
		  	}
		  	$(this).moveLayer(layer, stickerNum).drawLayers();
			layerNow=layer;
			stk_position(layer);
			stkRemoveBtn.show();
			imgScaleMin = 0.5;
			img_addEvent(imgShell,$(this),layer);
		}
	}//edn func

    //选择文件
    function file_select(){
    	loadBox.show();
        var file = this.files[0];
        if (file) {
			ireader.read({ file: file, callback: function (resp,wd,ht) {
                if (resp){
                	loadBox.hide();
                	btnCamera.hide();

					imgSourceData={};
            		imgSourceData.src=resp;
            		imgSourceData.width=wd;
            		imgSourceData.height=ht;
            		_self.sourceImg = resp;

            		var baseOpts = {
						src:resp,
						wd: wd,
						ht: ht,
						clear: true,
						touch: false,
						autoSize: true,
						intangible: false,
						index:0,
						callback:function(){
							setTimeout(function(){
								baseLayer=imgCanvas.getLayer("base");
		            			imgEditData = {};
								imgEditData.src = imgCanvas.getCanvasImage('jpeg',1);
						    	imgEditData.width = imgCanvas.width();
						    	imgEditData.height = imgCanvas.height();
						    	if(!_self.opts.filter) onUpload(resp);
							},300);	
	            		}
					};
            		_self.img_creat("base",imgCanvas,baseOpts);

            		if(_self.opts.filter){
            			var filterOpts = {
							src:resp,
							wd: wd/5,
							ht: ht/5,
							clear: true,
							touch: false,
							autoSize: true,
							intangible: false,
							index:0,
							callback:function(){
								loadBox.show();
								setTimeout(function(){
									loadBox.hide();
									onUpload(resp);
								},310);
							}
						};
            			_self.img_creat("filterPic",filterCanvas,filterOpts);
            		}
                }//edn if
                else loadBox.hide();
            }});
        }//end if
        else loadBox.hide();
    }//end func

    //上传图片
    function uploadImg(){
    	fileInput.click();
    }//end func

    //画一个背景
	_self.drawBg = function(color){
		imgCanvas.addLayer({
		  type: 'rectangle',
		  index: 0,
		  fillStyle: color,
		  x: 0, y: 0,
		  width: imgCanvas.width() * jcanvasScale, height: imgCanvas.height() * jcanvasScale
		})
		.drawLayers();
	}//end func

    //创建canvas
    function creatCanvas(canvas,shell,scale){
    	canvas.attr({width:shell.width() * scale,height:shell.height() * scale,jcanvasScale:scale}).css({scale:1/scale}).prependTo(shell);
    	canvas[0].getContext("2d").imageSmoothingEnabled = true;
    }//end func

    //创建滤镜基础
    function creatFilterBasePic(){
    	var photoH = imgShell.height();
		var photoW = imgShell.width();
		var photoTop = imgShell[0].offsetTop;
		var photoLeft = imgShell[0].offsetLeft;

		imgShell.css({
			"position": 'relative',
			"z-index": '2'
		});

		filterShell = $('<div class="filter" style="position: absolute; top:'+photoTop+'px; left:'+photoLeft+'px; width: '+photoW/5+'px; height: '+photoH/5+'px; z-index: 1;"></div>').appendTo(container);
		filterCanvas=$('<canvas></canvas>');
		creatCanvas(filterCanvas,filterShell,1);

		creatFilterFunc();
    }//end func

    //获取滤镜处理后的图片
	function getFilterImg(arr,callback){
		var img = new Image();
    	img.src = imgFilterData.src;
    	img.width = imgFilterData.width;
    	img.height = imgFilterData.height;
    	img.loadOnce(function(){//loadOnce添加为alloyPhoto添加
    		var that = this;
    		try{
    			AlloyImage(that).ps(arr[filterTime-1]).replace(that);	
    		}catch(e){
    			alert(e);
    		}
    		filterArr.push(that);
	    	filterTime--;
	    	if(filterTime == 0) callback(filterArr);
	    	else getFilterImg(arr,callback);
		});
	}//edn func

	//创建滤镜的方法
	function creatFilterFunc(){
		//新建滤镜
		_self.creatFilter = function(arr,callback){
			imgFilterData = {};
			imgFilterData.src = filterCanvas.getCanvasImage('jpeg',1);
	    	imgFilterData.width = filterCanvas.width();
	    	imgFilterData.height = filterCanvas.height();

	    	filterImgs["原图"] = imgEditData.src;
	    	for (var i = 0; i < arr.length; i++) {
	    		filterImgs[arr[i]] = "";
	    	};

			filterArr = [imgFilterData];
			filterTime = arr.length;
			getFilterImg(arr,callback);

			imgCanvas.removeLayer(baseLayer);
			var baseOpts = {
				src:imgEditData.src,
				wd: imgEditData.width,
				ht: imgEditData.height,
				clear: false,
				touch: false,
				intangible: false,
				index:0,
				callback:function(){
					baseLayer=imgCanvas.getLayer("base");
				}
			};
			_self.img_creat("base",imgCanvas,baseOpts);
		}//end func

		//改变滤镜
		_self.changeFilter = function(type){
			if(filterImgs[type] == ""){
				loadBox.show()
				var img = new Image();
				img.src = imgEditData.src;
		    	img.width = imgEditData.width;
		    	img.height = imgEditData.height;
		    	img.loadOnce(function(){//loadOnce添加为alloyPhoto添加
		    		var that = this;
		    		try{
		    			AlloyImage(that).ps(type).replace(that);	
		    		}catch(e){
		    			alert(e);
		    		}
		    		filterImgs[type] = img.src;
		    		_self.changeBasePic(filterImgs[type]);
		    		loadBox.hide();
				});
			}
			else{
				_self.changeBasePic(filterImgs[type]);
			}
		}//end func
	}//end func

	/*********** 绑定事件 start ***********/	
	function img_addEvent(shell,canvas,layer){
		shell.off().on('pinch',{layer:layer,canvas:canvas},img_pinch).on('pinchmove',{layer:layer},img_pinchmove).on('pinchscale',{layer:layer},img_pinchscale).on('pinchrotate',{layer:layer},img_pinchrotate);
	}//end func
	
	//单指双指触控
	function img_pinchmove(e,xOffset,yOffset){
		var layer=e.data.layer;
   		layer.x+=xOffset;
		layer.y+=yOffset;

		if(layer.itouch){
			stk_position(layer);
		}
   	}//end func
   	
   	function img_pinchscale(e,scaleOffset){
   		var layer=e.data.layer;
   		layer.scale+=scaleOffset*0.8;
   		layer.scale=layer.scale<=imgScaleMin?imgScaleMin:layer.scale;
		layer.scale=layer.scale>=imgScaleMax?imgScaleMax:layer.scale;
		
		if(layer.itouch){
			stk_position(layer);
		}
   	}//end func
   	
   	function img_pinchrotate(e,rotateOffset){
   		var layer=e.data.layer;
   		layer.rotate+=rotateOffset;
		layer.rotate=layer.rotate>360?layer.rotate%360:layer.rotate;
		layer.rotate=layer.rotate<-360?-layer.rotate%360:layer.rotate;

		if(layer.itouch){
			stk_position(layer);
		}
   	}//end func
   
   	function stk_position(layer){
   		var oft = layer.width * 0.5 * layer.scale / jcanvasScale;

   		var r = oft / Math.cos(imath.toRadian(45));

   		oftX = r * Math.cos(imath.toRadian(45 - layer.rotate));
   		oftY = r * Math.sin(imath.toRadian(45 - layer.rotate));

   		stkRemoveBtn.css({
			top: layer.y / jcanvasScale - oftY - stkRemoveBtn.height()/2,
			left: layer.x / jcanvasScale + oftX - stkRemoveBtn.height()/2
		});
   	}//end func
	
	function img_pinch(e){
		var canvas=e.data.canvas;
		canvas.drawLayers();
	}//end func
	/*********** 绑定事件 end ***********/
	/******************************  私有的方法 end ************************************/	
}//end func
