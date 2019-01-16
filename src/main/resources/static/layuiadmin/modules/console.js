/**

 @Name：layuiAdmin 主页控制台
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：GPL-2

 */
layui.define(function(exports){

  //区块轮播切换
  layui.use(['admin', 'carousel'], function(){
    var $ = layui.$
    ,admin = layui.admin
    ,carousel = layui.carousel
    ,element = layui.element
    ,device = layui.device();

    //轮播切换
    $('.layadmin-carousel').each(function(){
      var othis = $(this);
      carousel.render({
        elem: this
        ,width: '100%'
        ,arrow: 'none'
        ,interval: othis.data('interval')
        ,autoplay: othis.data('autoplay') === true
        ,trigger: (device.ios || device.android) ? 'click' : 'hover'
        ,anim: othis.data('anim')
      });
    });

    element.render('progress');

  });

  // 我的
  layui.use([], function() {
    var $ = layui.$;

    function getPersonalData() {
      $.ajax({
        url: '/home/personal-data'
        ,method: 'get'
        ,dataType: 'json'
      }).done(function(data){
        if (data.code == 0) {
          $('#deviceCount').html(data.data.device);
          $('#lessonCount').html(data.data.lesson);
        }
      });
    }

    // 一分钟轮询一次数据
    setInterval(function() {
      getPersonalData();
    }, 60000);
    getPersonalData();
  });

  //数据概览
  layui.use(['carousel', 'echarts'], function(){
    var $ = layui.$
    ,carousel = layui.carousel
    ,echarts = layui.echarts;

    var echartsApp = [], options = [
      //今天在线设备
      {
        title: {
          text: '今天在线设备',
          x: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip : {
          trigger: 'axis'
        },
        legend: {
          data:['','']
        },
        xAxis : [{
          type : 'category',
          boundaryGap : false,
          data: timeListDayString //X轴数据
        }],
        yAxis : [{
          type : 'value'
        }],
        series : [{
          name:'在线设备数',
          type:'line',
          smooth:true,
          itemStyle: {normal: {areaStyle: {type: 'default'}}},
          data: onlineCountListDayString //Y轴数据
        }]
      },
      //分公司设备分布
      /*{
        title : {
          text: '分公司设备分布',
          x: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient : 'vertical',
          x : 'left',
          data:['Chrome','Firefox','IE 8.0','Safari','其他']
        },
        series : [{
          name:'访问来源',
          type:'pie',
          radius : '55%',
          center: ['50%', '50%'],
          data:[
            {value:9052, name:'成都分工'},
            {value:1610, name:'北京分公司'},
            {value:3200, name:'西安分公司'},
            {value:535, name:'海南分公司'},
            {value:1700, name:'福建分公司'}
          ]
        }]
      },
      //最近一周设备使用数量
      {
        title: {
          text: '最近一周设备使用次数',
          x: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip : { //提示框
          trigger: 'axis',
          formatter: "{b}<br>新增用户：{c}"
        },
        xAxis : [{ //X轴
          type : 'category',
          data : ['11-07', '11-08', '11-09', '11-10', '11-11', '11-12', '11-13']
        }],
        yAxis : [{  //Y轴
          type : 'value'
        }],
        series : [{ //内容
          type: 'line',
          data:[200, 300, 400, 610, 150, 270, 380],
        }]
      }*/
    ]
    ,elemDataView = $('#LAY-index-dataview').children('div')
    ,renderDataView = function(index){
      echartsApp[index] = echarts.init(elemDataView[index], layui.echartsTheme);
      echartsApp[index].setOption(options[index]);
      window.onresize = echartsApp[index].resize;
    };

    //没找到DOM，终止执行
    if(!elemDataView[0]) return;

    renderDataView(0);

    //监听数据概览轮播
    var carouselIndex = 0;
    carousel.on('change(LAY-index-dataview)', function(obj){
      renderDataView(carouselIndex = obj.index);
    });

    //监听侧边伸缩
    layui.admin.on('side', function(){
      setTimeout(function(){
        renderDataView(carouselIndex);
      }, 300);
    });

    //监听路由
    layui.admin.on('hash(tab)', function(){
      layui.router().path.join('') || renderDataView(carouselIndex);
    });
  });

  exports('console', {})
});
