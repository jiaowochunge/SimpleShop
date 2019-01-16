layui.define(['layer', 'table', 'form'], function(exports){
  var $ = layui.$
  ,table = layui.table
  ,form = layui.form;

  //============================= 校区盒子 =============================
  //监听搜索
  form.on('submit(LAY-personal-playbox-search)', function(data){
    var field = data.field;

    //执行重载
    table.reload('LAY-personal-playbox-table', {
      where: field
    });
  });

  table.render({
    elem: '#LAY-personal-playbox-table'
    ,url: '/personal/playboxes'
    ,cols: [[
      {field: 'deviceUuid', title: '设备UUID'}
      ,{field: 'supplyName', title: '供应商'}
      ,{field: 'categoryName', title: '设备分类'}
      ,{field: 'typeName', title: '设备型号'}
      ,{field: 'lastLoginTime', title: '最近登陆时间', sort: true}
      ,{field: 'departmentName', title: '所属校区'}
      ,{field: 'manufactureDateDesc', title: '生产日期', sort: true}
      ,{field: 'createdAt', title: '入库时间', sort: true}
      ,{title: '操作', width: 150, align: 'center', fixed: 'right', toolbar: '#table-personal-playbox'}
    ]]
    ,page: true
    ,limit: 30
    ,height: 'full-100'
    ,size: 'sm'
  });

  //监听工具条
  table.on('tool(LAY-personal-playbox-table)', function(obj){
    var data = obj.data;
    if(obj.event === 'detail'){
      layer.open({
        type: 2
        ,shade:0.1
        ,title: '设备详情_'+data.deviceUuid
        ,content: '/device/playbox/detail/'+data.id
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定']
      });
    }else if(obj.event === 'fix'){
      layer.msg('TODO:直接跳转创建工单', function() {
        top.layui.index.openTabsPage('woorders/index', '工单信息总表');
      });
    }
  });

  //============================= 我的授权 =============================
  table.render({
    elem: '#LAY-personal-auth-role-table'
    ,url: '/personal/auth/roles'
    ,cols: [[
      {field: 'id', title: 'ID', minWidth: 100}
      ,{field: 'name', title: '名称', minWidth: 100}
      ,{field: 'key', title: '编码', minWidth: 100}
      ,{field: 'isSystemDesc', title: '系统级别', minWidth: 100}
    ]]
    ,page: true
    ,limit: 30
    ,size: 'sm'
  });

  table.render({
    elem: '#LAY-personal-auth-permission-table'
    ,url: '/personal/auth/permissions'
    ,cols: [[
      {field: 'id', title: 'ID', minWidth: 100}
      ,{field: 'name', title: '名称', minWidth: 100}
      ,{field: 'key', title: '编码', minWidth: 100}
      ,{field: 'isSystemDesc', title: '系统级别', minWidth: 100}
      ,{field: 'departmentId', title: '校区ID', minWidth: 100}
    ]]
    ,page: true
    ,limit: 30
    ,size: 'sm'
  });

  //============================= 我的教案 =============================
  //监听搜索
  form.on('submit(LAY-personal-teach-lesson-search)', function(data){
    var field = data.field;

    //执行重载
    table.reload('LAY-personal-teach-lesson-table', {
      where: field
    });
  });

  table.render({
    elem: '#LAY-personal-teach-lesson-table'
    ,url: '/personal/teach-lessons'
    ,cols: [[
      {type: 'checkbox', fixed: 'left'}
      ,{field: 'id', title: 'ID', minWidth: 100}
      ,{field: 'department', title: '校区', minWidth: 100, templet: function(d) {return d.department.name}}
      ,{field: 'courseContent', title: '课程', minWidth: 100, templet: function(d) {return d.contentCourse.name}}
      ,{field: 'name', title: '课程名称', minWidth: 100}
      ,{field: 'theme', title: '活动主题', minWidth: 100}
      ,{field: 'age', title: '适合年龄', minWidth: 100}
      ,{field: 'objective', title: '教学目标', minWidth: 100}
      ,{field: 'prepare', title: '课前准备', minWidth: 100}
      ,{field: 'editDate', title: '授课日期', minWidth: 100, templet: function(d) {return d.editDate.substring(0,10)}}
      ,{field: 'updatedAt', title: '编辑日期', width: 150}
      ,{title: '操作', width: 180, align: 'center', fixed: 'right', toolbar: '#table-personal-teach-lesson'}
    ]]
    ,page: true
    ,limit: 30
    ,height: 'full-100'
    ,size: 'sm'
  });

  //监听工具条
  table.on('tool(LAY-personal-teach-lesson-table)', function(obj){
    var data = obj.data;
    if(obj.event === 'detail'){
      top.layui.index.openTabsPage('personal/teach-lessons/' + data.id + '/detail', '教案详情:' + data.name);
    }else if(obj.event === 'edit'){
      top.layui.index.openTabsPage('personal/teach-lessons/' + data.id + '/edit', '编辑教案:' + data.name);
    }else if(obj.event === 'del'){
      layer.confirm('确定删除教案（' + data.name + '）？', function(index){
        // 关闭对话框
        layer.close(index);
        var loading = layer.load();
        $.ajax({
          url: data.id
          ,method: 'delete'
        }).done(function(data){
          layer.close(loading);
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
            // 刷新表格
            table.reload('LAY-personal-teach-lesson-table');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.close(loading);
          layer.msg('' + jqXHR.status + ':' + responseJSON.message);
        });
      });
    }
  });

  //事件
  var teachLessonActive = {
    batchdel: function(){
      var checkStatus = table.checkStatus('LAY-personal-teach-lesson-table')
      ,	 checkData= checkStatus.data; //得到选中的数据

      if(checkData.length === 0){
        return layer.msg('请选择数据');
      }

    layer.confirm('确定删除吗？', function(index) {
      var delId = [];
      for(var i = 0, row = checkData[0]; row = checkData[i]; i++) {
        delId.push(row.id);
      }
      //执行 Ajax 后重载
      $.ajax({
        url:'/personal/teach-lessons/deleteBatch'
        ,method: 'delete'
        ,dataType: 'json'
        ,data: {delId: delId}
        ,traditional: true
      }).done(function(data){
        if (data.code == 0) {
          layer.msg(data.msg || '请求成功');
          // 刷新表格
          table.reload('LAY-personal-teach-lesson-table');
          layer.msg('已删除');
        } else {
          layer.msg(data.msg || '请求失败');
        }
      }).fail(function(jqXHR, textStatus, errorThrown){
        layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
      });

    });
    }
    ,add: function(){
      top.layui.index.openTabsPage('personal/teach-lessons/create', '添加教案');
    }
  };

  $('.layui-btn.layuiadmin-btn-teach-lesson').on('click', function(){
    var type = $(this).data('type');
    teachLessonActive[type] ? teachLessonActive[type].call(this) : '';
  });

  exports('t100-personal', {})
});
