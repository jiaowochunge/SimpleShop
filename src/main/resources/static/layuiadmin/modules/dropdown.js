/** layui-v2.2.6 MIT License By https://www.layui.com */
 ;layui.define("jquery",function(i){
	 var that, $ = layui.$,
	 n = layui.device(),
	 d = "dropdown",
	 t = ".layui-dropdown-menu",
	 r = "px",
	 a=n.android||n.ios?"click":"mouseover";

	 var Dropdown = function() { 
		 this.inst=null, this.currReElem=null
	 };
	 
	 var s = function(i) { 
		 if(l(i.target) && l(i.target.parentElement)&&l(i.target.parentElement.parentElement)){
			 that.hide();
		 }
	 },
	 
	 l = function(i){ 
		 return i && i.className.indexOf("layui-dropdown")==-1 && i.className.indexOf("layui-dropdown-menu")==-1
	 };
	 
	 Dropdown.prototype.hide=function(){ 
		 that && that.inst && that.inst.is(":visible") && (that.inst.removeClass("show").addClass("hide"), $("body").off(a, s))

	 },
	 
	 Dropdown.prototype.render=function(){ 
		 that=this,
		 $(".layui-dropdown").each(function(i,d){ 
			 var l=$(d);
			 l.data("id","dropdown-"+i),
			 a=n.android||n.ios?"click":"mouseover",
			 l[a] (function() {
			 		if(!that.inst || that.currReElem.data("id") != l.data("id") || that.currReElem.data("id") == l.data("id") && !that.inst.is(":visible")) {
			 			that.hide();
			 			var i=l.find(t)
			 			,n=l.offset().left-$(window).scrollLeft(),
			 			d=l.offset().top,
			 			u=(l.width(),l.height()),
			 			c=$(window).scrollTop(),
			 			w=d+u-c-2,
			 			f=i.width(),
			 			p=i.outerHeight(),
			 			h=l.width(),
			 			m=n+h,
			 			v=n+f>$(window).width(),
			 			y=d+u+p-c>$(window).height(),
			 			E={position:"fixed",top:w+r,left:n+r};
			 			v&&$.extend(!0,E,{left:m-f+r}),
			 			y&&$.extend(!0,E,{top:d-p-c+r}),
			 			i.removeClass("hide").addClass("show"),
			 			i.css(E).on("click","li",function() {
			 				that.hide()
			 			}),
			 			that.inst = i,
			 			that.currReElem=l,
			 			$("body").on(a,s);

			 		}
			 	});
		 });
	 };
	 
	var u=new Dropdown;
	
	u.render();
	
	$(window).scroll(function(){
		u.hide()
	}),
			 		
	i(d,u)
});