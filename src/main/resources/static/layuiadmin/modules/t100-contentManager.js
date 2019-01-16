/**
* 内容管理。
* 新建、修改、删除课程分类
* 新建、修改、删除课程内容
*/
layui.define(['layer', 'table', 'form', 'dropdown'], function(exports){
  var $ = layui.$
  ,table = layui.table
  ,form = layui.form
  ,dropdown = layui.dropdown;

  // 目录树
  var categoryTreeDom = $('#jstree-category');
  categoryTreeDom.jstree({
    core: {
      multiple: false
      // contextmenu: so that create works
      ,check_callback: true
      ,data: function(node, cb) {
        $.ajax({
          url: '/content/curriculumSystem/curriculumSystemTree'
          ,data: $('#categoryForm').serialize()
        }).done(function(data) {
          if (data.code) {
            cb([]);
            layer.msg(data.msg || '请求失败');
          } else {
            // 数据类型转换
            cb(transformTreeData(data.data, true));
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        });
      }
    }
    ,plugins: [
      'contextmenu'
      ,'dnd'
      ,'unique'
      ,'search'
    ]
    ,contextmenu: {
      items: function(node, cb) {
        var menu = {};
        if (node.original.level == 3) {
          menu.createItem = {
            label: '添加课程内容'
            ,action: function(obj) {
              actions.addContent(node.id);
            }
          };
        } else {
          menu.createItem = {
            label: '添加课程分类'
            ,action: function(obj) {
              actions.addCategory(node.id);
            }
          };
        }
        if (node.original.level == 0) {
          menu.detailItem = {
            label: '课程体系详情'
            ,action: function(obj) {
              actions.detailCurriculumSystem(node.original.form);
            }
          };
          menu.editItem = {
            label: '编辑课程体系'
            ,action: function(obj) {
              actions.editCurriculumSystem(node.original.form);
            }
          };
        } else {
          menu.detailItem = {
            label: '课程分类详情'
            ,action: function(obj) {
              actions.detailCategory(node.id);
            }
          };
          menu.editItem = {
            label: '编辑课程分类'
            ,action: function(obj) {
              actions.editCategory(node.id);
            }
          };
          if (node.original.status == 0) {
            menu.restoreItem = {
              label: '恢复课程分类'
              ,action: function(obj) {
                actions.restoreCategory(node.original.form);
              }
            };
          } else {
            menu.deleteItem = {
              label: '删除课程分类'
              ,action: function(obj) {
                actions.deleteCategory(node.original.form);
              }
            };
          }
        }
        return menu;
      }
    }
    ,dnd: {
      // 课程体系不许拖动
      'is_draggable': function(node) {
        if (node[0].original.level == 0) {
          return false;
        } else {
          return true;
        }
      }
    }
  });

  var categoryTree = categoryTreeDom.jstree(true);

  // 转换数据结构
  function transformTreeData(data, firstLevel) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var di = {};

      if (firstLevel) {
        // 课程体系。避免id冲突，课程体系id添加‘s’前缀
        di.id = 's' + data[i].id;
        di.level = 0;
        di.text = data[i].name;
        di.form = {
          id: data[i].id
          ,name: data[i].name
          ,keyWords: data[i].keyWords
          ,weight: data[i].weight
          ,status: data[i].status
        }
      } else {
        // 课程分类
        di.id = data[i].id;
        di.level = data[i].level;
        di.text = data[i].name + '<i style="padding-left:8px;">(' + data[i].courseCount + ')</i>';
        di.form = {
          id: data[i].id
          ,parentCategoryId: data[i].parentCategoryId
          ,root: data[i].root
          ,curriculumSystemId: data[i].curriculumSystemId
          ,level: data[i].level
          ,weight: data[i].weight
          ,name: data[i].name
          ,memo: data[i].memo
        };
      }
      di.status = data[i].status;

      di.a_attr = {
        title: data[i].memo
      };
      if (data[i].status == 0) {
        di.a_attr.style = 'text-decoration: line-through; color: red';
      }
      // 递归
      di.children = transformTreeData(data[i].children, false);

      res[i] = di;
    }

    return res;
  }

  // 目录树事件
  $(function() {
    // 目录搜索
    var to = false;
    $('#jstree-search').keyup(function () {
      if(to) { clearTimeout(to); }
      to = setTimeout(function () {
        var v = $('#jstree-search').val();
        categoryTree.search(v);
      }, 250);
    });
    // 是否显示已删除目录
    form.on('checkbox(categoryStatus)', function(data){
      categoryTree.refresh();
    });
    // 选择目录节点，触发内容表格重载
    categoryTreeDom.on('select_node.jstree', function(event, obj) {
      // 重置查询参数
      paramCourse.curriculumSystemId = '';
      paramCourse.parentCategoryIds = '';
      paramCourse.categoryId = '';
      // 设置查询参数
      if (obj.node.original.level) {
        // 课程分类目录
        if (obj.node.original.level === 3) {
          // 第三级直接根据分类id查询
          paramCourse.categoryId = obj.node.id;
        } else {
          // 第一和第二级根据 'parentCategoryIds' 查询
          var ids = [];
          ids.push(obj.node.id);
          for (var i = 0; i < obj.node.parents.length; i++) {
            if (obj.node.parents[i].startsWith('s')) {
              break;
            }
            ids.push(obj.node.parents[i]);
          }
          paramCourse.parentCategoryIds = ids.reverse().join(',') + ',';
        }
      } else {
        // 课程体系目录。使用 'id' 时注意删掉 's' 前缀
        paramCourse.curriculumSystemId = obj.node.id.substring(1);
      }
      // 触发查询动作
      $('button[lay-filter="lay-content-search"]').trigger('click');
    });

    // 拖动节点
    categoryTreeDom.on('move_node.jstree', function(event, obj) {
      // 判断目录级别是否匹配
      var old_parent = categoryTree.get_node(obj.old_parent);
      var parent = categoryTree.get_node(obj.parent);
      if (old_parent.original.level != parent.original.level) {
        layer.alert('起始目录与目标目录必须级别相同！');
        categoryTree.refresh();
        return;
      }
      // 修改目录结构请求
      var data = obj.node.original.form;
      if (parent.original.level == 0) {
        data.curriculumSystemId = parent.original.id;
      } else {
        data.curriculumSystemId = parent.original.form.curriculumSystemId;
        data.parentCategoryId = parent.original.id;
      }
      var loading = layer.load();
      $.ajax({
        url: '/content/category/' + obj.node.id
        ,method: 'PUT'
        ,dataType: 'json'
        ,data: data
      }).done(function(data){
        if (data.code == 0) {
          layer.msg(data.msg || '请求成功');
        } else {
          layer.msg(data.msg || '请求失败');
        }
      }).fail(function(jqXHR, textStatus, errorThrown){
        layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
      }).always(function() {
        layer.close(loading);
        categoryTree.refresh();
      });
    });
  });

  var actions = {
    addContent: function(categoryId) {
      var url = '/content/course/create';
      if (categoryId) {
        url += '?categoryId=' + categoryId;
      }
      layer.open({
        type: 2
        ,title: '新增课程'
        ,content: url
        ,area: ['55%', '70%']
        ,maxmin: true
        ,btn: ['确认','取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submitID = 'LAY-user-front-submit'
          ,submit = layero.find('iframe').contents().find('#'+ submitID);

          //监听提交
          iframeWindow.layui.form.on('submit('+ submitID +')', function(data){
            var loading = layer.load();
            $.ajax({
              url: '.'
              ,method: 'POST'
              ,dataType: 'json'
              ,data: data.field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                layer.close(index);
                table.reload('tablelistContent');
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            }).always(function() {
              layer.close(loading);
            });
          });
          submit.trigger('click');
        }
      });
    },
    editContent: function(course) {
      var url = course.id + '/edit?' + $('#categoryForm').serialize();
      layer.open({
        type: 2
        ,title: '编辑课程_' + course.name
        ,content: url
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确认','取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submitID = 'LAY-user-front-submit'
          ,submit = layero.find('iframe').contents().find('#'+ submitID);

          //监听提交
          iframeWindow.layui.form.on('submit('+ submitID +')', function(data){
            var loading = layer.load();
            $.ajax({
              url: data.field.id
              ,method: 'PUT'
              ,dataType: 'json'
              ,data: data.field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                layer.close(index);
                table.reload('tablelistContent');
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            }).always(function() {
              layer.close(loading);
            });
          });
          submit.trigger('click');
        }
      });
    },
    addCategory: function(categoryId) {
      layer.open({
        type: 2
        ,title: '新增分类'
        ,content: '/content/category/create?id=' + categoryId
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确认','取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submitID = 'LAY-user-front-submit'
          ,submit = layero.find('iframe').contents().find('#'+ submitID);

          //监听提交
          iframeWindow.layui.form.on('submit('+ submitID +')', function(data){
            var loading = layer.load();
            $.ajax({
              url: '/content/category'
              ,method: 'POST'
              ,dataType: 'json'
              ,data: data.field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');

                layer.close(index);
                categoryTree.refresh();
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            }).always(function() {
              layer.close(loading);
            });
          });
          submit.trigger('click');
        }
      });
    },
    editCategory: function(categoryId) {
      layer.open({
        type: 2
        ,title: '编辑课程分类'
        ,content: '/content/category/' + categoryId + '/edit'
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确认','取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submitID = 'LAY-user-front-submit'
          ,submit = layero.find('iframe').contents().find('#'+ submitID);

          //监听提交
          iframeWindow.layui.form.on('submit('+ submitID +')', function(data){
            var loading = layer.load();
            $.ajax({
              url: '/content/category/' + categoryId
              ,method: 'PUT'
              ,dataType: 'json'
              ,data: data.field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');

                layer.close(index);
                categoryTree.refresh();
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            }).always(function() {
              layer.close(loading);
            });
          });
          submit.trigger('click');
        }
      });
    },
    detailCategory: function(categoryId) {
      layer.open({
        type: 2
        ,title: '查看课程分类'
        ,content: '/content/category/' + categoryId + '/detail'
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确认','取消']
        ,yes: function(index, layero){
          layer.close(index);
        }
      });
    },
    deleteCategory: function(data) {
      layer.confirm('确定删除课程分类(' + data.name + ')？', {
        icon: 0
        ,title: '警告'
      }, function(index) {
        layer.close(index);
        var loading = layer.load();
        $.ajax({
          url: '/content/category/' + data.id
          ,method: 'DELETE'
          ,dataType: 'json'
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        }).always(function() {
          categoryTree.refresh();
          layer.close(loading);
        });
      });
    },
    restoreCategory: function(data) {
      layer.confirm('确定恢复课程分类(' + data.name + ')？', {
        icon: 0
        ,title: '警告'
      }, function(index) {
        layer.close(index);
        var loading = layer.load();
        $.ajax({
          url: '/content/category/restoreContentCategory/' + data.id
          ,method: 'PUT'
          ,dataType: 'json'
        }).done(function(data){
          if (data.code == 0) {
            layer.msg(data.msg || '请求成功');
          } else {
            layer.msg(data.msg || '请求失败');
          }
        }).fail(function(jqXHR, textStatus, errorThrown){
          layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
        }).always(function() {
          categoryTree.refresh();
          layer.close(loading);
        });
      });
    },
    detailCurriculumSystem: function(data) {
      layer.open({
        type: 2
        ,title: '查看课程体系_' + data.name
        ,content: '/content/curriculumSystem/' + data.id + '/detail'
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确定']
      })
    },
    editCurriculumSystem: function(data) {
      layer.open({
        type: 2
        ,title: '编辑课程体系_' + data.name
        ,shade:0.1
        ,content: '/content/curriculumSystem/edit/' + data.id
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['确定', '取消']
        ,yes: function(index, layero){
          var iframeWindow = window['layui-layer-iframe'+ index]
          ,submitID = 'LAY-user-front-submit'
          ,submit = layero.find('iframe').contents().find('#'+ submitID);

          //监听提交
          iframeWindow.layui.form.on('submit('+ submitID +')', function(formData){
            var loading = layer.load();
            $.ajax({
              url: '/content/curriculumSystem/' + data.id
              ,method: 'PUT'
              ,dataType: 'json'
              ,data: formData.field
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');

                layer.close(index);
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            }).always(function() {
              layer.close(loading);
            });
          });

          submit.trigger('click');
        }
      });
    }
  }

  // -------------------------------------------课程内容表格
  var paramCourse = {
    curriculumSystemId:'',
    parentCategoryIds:'',
    categoryId:'',
    name:'',
    status:1
  };
  $(function() {
    var tableStyle = {
      showDetail: false
      ,cols: function() {
        return this.showDetail ? this.detail : this.simple;
      }
      ,simple: [[
        {fixed:'left',type:'checkbox', title:"行号"}
        ,{field: 'name', title: '名称'}
        ,{field: 'coverImageUrl', title: '封面图', templet: '#imgTpl'}
        ,{field: 'nameCode', title: '名称编号'}
        ,{field: 'weight', title: '权重'}
        ,{field: 'statusDesc', title: '状态'}
        ,{fixed: 'right', title: '操作', width: 200, toolbar: '#barContent'}
      ]]
      ,detail: [[
        {fixed:'left',type:'checkbox', title:"行号"}
        ,{field: 'name', title: '名称'}
        ,{field: 'versionCode', title: '版本号'}
        ,{field: 'nameCode', title: '名称编号'}
        ,{field: 'coverImageUrl', title: '封面图', templet: '#imgTpl'}
        ,{field: 'categoryName', title: '分类名称'}
        ,{field: 'age', title: '适合年龄'}
        ,{field: 'keyWords', title: '关键字'}
        ,{field: 'teacher', title: '老师'}
        ,{field: 'weight', title: '权重'}
        ,{field: 'statusDesc', title: '状态'}
        ,{fixed: 'right', title: '操作', width: 200, toolbar: '#barContent'}
      ]]
    };
    // 表格切换
    form.on('checkbox(switch-table-style)', function(data){
      tableStyle.showDetail = data.elem.checked;

      table.reload('tablelistContent', {
        cols: tableStyle.cols()
      });
    });
    // 查询按钮
    form.on('submit(lay-content-search)', function(data){
      var field = data.field;
      paramCourse.status = field.status;
      paramCourse.name = field.name;

      //执行重载
      table.reload('tablelistContent', {
        page: {
          curr: 1
        }
      });
    });

    // 渲染表格
    table.render({
      elem: '#tablelistContent'
      ,url: '/content/course/search'
      ,where: paramCourse
      ,page: true
      ,limit: 30
      ,size: 'sm'
      ,cols: tableStyle.cols()
      ,done:function(){
        hoverOpenImg();//显示大图
        $('table tr').on('click',function(){
          $('table tr').css('background','');
          $(this).css('background','<%=PropKit.use("config.properties").get("table_color")%>');
        });

        dropdown.render(); //加载bootstrap
      }
    });

    //监听工具条（内容管理清单）
    table.on('tool(tablelistContent)', function(obj){
      var data = obj.data;
      if(obj.event === "del"){
        layer.open({
          title: '删除',
          content: "删除课程_"+data.name,
          btnAlign: 'c',
          shade:0.1,
          btn:["确定","取消"],
          yes: function(index, layero){
            $.ajax({
              url: "/content/course/"+data.id
              ,method: 'DELETE'
              ,dataType: 'json'
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                table.reload('tablelistContent');
                layer.closeAll();
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            });
          }
        });
      }else if(obj.event === "detail"){
        layer.open({
          type: 2
          ,title: '课程内容详情_'+data.name
          ,content: '/content/course/detail/'+data.id
          ,maxmin: true
          ,area: ['55%', '70%']
          ,btn: ['取消']
          ,yes: function(index, layero){
            layer.close(index);
          }
        });
      }else if(obj.event === "edit"){
        actions.editContent(data);
      }else if(obj.event === "resource"){
        layer.open({
          type: 2
          ,shade:0.1
          ,title: '资源管理_'+data.name
          ,content: '/content/media/'+data.id+'/index'
          ,maxmin: true
          ,area: ['55%', '70%']
          ,btn: ['取消']
          ,yes: function(index, layero){
            layer.closeAll();
          }
        });
      }else if(obj.event === "teacherBook"){
        layer.open({
          type: 2
          ,shade:0.1
          ,title: '手册管理_'+data.name
          ,content: '/content/teacherBook/'+data.id+'/index'
          ,maxmin: true
          ,area: ['55%', '70%']
          ,btn: ['取消']
          ,yes: function(index, layero){
            layer.closeAll();
          }
        });
      }else if (obj.event === "restoreContentCourse"){
        layer.open({
          title: '还原',
          content: "还原课程_"+data.name,
          btnAlign: 'c',
          shade:0.1,
          btn:["确定","取消"],
          yes: function(index, layero){
            $.ajax({
              url: "/content/course/restoreContentCourse/"+data.id
              ,method: 'PUT'
              ,dataType: 'json'
            }).done(function(data){
              if (data.code == 0) {
                layer.msg(data.msg || '请求成功');
                //数据刷新
                table.reload('tablelistContent');
                layer.closeAll();
              } else {
                layer.msg(data.msg || '请求失败');
              }
            }).fail(function(jqXHR, textStatus, errorThrown){
              layer.msg('' + jqXHR.status + ':' + jqXHR.statusText);
            });
          }
        });
      }

      return false;
    });
    //添加内容
    $("#addContent").click(function() {
      var catId = categoryTree.get_selected()[0];
      if (!catId) {
        layer.alert('请先选择第三级课程体系');
        return;
      }
      var node = categoryTree.get_node(catId);
      if (node.original.form.level != 3) {
        layer.alert('只能在第三级课程体系下添加课程');
        return;
      }
      actions.addContent(catId);
    });
    //批量添加
    $('#batchAddMedia').click(function() {
      var checkStatus = table.checkStatus('tablelistContent')
      ,checkData = checkStatus.data; //得到选中的数据

      if(checkData.length === 0){
        return layer.msg('请选择数据');
      }

      layer.open({
        type: 2
        ,title: '批量上传资源'
        ,content: '/content/media/batchPage'
        ,maxmin: true
        ,area: ['55%', '70%']
        ,btn: ['关闭']
        ,success: function(layero, index) {
          // 表格渲染数据
          var iframeWindow = window['layui-layer-iframe'+ index];
          iframeWindow.tableData = checkData;
        }
        ,yes: function(index, layero) {
          layer.close(index)
        }
      });
    });

    //放大的图片
    function hoverOpenImg(){
      var img_show = null; // tips提示
      $('td img').hover(function(){
        var img = "<img class='img_msg' src='"+$(this).attr('src')+"' style='width:200px;' />";
        img_show = layer.tips(img, this,{
          tips:[2, 'rgba(41,41,41,.5)']
          ,area: ['220px']
        });
      },function(){
        layer.close(img_show);
      });
      $('td img').attr('style','max-width:50%');
    }
  });

  exports('t100-contentManager', {})
});
