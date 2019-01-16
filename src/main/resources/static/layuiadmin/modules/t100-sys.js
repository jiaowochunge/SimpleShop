layui.define(['layer', 'table', 'form', 'tree'], function(exports){
  var $ = layui.$
  ,table = layui.table
  ,form = layui.form
  ,tree = layui.tree;

  //============================= 授权管理 =============================
  var loadDepartments = function() {
    if ($('#Lay-auth-department').length == 0) {
      return;
    }
    var loading = layer.load();
    $.ajax({
      url: 'departmentTree'
      ,method: 'get'
    }).done(function(data){
      layer.close(loading);
      if (data.code == 0) {
        layer.msg(data.msg || '请求成功');

        //数据刷新
        tree({
          elem: '#Lay-auth-department'
          ,nodes: data.data
          ,click: function(node){
            table.reload('LAY-user-manage', {
              url: 'department/' + node.id + '/employees'
            });
          }
        });

        renderEmployeeTable(data.data[0].id);
      } else {
        layer.msg(data.msg || '请求失败');
      }
    }).fail(function(jqXHR, textStatus, errorThrown){
      layer.close(loading);
      layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
    });
  }

  loadDepartments();

  // 渲染员工列表
  function renderEmployeeTable(rootDepartmentId) {
    table.render({
      elem: '#LAY-user-manage'
      ,url: 'department/' + rootDepartmentId + '/employees'
      ,cols: [[
        {field: 'id', title: 'ID', sort: true}
        ,{field: 'name', title: '姓名', minWidth: 100}
        ,{field: 'email', title: '邮箱'}
        ,{field: 'gender', width: 80, title: '性别', align: 'center', templet: '#genderTpl'}
        ,{title: '操作', width: 200, align:'center', fixed: 'right', toolbar: '#table-useradmin-webuser'}
      ]]
      ,page: true
      ,limit: 30
      ,size: 'sm'
    });
  }

  //监听工具条
  table.on('tool(LAY-user-manage)', function(obj){
    var data = obj.data;
    if(obj.event === 'edit'){
      top.layui.index.openTabsPage('sys/auth/employee/' + data.id + '/auth', '授权:' + data.name);
    } else if (obj.event === 'detail') {
      layer.open({
        type: 2
        ,title: '授权详情:' + data.name
        ,content: 'employee/' + data.id + '/detail'
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定']
      });
    }
  });

  $('#Lay-auth-sync-department').on('click', function() {
    var loading = layer.load();
    $.ajax({
      url: 'sync-departments'
      ,method: 'get'
    }).done(function(data){
      layer.close(loading);
      if (data.code == 0) {
        layer.msg(data.msg || '请求成功');
        //数据刷新
        loadDepartments();
      } else {
        layer.msg(data.msg || '请求失败');
      }
    }).fail(function(jqXHR, textStatus, errorThrown){
      layer.close(loading);
      layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
    });
  });

  $('#Lay-auth-sync-employee').on('click', function() {
    var loading = layer.load();
    $.ajax({
      url: 'sync-employees'
      ,method: 'get'
    }).done(function(data){
      layer.close(loading);
      if (data.code == 0) {
        layer.msg(data.msg || '请求成功');
      } else {
        layer.msg(data.msg || '请求失败');
      }
    }).fail(function(jqXHR, textStatus, errorThrown){
      layer.close(loading);
      layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
    });
  });

  //////////////////////////////////////////////////////  角色管理
  table.render({
    elem: '#LAY-sys-role-manage'
    ,url: '/sys/roles'
    ,cols: [[
      {field: 'id', minWidth: 180, title: 'ID', sort: true}
      ,{field: 'name', title: '角色名'}
      ,{field: 'key', title: '角色编码'}
      ,{field: 'isSystem', title: '系统级别', width: 100, align: 'center', templet: '#isSystemTpl'}
      ,{field: 'status', title: '状态', width: 80, align: 'center', templet: '#statusTpl'}
      ,{title: '操作', width: 180, align: 'center', fixed: 'right', toolbar: '#table-sys-role'}
    ]]
    ,page: true
    ,limit: 30
    ,height: 'full-100'
    ,size: 'sm'
  });

  //监听工具条
  table.on('tool(LAY-sys-role-manage)', function(obj){
    var table_row_data = obj.data;
    if(obj.event === 'detail'){
      layer.open({
        type: 2
        ,title: '角色详情'
        ,content: table_row_data.id + '/detail'
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定']
      });
    }else if(obj.event === 'edit'){
      layer.open({
        type: 2
        ,title: '编辑角色'
        ,content: table_row_data.id + '/edit'
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定', '取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submit = layero.find('iframe').contents().find("#LAY-role-edit-submit");

          //监听提交
          iframeWindow.layui.form.on('submit(LAY-role-edit-submit)', function(data){
            var field = data.field; //获取提交的字段

            /**
            * `put` 请求 `contentType` 必须是 application/x-www-form-urlencoded （跟 `post` 一样）
            * 所以用默认值
            */
            $.ajax({
              url: table_row_data.id
              ,method: 'put'
              ,dataType: 'json'
              ,data: field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                table.reload('LAY-sys-role-manage');
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            });

            layer.close(index); //关闭弹层
          });

          submit.trigger('click');
        }
        ,success: function(layero, index){

        }
      })
    }else if(obj.event === 'del'){
      layer.confirm('确定删除此角色？', function(index){
        // 请求删除
        $.ajax(table_row_data.id, {
          method: 'delete'
          //,contentType: ''
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
            // 刷新表格
            table.reload('LAY-sys-role-manage');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        });

        // 关闭对话框
        layer.close(index);
      });
    }else if(obj.event === 'undel'){
      layer.confirm('确定恢复此角色？', function(index){
        // 请求恢复
        $.ajax({
          url: table_row_data.id + '/undo-delete'
          ,method: 'put'
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
            // 刷新表格
            table.reload('LAY-sys-role-manage');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        });

        // 关闭对话框
        layer.close(index);
      });
    }
  });

  ///////////////////////////////////  权限管理
  table.render({
    elem: '#LAY-sys-permission-manage'
    ,url: '/sys/permissions'
    ,cols: [[
      {type: 'checkbox', fixed: 'left'}
      ,{field: 'id', minWidth: 180, title: 'ID', sort: true}
      ,{field: 'name', title: '权限名'}
      ,{field: 'key', title: '权限编码'}
      ,{field: 'isSystem', title: '系统级别', width: 100, align: 'center', templet: '#isSystemTpl'}
      ,{field: 'status', title: '状态', width: 80, align: 'center', templet: '#statusTpl'}
      ,{title: '操作', width: 180, align: 'center', fixed: 'right', toolbar: '#table-sys-permission'}
    ]]
    ,page: true
    ,limit: 30
    ,height: 'full-100'
    ,size: 'sm'
  });

  //监听工具条
  table.on('tool(LAY-sys-permission-manage)', function(obj){
    var table_row_data = obj.data;
    if(obj.event === 'detail'){
      layer.open({
        type: 2
        ,title: '权限详情'
        ,content: table_row_data.id + '/detail'
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定']
      });
    }else if(obj.event === 'edit'){
      var tr = $(obj.tr);

      layer.open({
        type: 2
        ,title: '编辑权限'
        ,content: table_row_data.id + '/edit'
        ,maxmin: true
        ,area: ['600px', '400px']
        ,btn: ['确定', '取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submit = layero.find('iframe').contents().find("#LAY-permission-edit-submit");

          //监听提交
          iframeWindow.layui.form.on('submit(LAY-permission-edit-submit)', function(data){
            var field = data.field; //获取提交的字段

            /**
            * `put` 请求 `contentType` 必须是 application/x-www-form-urlencoded （跟 `post` 一样）
            * 所以用默认值
            */
            $.ajax({
              url: table_row_data.id
              ,method: 'put'
              ,dataType: 'json'
              ,data: field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                table.reload('LAY-sys-permission-manage');
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            });

            layer.close(index); //关闭弹层
          });

          submit.trigger('click');
        }
        ,success: function(layero, index){

        }
      })
    }else if(obj.event === 'del'){
      layer.confirm('确定删除此权限？', function(index){
        // 请求删除
        $.ajax({
          url: table_row_data.id
          ,method: 'delete'
          //,contentType: ''
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
            // 刷新表格
            table.reload('LAY-sys-permission-manage');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        });

        // 关闭对话框
        layer.close(index);
      });
    }else if(obj.event === 'undel'){
      layer.confirm('确定恢复此权限？', function(index){
        // 请求恢复
        $.ajax({
          url: table_row_data.id + '/undo-delete'
          ,method: 'put'
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
            // 刷新表格
            table.reload('LAY-sys-permission-manage');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        });

        // 关闭对话框
        layer.close(index);
      });
    }
  });

  exports('t100-sys', {})
});
