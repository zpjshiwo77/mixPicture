# mixPicture
基于jcanvas.js封装的图片合成插件

# 资源文件说明
	|css
		* common.css											规定一些基本样式的css
		* index.css												页面demo的css
	|images														demo图片的文件夹
	|js
		|widget													一些插件
			* alloyimage.1.1.js 								滤镜处理插件
			* jcanvas.js 										图片处理插件
			* jquery.js 										jquery插件
			* math.js 											集合了一些计算方法
			* pinch.js 											扩展了一些双指触控事件
			* reader.js 										文件读取插件
		* camera.js 											图片合成的最主要的js,继承了一些图片合成的方法
		* index.js 												demo的js
	* index.html 												demo页面

# 使用说明

新建一个对象 var iCamera = camera();

对象的属性：
	
	* iCamera.sourceImg											上传图片的base64源文件（base图片）
    * iCamera.photoCanvas;										合成图片画布的基础canvas对象（jquery对象）
    * iCamera.stkClick											是否允许贴纸的click事件（bool）
							
对象的方法：

	* iCamera.init(box,options)									初始化的方法
		* box													照片合成的容器（必须）
		* options					
			* scale:1,											缩放比例，影响清晰度和效率（选填）
    		* filter:false,										是否使用滤镜（选填）
    		* loadBox:$("#loading"),							loading的jquery对象（必须）
    		* stkRemoveBtn:$("#stkRemoveBtn"),					移除贴纸的btn（选填）
    		* onUpload:function(img){} 							读取完图片后的回调方法，会返回上传图片的base64格式的原图片（选填）

    * iCamera.reset()  											编辑工具重置的方法

    * iCamera.changeBasePic(src) 								修改底图的照片
    	* src 													图片地址（必须）

    * iCamera.setBaseEvent(min,max) 							底图是否绑定手指的触碰事件
    	* min 													最小缩放比例（选填，默认值0.5）
    	* max													最大缩放比例（选填，默认值5）

    * iCamera.creatFilter(arr,callback)							创建滤镜的方法（初始化时，filter为true才会提供这个方法）
    	* arr													滤镜的类型，数组形式，可选类型详见：http://alloyteam.github.io/AlloyPhoto/docs.html
    	* callback												创建完成的回调函数，会返回一个数组（滤镜预览的图片地址）

    * iCamera.changeFilter(type)								切换了滤镜的方法
    	* type 													滤镜类型，只能传入创建时的滤镜类型之一（包括原图）

    * iCamera.img_creat(name,canvas,options)					向画布里面新加入一张图片的方法
    	* name 													这张图片的名称（必须，重复名称会移除前一张图片，基础图片名称base，贴纸名称s0、s1...根据贴纸数量）
    	* canvas 												画布的jqeury对象（选填，默认当前canvas）
    	* options
    		* src:"images/default.jpg",							图片地址（必须）
			* wd:canvas.width(),								图片高度（选填）
			* ht:canvas.height(),								图片宽度（选填）
			* x:canvas.width()*0.5,								图片坐标x（选填）
			* y:canvas.height()*0.5,							图片坐标Y（选填）
			* clear:false,										是否清除当前画布（选填）
			* autoSize:true,									是否自适应画布（选填）
			* touch:false,										是否能被点击（选填）
			* intangible:false,									是否能点击穿透（选填）
			* fromCenter:true,									坐标初始点是否居中（选填）
			* index:10											图片的前后位置，越大越前（选填）

	* iCamera.addSticker(src,size)								添加贴纸的方法
		* src  													图片地址（必须）
		* size 													图片大小（必须，数组类型，第一位为宽，第二位为高）

	* iCamera.removeSticker()									移除当前贴纸的方法，若初始化时，规定了移除贴纸的btn，则btn会自带这个事件

	* iCamera.removeLayer(name)									移除layer对象的方法（包括图片对象和文本对象）
		* name 													图片的名称（必须）

	* iCamera.addTextLayer(name,text,options)					添加文本的方法
		* name													文本的名称（必须）
		* text 													文本的内容（必须）
		* options 												
			* color:"#333",										字体的颜色（选填）
			* fontStyle:"normal",								字体的粗细（选填）
			* fontSize: 24,										字体的大小（选填）
			* x:0,												字体的位置x（选填）
			* y:0,												字体的位置y（选填）
			* align:"left",										对齐方式（选填）
			* lineHeight:1.2,									行高（选填）
			* maxNum:100,										一行最大数量（选填）
			* index:1000,										显示的前后位置，越大越前（选填）
			* shadow:{											字体的阴影（选填）
				  x:0,											阴影x偏移量（选填）
				  y:0,											阴影y偏移量（选填）
				  blur:0,										阴影模糊值（选填）
				  color:"#fff"									影音颜色（选填）
			  }

	* iCamera.canvasTrfImg(options)								canvas转图片
		* options
			* type 												图片那类型，默认jpg
			* quality											图片质量，类型为jpg时才有用，可选值0-1
			* secretkey											保存在服务器的文件夹，默认值loop_test
			* callback											转换成功后的回调函数，会返回合成图片的地址