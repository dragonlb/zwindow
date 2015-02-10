(function ($){
	var jsPath=document.scripts;
	jsPath=jsPath[jsPath.length-1].src.substring(0,jsPath[jsPath.length-1].src.lastIndexOf("/")+1);

	var Sys = {};
	Sys.ua = navigator.userAgent.toLowerCase();
	window.ActiveXObject ? Sys.ie = (Sys.ua.match(/msie ([\d.]+)/)?Sys.ua.match(/msie ([\d.]+)/)[1]:0) :0;
    document.getBoxObjectFor ? Sys.firefox = (Sys.ua.match(/firefox\/([\d.]+)/)?Sys.ua.match(/firefox\/([\d.]+)/)[1]:0) :0;
    window.MessageEvent && !document.getBoxObjectFor ? Sys.chrome = (Sys.ua.match(/chrome\/([\d.]+)/)?Sys.ua.match(/chrome\/([\d.]+)/)[1]:0) :0;
    window.opera ? Sys.opera = (Sys.ua.match(/opera.([\d.]+)/)?Sys.ua.match(/opera.([\d.]+)/)[1]:0) :0;
    window.openDatabase ? Sys.safari = (Sys.ua.match(/version\/([\d.]+)/)?Sys.ua.match(/version\/([\d.]+)/)[1]:0): 0;

	
	var dataKey = {
		prefix_main: '_zwindow_',
		suffix_bg: '_bg',
		idx:	'_idx',
		initSetting: '_initSetting',
		windowData: '_window_data'
	};
	
	$.zWindow = {};
	
	/***********************************  zWindow [ jQuery plugin ]  ****************************************
	 *   Author: 	Lb
	 *	 Date:		2012-12-03
	*/
	$.zWindow.open = function(options){
		var setting = $.extend({
			theme		: 	'default',
			renderTo	: 	false,
			windowId	: 	getUUID(),
			isMode		: 	false,
			height		: 	300,
			width		: 	200,
			titleWidth	:	200,
			top			:	false,
			left		:	false,
			windowBg	:	true,
			windowType	: 	"iframe",	// iframe  div  text
			windowSrc	: 	"",
			windowDiv	:	"",
			beforeClose	:	false,
			afterClose	:	false,
			moveable	: 	true,
			titleable	: 	true,
			title		:	"",
			resizeable	:	true,
			windowBtn	:	['min', 'max', 'close'],
			display		: 	'cn',
			css			: 	'yellow',
			border		:	1,
			targetWindow: 	false
		}, options);
		
		function getUUID(){
			var date = new Date();
			return ""+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds()+date.getMilliseconds();
		}
		
		var css = {
				yellow: {
					page: 'zTablePageYellow',
					result: 'resultDivYellow',
					current: 'currentYellow',
					current_: 'currentYellow_',
					next: 'nextYellow',
					prev: 'prevYellow'},
				blue:{
					page: 'zTablePageBlue',
					result: 'resultDivBlue',
					current: 'currentBlue',
					current_: 'currentBlue_',
					next: 'nextBlue',
					prev: 'prevBlue'},
				contentMain:	'zwindow_contentmain',
				contentMainNoBg:	'zwindow_contentmain_nobg'
		};
		
		//HTML model text
		var models = {
			background 	:	"<div class='zwindow_bg' ></div>",
			pannel		:	"<div class='zwindow_pannel'></div>",
			content		:	"<div class='zwindow_content'></div>",
			titleBar	:	"<div class='zwindow_titleBar'></div>",
			tBtnBar		:	"<div class='zwindow_titleButtonBar'></div>",
			minBtn		:	"<div class='zwindow_action_button zwindow_min'></div>",
			maxBtn		:	"<div class='zwindow_action_button zwindow_max'></div>",
			closeBtn	:	"<div class='zwindow_action_button zwindow_close'></div>",
			title		:	"<div class='zwindow_title titleText'></div>",
			contentMain	:	"<div class='zwindow_contentmain'></div>",
			resize		:	{
				top			:	"<div class='zwindow_resize_t'></div>",
				right		:	"<div class='zwindow_resize_r'></div>",
				bottom		:	"<div class='zwindow_resize_b'></div>",
				left		:	"<div class='zwindow_resize_l'></div>",
				left_top	:	"<div class='zwindow_resize_lt'></div>",
				left_bottom	:	"<div class='zwindow_resize_lb'></div>",
				right_top	:	"<div class='zwindow_resize_rt'></div>",
				right_bottom:	"<div class='zwindow_resize_rb'></div>"
			},
			
			iframe			: 	'<iframe id="zwindow-frame{rnd}" name="zwindow-frame{rnd}" class="zwindow-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" ></iframe>'
		};
		
		function getWindow(){
//			if(setting.targetWindow){
//				return setting.targetWindow;
//			}
			return window;
		}
		
		function getDocument(){
//			if(setting.targetWindow){
//				return setting.targetWindow.document;
//			}
			return window.document;
		}
		
		function createDom(){
			var ZW = {};
			var maxIdx = ($.zWindow.getMaxOne()?$.zWindow.getMaxOne().attr(dataKey.idx):1);
			ZW.idx = (maxIdx?maxIdx:1);
			createBgDiv(ZW);
			createPannel(ZW);
			ZW.content = $(models.content);
			createTitle(ZW);
			createContentMain(ZW);
			createResizeable(ZW);
			
			bindResizeEvent(ZW);
			$(getDocument().body).append(ZW.background);
			$(getDocument().body).append(ZW.pannel);
			return ZW;
		};
		
		function createContentMain(ZW){
			ZW.contentMain = $(models.contentMain).height(setting.height-(ZW.titleBar?ZW.titleBar.height():0));
			if(!setting.windowBg)	ZW.contentMain.removeClass( css.contentMain ).addClass( css.contentMainNoBg );
			ZW.content.append(ZW.contentMain);
			ZW.pannel.append(ZW.content);
			if(setting.windowType=='iframe'){
				ZW.iframe = $(models.iframe.replace(/\{rnd\}/g, new Date().getTime()));
				ZW.iframe.attr("src", setting.windowSrc);
				ZW.iframe.appendTo(ZW.contentMain);
				ZW.iframe.load(function(){
					ZW.contentMain.removeClass("zwindow_contentmain");
				});
			}
			else if(setting.windowType=='div'){
				if(setting.windowDiv)	setting.windowDiv.clone().removeAttr("id").show().appendTo(ZW.contentMain);
			}
		};
		
		function createResizeable(ZW){
			if(!setting.resizeable){
				return;
			}
			ZW.resize = {};
			ZW.resize.top = $(models.resize.top).appendTo(ZW.pannel);
			ZW.resize.right = $(models.resize.right).appendTo(ZW.pannel);
			ZW.resize.bottom = $(models.resize.bottom).appendTo(ZW.pannel);
			ZW.resize.left = $(models.resize.left).appendTo(ZW.pannel);
			ZW.resize.left_top = $(models.resize.left_top).appendTo(ZW.pannel);
			ZW.resize.left_bottom = $(models.resize.left_bottom).appendTo(ZW.pannel);
			ZW.resize.right_top = $(models.resize.right_top).appendTo(ZW.pannel);
			ZW.resize.right_bottom = $(models.resize.right_bottom).appendTo(ZW.pannel);
		};
		
		function resizeJDom(ZW, jDom, top, left, dimensionX, dimensionY){
			jDom.unbind("mousedown").bind("mousedown", function(e){
				var d = {
					top: top,
					left: left,
					dimensionX: dimensionX,
					dimensionY: dimensionY,
					x: e.pageX,
					y: e.pageY,
					jResizeDomTop: [ZW.pannel.position().top, ZW.contentMain.position().top],
					jResizeDomLeft: [ZW.pannel.position().left, ZW.contentMain.position().left],
					jResizeDomsX:[ZW.pannel.width(), ZW.contentMain.width()],
					jResizeDomsY:[ZW.pannel.height(), ZW.contentMain.height()],
					jResizeDoms: [ZW.pannel]
				};
				$(getDocument()).bind("mouseup", d, function(){
					$(getDocument()).css("cursor", "default");
					if(ZW.iframe && ZW.iframe.css("display")=='none'){
						ZW.iframe.css("display", "block");
						ZW.contentMain.removeClass("zwindow_contentmain");
					}
					$(getDocument()).unbind("mousemove").unbind("mouseup");
				});
				$(getDocument()).bind("mousemove", d, function(e1){
					$(getDocument()).css("cursor", "move");
					if(ZW.iframe && (d.dimensionX || d.dimensionY)){
						ZW.iframe.css("display", "none");
						ZW.contentMain.addClass("zwindow_contentmain");
					}
					$.each(e1.data.jResizeDoms, function(i, jdom){
						var top = e1.data.jResizeDomTop[i]?e1.data.jResizeDomTop[i]:e1.data.jResizeDomTop[0];
						var left = e1.data.jResizeDomLeft[i]?e1.data.jResizeDomLeft[i]:e1.data.jResizeDomLeft[0];
						top = top+e1.pageY-e1.data.y;
						left = left+e1.pageX-e1.data.x;
						var x = e1.data.jResizeDomsX[i]?e1.data.jResizeDomsX[i]:e1.data.jResizeDomsX[0];
						var y = e1.data.jResizeDomsY[i]?e1.data.jResizeDomsY[i]:e1.data.jResizeDomsY[0];
						if(e1.data.top){
							jdom.css("top", top<0?0:top);
							y = y-(e1.pageY-e1.data.y);
							refreshSetting(ZW, {top: top?0:top});
						}
						else{
							y = y+(e1.pageY-e1.data.y);
						}
						if(e1.data.left){
							jdom.css("left", left<0?0:left);
							x = x-(e1.pageX-e1.data.x);
							refreshSetting(ZW, {left: left<0?0:left});
						}
						else{
							x = x+(e1.pageX-e1.data.x);
						}
						if(e1.data.dimensionX){
							jdom.width(x);
							refreshSetting(ZW, {width: x});
						}
						if(e1.data.dimensionY){
							jdom.height(y);
							refreshSetting(ZW, {height: y});
						}
					});
				});
			});
		}
		
		function createTitle(ZW){
			if(!setting.titleable){
				return;
			}
			ZW.titleBar = $(models.titleBar).height(30);
			if(setting.windowBtn){
				ZW.tBtnBar = $(models.tBtnBar);
				$.each(setting.windowBtn, function(i, btn){
					if(btn=='min'){
						ZW.minBtn = $(models.minBtn);
						ZW.tBtnBar.append(ZW.minBtn);
					}
					else if(btn=='max'){
						ZW.maxBtn = $(models.maxBtn);
						ZW.tBtnBar.append(ZW.maxBtn);
					}
					else if(btn=='close'){
						ZW.closeBtn = $(models.closeBtn);
						ZW.tBtnBar.append(ZW.closeBtn);
					}
				});
				ZW.titleBar.append(ZW.tBtnBar);
				if(setting.moveable){
					resizeJDom(ZW, ZW.titleBar, true, true, false, false);
				}
			}
			ZW.title = $(models.title).width(setting.titleWidth);
			if(setting.title){
				ZW.title.text(setting.title);
			}
			ZW.titleBar.append(ZW.title);
			ZW.content.append(ZW.titleBar);
		};
		
		function resizeToMin(ZW, jDom, eventSt){
			jDom.unbind(eventSt).bind(eventSt, function(e){
				ZW.pannel.height(ZW.titleBar.height());
				ZW.pannel.width(ZW.titleBar.width());
			});
		}
		

		function resizeToMax(ZW, jDom, eventSt){
			var d = {
				zw: ZW,
				dataKey: dataKey
			};
			jDom.unbind(eventSt).bind(eventSt, d, function(e){
				var $window = $(getWindow());
				var $zw = e.data.zw;
				var initSetting = $zw.pannel.data(e.data.dataKey.initSetting);
				if($zw.pannel.height()<=$zw.titleBar.height()
					|| $zw.pannel.height() == $window.height()-initSetting.border*2
				){	//恢复大小
					$zw.pannel.css("top", initSetting.top);
					$zw.pannel.css("left", initSetting.left);
					$zw.pannel.height(initSetting.height);
					$zw.pannel.width(initSetting.width);
					$.each($zw.resize, function(i, resizeBo){
						if(resizeBo.css("display")=="none"){
							resizeBo.css("display", "block");
						}
					});
				}
				else{
					$zw.pannel.css("top", 0);
					$zw.pannel.css("left", 0);
					$zw.pannel.height($window.height()-initSetting.border*2);
					$zw.pannel.width($window.width());
					$.each($zw.resize, function(i, resizeBo){
						resizeBo.css("display", "none");
					});
				}
			});
		}
		
		function createPannel(ZW){
			ZW.pannel = $(models.pannel);
			var $document = $(getDocument());
			if(setting.width>$document.width()){
				setting.width = $document.width();
			}
			if(setting.height>$document.height()){
				setting.height = $document.height();
				
			}
			ZW.pannel.data(dataKey.initSetting, setting);
			ZW.pannel.attr(dataKey.idx, ZW.idx);
			ZW.pannel.css("width", setting.width);
			ZW.pannel.css("height", setting.height);
			ZW.pannel.attr("id", dataKey.prefix_main+setting.windowId);

			var scrollTop = getDocument().documentElement.scrollTop || getWindow().pageYOffset || getDocument().body.scrollTop;
			var scrollLeft = getDocument().documentElement.scrollLeft || getWindow().pageXOffset || getDocument().body.scrollLeft;
			if(setting.top){
				ZW.pannel.css("top", setting.top);
			}
			else{
				var top = (getWindowHeight()-setting.height)/2;
				top = top<0?0:top;
				top += scrollTop;
				ZW.pannel.css("top", top);
				refreshSetting(ZW, {top: top});
			}
			if(setting.left){
				ZW.pannel.css("left", setting.left);
			}
			else{
				var left = (getWindowWidth()-setting.width)/2;
				left = left<0?0:left;
				left += scrollLeft;
				ZW.pannel.css("left", left);
				refreshSetting(ZW, {left: left});
			}
		};
		
		function getWindowWidth(){
			var retNo = 0;
			if(Sys.ie){
				if (getWindow().innerWidth){
					retNo = getWindow().innerWidth;
				}
				else if ((getDocument().body) && (getDocument().body.clientWidth)){
					retNo = getDocument().body.clientWidth;
				}
				if (getDocument().documentElement && getDocument().documentElement.clientWidth){
					retNo = getDocument().documentElement.clientWidth;
				}
			}
			else if(Sys.chrome){
				retNo = $(getDocument().body).width();
			}
			else{
				retNo = $(getDocument().body).width();
			}
			return retNo;
		}
		
		function getWindowHeight(){
			var retNo = 0;
			if(Sys.ie){
				if (getWindow().innerHeight){
					retNo = getWindow().innerHeight;
				}
				else if ((getDocument().body) && (getDocument().body.clientHeight)){
					retNo = getDocument().body.clientHeight;
				}
				if (getDocument().documentElement && getDocument().documentElement.clientHeight)
				{
					retNo = getDocument().documentElement.clientHeight;
				}
			}
			else if(Sys.chrome){
				retNo = $(getDocument().body).height();
			}
			else{
				retNo = $(getDocument().body).height();
			}
			return retNo;
		}
		
		function refreshSetting(ZW, newSetting){
			var oriSetting = ZW.pannel.data(dataKey.initSetting);
			var aimSetting = $.extend(oriSetting, newSetting);
			ZW.pannel.data(dataKey.initSetting, aimSetting);
		}
		
		function createBgDiv(ZW){
			var $document = $(getDocument());
			ZW.background = $(models.background);
			ZW.background.attr("id", dataKey.prefix_main+setting.windowId+dataKey.suffix_bg);
			ZW.background.css("height", $document.height());
			ZW.background.css("width", $document.width());
			if(setting.isMode){
				ZW.background.css("display", "block");
			}
			else{
				ZW.background.css("display", "none");
			}
		};
		
		function bindResizeEvent(ZW){
			if(setting.resizeable){
				resizeJDom(ZW, ZW.resize.top, true, false, false, true);
				resizeJDom(ZW, ZW.resize.right, false, false, true, false);
				resizeJDom(ZW, ZW.resize.bottom, false, false, false, true);
				resizeJDom(ZW, ZW.resize.left, false, true, true, false);
				resizeJDom(ZW, ZW.resize.left_top, true, true, true, true);
				resizeJDom(ZW, ZW.resize.left_bottom, false, true, true, true);
				resizeJDom(ZW, ZW.resize.right_top, true, false, true, true);
				resizeJDom(ZW, ZW.resize.right_bottom, false, false, true, true);
			}
			if(ZW.minBtn){
				resizeToMin(ZW, ZW.minBtn, 'click');
			}
			if(ZW.maxBtn){
				resizeToMax(ZW, ZW.maxBtn, 'click');
			}
			if(ZW.titleBar){
				resizeToMax(ZW, ZW.titleBar, 'dblclick');
			}
			if(ZW.closeBtn){
				var d = ZW;
				ZW.closeBtn.unbind("click").bind("click", d, function(e){
					$.zWindow.close();
				});
			}
		}
		
		function loadCss(){
			var cssId = "ui-zWindow-css-load";
			var cssTag = getDocument().getElementById(cssId);
			if (cssTag) {
		    	return this;
		    }
			var theme = "default";
			if (setting.theme){
				if( setting.theme.charAt(setting.theme.length -1)=="/"){
					theme = setting.theme.substring(0,setting.theme.length -1);
				}else{
					theme = setting.theme;
				}
			}

			var cssfile = "../css/"+theme+"/zWindow.css";
			var head = getDocument().getElementsByTagName('head').item(0);
			var css = getDocument().createElement('link');
			css.href = jsPath + cssfile;
			css.rel = 'stylesheet';
			css.type = 'text/css';
			css.id = cssId;
			head.appendChild(css);	
		}
		
		loadCss();
		return createDom();
		
	};
	
	$.zWindow.getMaxOne = function (){
		var zwindows = $("[id^='"+dataKey.prefix_main+"']");
		if(!zwindows || zwindows.length<=0)	zwindows = top.$("[id^='"+dataKey.prefix_main+"']");
		var maxIdx = 0;
		var retJdom = undefined;
		$.each(zwindows, function(i, item){
			var jWindow = $(item);
			var jIdx = (jWindow.attr(dataKey.idx)?0:jWindow.attr(dataKey.idx));
			if(maxIdx<=jIdx){
				maxIdx = jIdx;
				retJdom = jWindow;
			}
		});
		return retJdom;
	};
	
	$.zWindow.close = function(data){
		var closeDom = $.zWindow.getMaxOne();
		$.zWindow._close(closeDom, data);
	};
	
	$.zWindow.close2 = function(zId, data){
		var closeDom = $("#"+dataKey.prefix_main+zId);
		$.zWindow._close(closeDom, data);
	}
	
	$.zWindow._close = function(jDom, data){
		var closeDom = jDom;
		if(closeDom){
			var dataSetting = closeDom.data(dataKey.initSetting);
			var bgId = closeDom.attr("id")+dataKey.suffix_bg;
			if( dataSetting && dataSetting.beforeClose!=undefined && (typeof dataSetting.beforeClose=="function")){
				var canClose = dataSetting.beforeClose.call(this, data);
				if( !canClose ){
					return;
				}
			}
			closeDom.css("hidden", "none");
			var bgDom = $("#"+bgId);
			if(!bgDom || bgDom.length<=0) bgDom = top.$("#"+bgId);
			if(bgDom){
				bgDom.remove();
			}
			if(dataSetting && dataSetting.afterClose && (typeof dataSetting.afterClose=="function")){
				dataSetting.afterClose.call(this, data);
			}
			closeDom.remove();
		}
	};
	
	$.zWindow.busy = function(data){
		var closeDom = $.zWindow.getMaxOne();
		if(closeDom){
			//var dataSetting = closeDom.data(dataKey.initSetting);
			//var bgId = closeDom.attr("id")+dataKey.suffix_bg;
			closeDom.find("iframe").css("display", "none");
		}
	};
	
	$.zWindow.free = function(data){
		var closeDom = $.zWindow.getMaxOne();
		if(closeDom){
			//var dataSetting = closeDom.data(dataKey.initSetting);
			//var bgId = closeDom.attr("id")+dataKey.suffix_bg;
			closeDom.find("iframe").css("display", "block");
		}
	};
	
	$.fn.zWindow = function(options){
		$.zWindow.open(options);
	};
	
})(jQuery);