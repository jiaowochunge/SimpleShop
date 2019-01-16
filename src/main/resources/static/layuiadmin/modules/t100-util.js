layui.define(function(exports){
  exports('t100-util', {
    // 格式化日期。接受日期模版为参数，如 'yyyy/MM/dd'
    dateFormat: function(tpl) {
      var date = new Date();

      var res = (' ' + tpl).slice(1);
      res = res.replace('yyyy', date.getFullYear());

      var tmp = '00' + (date.getMonth() + 1);
      res = res.replace('MM', tmp.substring(tmp.length - 2));

      tmp = '00' + date.getDate();
      res = res.replace('dd', tmp.substring(tmp.length - 2));

      tmp = '00' + date.getHours();
      res = res.replace('hh', tmp.substring(tmp.length - 2));

      tmp = '00' + date.getMinutes();
      res = res.replace('mm', tmp.substring(tmp.length - 2));

      tmp = '00' + date.getSeconds();
      res = res.replace('ss', tmp.substring(tmp.length - 2));

      return res;
    }
  });
});
