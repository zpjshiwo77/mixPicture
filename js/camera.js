var camera = function(){
	var _self = this;

	var loadBox=$('aside.loadBox'); 							//loading
	var imgShell=$('div.shell');								//编辑的画布容器
	var faceShell=$('div.shell');								//脸部识别的画布容器
	var scaleShell=$('#shellscale');							//缩放画布容器
	var filterShell=$("#shellFilter")							//滤镜图片容器
	var btnCamera=$('a.btnCamera');								//上传图片按钮
	var inputHt;												//输入框高度
	var imgCanvas,faceCanvas,scaleCanvas,filterCanvas,baseLayer,frameLayer,inputLayer;	//编辑的画布，脸部识别画布，缩放的画布（处理滤镜），基础图片对象，框架图片对象,文本框对象
	var filterArr = [];											//存储滤镜图片的数组
	var imgScaleMin=0.5,imgScaleMax=5,imgScaleTimer;				//最小缩放比例，最大缩放比例
    var fileInput;												//读取文件的对象
    var jcanvasScale=1;											//画布的缩放比例
    var imgSourceData={},imgEditData={},imgFilterData={};		//图片源数据，编辑图片的数据，滤镜图片数据
    var onload;													//上传图片完成后的回调方法
    var layerLast;												//存储当前贴纸对象
    var stickerNum = 0;											//贴纸的数量
    var stkRemoveBtn;											//移除贴纸的按钮
    var filterTime = 0;											//当前滤镜数量
    _self.clickFlag = false;									//贴纸是否能点击
    var textLayerArr = [];										//存储文本对象的数组
    var filterImgs = {};										//存储滤镜图片的对象

    //初始化
    _self.init = function(box,facebox,btn,Cbtn,scale,callback){
    	imgShell = box;
    	btnCamera = btn;
    	faceShell = facebox;
    	stkRemoveBtn = Cbtn;
    	jcanvasScale = scale;
    	inputHt = $("#main .confirm").height();
    	if(callback) onload = callback;
    	var iscale = 1.5;
    	if(os.android) iscale = 2;

    	fileInput=$('<input type="file" accept="image/*" name="imageInput" />').appendTo('body');
		fileInput.on('change',file_select);
		imgCanvas=$('<canvas></canvas>');
		faceCanvas=$('<canvas></canvas>');
		scaleCanvas=$('<canvas></canvas>');
		filterCanvas=$('<canvas></canvas>');
		creatCanvas(imgCanvas,imgShell,jcanvasScale);
		creatCanvas(faceCanvas,faceShell,jcanvasScale);
		creatCanvas(scaleCanvas,scaleShell,jcanvasScale);
		creatCanvas(filterCanvas,filterShell,iscale);
		btnCamera.off().on('touchend',btnCamera_click);

    }//end func

    function creatText (argument) {
    	imgCanvas.drawText({
		  layer: true,
		  name:'input',
		  fillStyle: '#fff',
		  fontStyle: 'bold',
//		  strokeStyle: '#fff',
//		  strokeWidth: 1,
		  fontSize: Math.floor(60*jcanvasScale),
		  text: '请输入您的宣言',
		  x: imgCanvas.width()*0.5, y: inputHt*0.5*jcanvasScale,
		  fromCenter: true,
		  visible:false
		}).drawLayers();
		inputLayer = imgCanvas.getLayer('input');
		// console.log(inputLayer);
    }

    //初始化
    _self.reset = function(){
    	stickerNum = 0;
    	filterTime = 0;
    	filterArr = [];
    	baseLayer = null;
    	frameLayer = null;
    	layerLast = null;
    	_self.clickFlag = false;
    	filterImgs = {};
    	imgShell.off();
    }//end func

    //新建canvas
    function creatCanvas(canvas,shell,scale){
    	canvas.attr({width:shell.width() * scale,height:shell.height() * scale,jcanvasScale:scale}).css({scale:1/scale}).prependTo(shell);
    	canvas[0].getContext("2d").imageSmoothingEnabled = true;
    }//end func

    //点击上传
    function btnCamera_click(e){
		fileInput.click();
	}//edn func

	//拍照或打开本地图片
	function file_select(e) {
		loadBox.show();
        var file = this.files[0];
        if (file) {
			ireader.read({ file: file, callback: function (resp,wd,ht) {
                if (resp){
                	imgSourceData={};
            		imgSourceData.src=resp;
            		imgSourceData.width=wd;
            		imgSourceData.height=ht;
            		_self.sourceImg = resp;

            		var faceOpts = {
						src:resp,
						wd: wd,
						ht: ht,
						clear: true,
						autoSize: true,
						touch: false,
						intangible: false,
						index:0,
						callback:function(){
	            			setTimeout(function(){
								_self.canvas_send(faceCanvas[0],onload,'loop_test');
							},1000);
	            		}
					};

					var baseOpts = {
						src:resp,
						wd: wd,
						ht: ht,
						clear: true,
						autoSize: true,
						touch: false,
						intangible: false,
						index:0,
						callback:function(){
	            			baseLayer=imgCanvas.getLayer("base");
	      //       			setTimeout(function(){
	      //       				// creatText();
							// 	_self.canvas_send(imgCanvas[0],function(src){
							// 		_self.baseImg = src;
							// 	},'loop_test');
							// },500);
	            		}
					};

					var scaleOpts = {
						src:resp,
						wd: wd,
						ht: ht,
						clear: true,
						autoSize: true,
						touch: false,
						intangible: false,
						index:0
					};

					var filterOpts = {
						src:resp,
						wd: wd,
						ht: ht,
						clear: true,
						autoSize: true,
						touch: false,
						intangible: false,
						index:0
					};

            		_self.img_creat("facePic",faceCanvas,faceOpts);

            		_self.img_creat("base",imgCanvas,baseOpts);

            		_self.img_creat("scale",scaleCanvas,scaleOpts);

            		_self.img_creat("filterPic",filterCanvas,filterOpts);
                }//edn if
                else loadBox.hide();
            }});
        }//end if
        else loadBox.hide();
    }//end select

    //canvas转图片
    _self.canvas_send = function(canvas,callback,secretkey,type){
		type=type||'jpg';
		loadBox.show();
		if(type=='png'){
			var src=canvas.toDataURL();
			var data=src.split(",")[1];
		}//edn if
		else{
			var src=canvas.toDataURL('image/jpeg', 0.8);
			var data=src.split(",")[1];
		}//end else
		 _self.base64_send(data,callback,secretkey);
	}//end func

    //转换base64类型的图片
    _self.base64_send = function(data,callback){
    	loadBox.show();
		$.post('http://upload.be-xx.com/upload', { data: data, key: 'loop_test' }, function (resp) {
			callback(resp);
        });
    }//end func

    //复制图片至canvas
	_self.img_creat = function(name,canvas,opts){
		var options = {
			src:"images/lottery/default.jpg",
			wd:100,
			ht:100,
			x:canvas.width()*0.5,
			y:canvas.height()*0.5,
			clear:false,
			autoSize:false,
			touch:false,
			intangible:false,
			fromCenter:true,
			index:10
		};
		options =  $.extend(options,opts);

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
		  index:options.index,
		  intangible:options.intangible,
		  touchstart:layer_touchstart,
		  itouch:options.touch
		})
		.drawLayers();
		if(options.callback) options.callback();
	}//end func

	//画一个背景
	_self.drawBg = function(){
		imgCanvas.addLayer({
		  type: 'rectangle',
		  index: 0,
		  fillStyle: '#fff',
		  x: 0, y: 0,
		  width: imgCanvas.width() * jcanvasScale, height: imgCanvas.height() * jcanvasScale
		})
		.drawLayers();
	}//end func

	//创建二维码
	_self.creatCode = function(name,options){
		var opts = {
			x:0,
			y:0,
			clear: false,
			autoSize: false,
			touch: false,
			intangible: true,
			fromCenter:false,
			index:999,
		};
		opts =  $.extend(opts,options);
		_self.img_creat(name,imgCanvas,opts);
	}//end func

	//创建边框
	_self.creatFrame = function(src,w,h){
		var opts = {
			src: src,
			wd: w * jcanvasScale,
			ht: h * jcanvasScale,
			x:0,
			y:0,
			clear: false,
			autoSize: false,
			touch: false,
			intangible: true,
			fromCenter:false,
			index:999,
			callback:function(){
				frameLayer = imgCanvas.getLayer("frame");
			}
		};
		if(frameLayer) imgCanvas.removeLayer(frameLayer);
		_self.img_creat("frame",imgCanvas,opts);
	}//end func

	//设置封面透明
	_self.frameTransparent = function(num){
		if(frameLayer){
			frameLayer.opacity = num;
			imgCanvas.drawLayers();
		}
	}//end func

	//绑定基础图片的事件
	_self.setBaseEvent = function(){
		imgScaleMin = 0.5;
		img_addEvent(imgShell,imgCanvas,imgCanvas.getLayer("base"));
	}//end func

	//绑定贴纸的事件
	_self.setStickerEvent = function(){
		img_addEvent(imgShell,imgCanvas,imgCanvas.getLayer("s"+stickerNum));
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
		// _self.setStickerEvent();
	}//end func

	//移除当前sticker
	_self.removeSticker = function(){
		imgCanvas.removeLayer(layerLast).drawLayers();
		layerLast=null;
		stickerNum--;
		stkRemoveBtn.hide();
	}//end func

	//点击事件
	function layer_touchstart(layer){
		if(layer.itouch && _self.clickFlag){
			if(layerLast && layerLast!=layer){
		  		$(this).moveLayer(layerLast, 1);
		  	}
		  	$(this).moveLayer(layer, stickerNum).drawLayers();
			layerLast=layer;
			stk_position(layer);
			stkRemoveBtn.show();
			imgScaleMin = 0.5;
			img_addEvent(imgShell,$(this),layer);
		}
	}//edn func

	//改变基础图片的源
	_self.changeBasePic = function(src){
		baseLayer.source = src;
		imgCanvas.drawLayers();
	}//end func

	//新建滤镜
	_self.creatFilter = function(arr,callback){
		imgEditData = {};
		imgEditData.src = scaleCanvas.getCanvasImage('jpeg',0.5);
    	imgEditData.width = scaleCanvas.width();
    	imgEditData.height = scaleCanvas.height();

    	_self.creatFilterBasePic();
    	filterImgs["原图"] = imgFilterData.src;
    	for (var i = 0; i < arr.length; i++) {
    		filterImgs[arr[i]] = "";
    	};

		filterArr = [imgEditData];
		filterTime = arr.length;
		getFilterImg(arr,callback);
	}//end func

	//获取滤镜处理后的图片
	function getFilterImg(arr,callback){
		var img = new Image();
    	img.src = imgEditData.src;
    	img.width = imgEditData.width;
    	img.height = imgEditData.height;
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

	//改变滤镜
	_self.changeFilter = function(type){
		if(filterImgs[type] == ""){
			icom.fadeIn(loadBox);
			var img = new Image();
			img.src = imgFilterData.src;
	    	img.width = imgFilterData.width;
	    	img.height = imgFilterData.height;
	    	img.loadOnce(function(){//loadOnce添加为alloyPhoto添加
	    		var that = this;
	    		try{
	    			AlloyImage(that).ps(type).replace(that);	
	    		}catch(e){
	    			alert(e);
	    		}
	    		filterImgs[type] = img.src;
	    		_self.changeBasePic(filterImgs[type]);
	    		icom.fadeOut(loadBox);
			});
		}
		else{
			_self.changeBasePic(filterImgs[type]);
		}
	}//end func

	//新创建滤镜基础图片
	_self.creatFilterBasePic = function(){
		imgFilterData = {};
    	imgFilterData.src = filterCanvas.getCanvasImage('jpeg',1);
    	imgFilterData.width = filterCanvas.width();
    	imgFilterData.height = filterCanvas.height();

    	var baseOpts = {
			src:imgFilterData.src,
			wd: imgFilterData.width,
			ht: imgFilterData.height,
			clear: true,
			autoSize: true,
			touch: false,
			intangible: false,
			index:0,
			callback:function(){
    			baseLayer=imgCanvas.getLayer("base");
    		}
		};

		_self.img_creat("base",imgCanvas,baseOpts);
	}//end func

	//新增text文本
	_self.setText = function(text,opts){
		// console.log(inputLayer);
		inputLayer.text = text;
		inputLayer.fillStyle = opts.color;
		inputLayer.fontSize = opts.size * jcanvasScale + "px";
		inputLayer.x = imgCanvas.width()*0.5 + opts.ofts[0] * jcanvasScale;
		inputLayer.y = (opts.ofts[1] + inputHt/2) * jcanvasScale;	
		inputLayer.visible = true;
		if(opts.fontStyle) inputLayer.fontStyle = opts.fontStyle;
		if(opts.shadow){
			inputLayer.shadowBlur = opts.shadow.blur;
			inputLayer.shadowColor = opts.shadow.color;
			inputLayer.shadowX = opts.shadow.x;
			inputLayer.shadowY = opts.shadow.y;			
		}
		imgCanvas.moveLayer(inputLayer, 1000).drawLayers();
	}//end func

	//添加一个文本
	_self.addTextLayer = function(text,opts){
		var num = textLayerArr.length;

		imgCanvas.drawText({
		  layer: true,
		  name:'input'+num,
		  fillStyle: opts.color,
		  fontStyle: opts.fontStyle,
		  fontSize: opts.size * jcanvasScale,
		  text: text,
		  x: opts.x * jcanvasScale, y: opts.y * jcanvasScale + inputHt/2,
		  fromCenter: false,
		  shadowBlur: opts.shadow.blur,
		  shadowColor: opts.shadow.color,
		  shadowX: opts.shadow.x,
		  shadowY: opts.shadow.y
		}).drawLayers();

		textLayerArr.push(imgCanvas.getLayer('input'+num));
		// console.log(textLayerArr);
	}//end func

	//移除所有文本
	_self.removeTextLayer = function(){
		for (var i = 0; i < textLayerArr.length; i++) {
			imgCanvas.removeLayer(textLayerArr[i]);
		};
		imgCanvas.drawLayers();
		textLayerArr = [];
	}//end func

	//隐藏文本
	_self.setTextHide = function(){
		inputLayer.visible = false;
		imgCanvas.drawLayers();
	}//end func

/**************************事件 start*******************************/
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
/**************************事件 end*******************************/

}//end func

var icamera = new camera();