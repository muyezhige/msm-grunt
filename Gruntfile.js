// ① 读取package信息
// ② 插件加载、注册任务，运行任务（grunt对外的接口全部写在这里面

// 使用concat合并和uglify压缩。
module.exports = function (grunt) {

  var mozjpeg = require('imagemin-mozjpeg'),
      imageminGifsicle = require('imagemin-gifsicle');
  // 项目配置
  grunt.initConfig({
    // 配置文件读出，并且转换为json对象,赋值给pack
    pack: grunt.file.readJSON('package.json'),
    // 任务的参数配置
    uglify: {
      options: {
        // 配置banner和footer信息, 在文件的头部加一段注释性语言
        banner: '/*! <%=pack.version%> <%= grunt.template.today("yyyy-mm-dd") %> */\n', //template.today 模板函数
        footer : '\n/*footer*/'
      },
      builda: {
          options: {
              mangle: true, // 防止压缩后更改变量名
              preserveComments: "false" // all 不删除注释, false 删除全部注释
          },
          files: {
              '<%=pack.name%>/output/js/lib/common-min.js': ['<%=pack.name%>/Public/js/lib/zepto_1.1.6.js','<%=pack.name%>/Public/js/template.js', '<%=pack.name%>/Public/js/tools.js']
          }
      },
      // buildc: {
      //     options: {
      //         mangle: true, // 防止压缩后更改变量名
      //         preserveComments: "false" // all 不删除注释, false 删除全部注释
      //     },
      //     files: {
      //         '<%=pack.name%>/output/js/lib/common-min.js': ['<%=pack.name%>/Public/js/lib/*.js']
      //     }
      // },
      buildb: {
          options: {
              mangle: {
                 except: ['jQuery', 'Backbone'] // 只有指定的变量不会被编译
              },
              compress: {
                 drop_console: true // 清除console.log()
              },
              preserveComments: "all"
          },
          src: '<%=pack.name%>/Public/js/cashHistory.js',
          dest: '<%=pack.name%>/output/js/cashHistory-min.js'
      },
      msm: { //任务三：按原文件结构压缩js文件夹内所有JS文件
          options: {
              mangle: false, // 防止压缩后更改变量名
              preserveComments: "false" // all 不删除注释, false 删除全部注释
          },
          files: [{
              expand: true, //扩展
              cwd:'<%=pack.name%>/Public/js/',//js目录下
              src:'**/*.js',//所有js文件
              dest: '<%=pack.name%>/output/js'//输出到此目录下
          }]
      },
      onebox: {
          files: {
              '<%=pack.name%>/haosou/js/onebox/result-min.js': ['<%=pack.name%>/haosou/js/onebox/tools.js', '<%=pack.name%>/haosou/js/onebox/result.js']
          }
      }
    },
    cssmin: {
        msm: {
          files: [{
              expand:true,
              cwd:'<%=pack.name%>/Public/css/',
              src:['**/*.css', '!pc.css'],
              dest:'<%=pack.name%>/output/css',
              ext:'.css'
          }]
        },
        target: {
            files: {
              'output-min.css': ['cashHistory.css', 'collect.css']
            }
        },
        onebox: {
           files: {
              '<%=pack.name%>/haosou/css/onebox/result-min.css': ['<%=pack.name%>/haosou/css/onebox/result.css']
            }
        }
    },
    htmlmin: {
        options:{
           removeComments: true,      //false: 保留注释
           collapseWhitespace: true,  //false: 保留空格
           removeEmptyAttributes: true, //是否删除空的属性
           removeCommentsFromCDATA: true //删除<script>和<style>标签内的HTML注释
        },
        msm: {
          files: [{
              expand:true,
              cwd:'<%=pack.name%>/Public/html/',//目标目录
              src:'**/*.html',//所有html
              dest: '<%=pack.name%>/output/html'//输出目录
          }]
        },
        onebox: {

           files: {
              '<%=pack.name%>/haosou/html/onebox/result-min.html': ['<%=pack.name%>/haosou/html/onebox/result-min.html']
            }
        }
    },
    // 图片无损压缩
    imagemin:{
      msm:{
        options:{
           optimizationLevel:3, //定义PNG图片优化水平
           use: [mozjpeg(), imageminGifsicle()]
        },
        files:[
          {
            expand: true,
            cwd: '<%=pack.name%>/Public/img/',
            src: ['**/*.{png,jpg,jpeg,gif}'],
            dest: '<%=pack.name%>/output/img/'
            // dest: '<%=pack.name%>/Public/img/' //覆盖旧图片
          }
        ]
      }
    },
    concat: {
       options: {
          separator: '', //分隔符
          stripBanners: true, // false 保留注释
          banner: '/*-v<%= pack.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
       },
       js: {
          src: ['<%=pack.jsLibPath%>/zepto_1.1.6.js', '<%=pack.jsLibPath%>/template.js', '<%=pack.jsLibPath%>/tools.js'],
          dest: '<%=pack.name%>/output/js/lib/common-min_<%= pack.version %>.js'
       }/*,
       css1: {
         src: ['lib/module1.css', 'lib/module2.css', 'lib/module3.css'],
         dest: 'dist/module-concat.css'
       },
       css2: {
          'dist/module-concat1.css' : ['lib/module1.css', 'lib/module2.css'],
          'dist/module-concat2.css' : ['lib/module4.css', 'lib/module5.css']
       }*/
    },
    // 替换一组或一个区块字符串
    processhtml: {
        onebox: {
          options: {
            curlyTags: {
               rlsdate: '<%= grunt.template.today("yyyymmdd") %>'
            }
          },
          files: {
            '<%=pack.name%>/haosou/html/onebox/result-min.html': '<%=pack.name%>/haosou/html/onebox/result.html'
          }
        }
    },
    jshint: {
        options: {
            eqeqeq: true, // 强调使用===和!==，而不是==和!=
            eqnull: true, // 允许使用"== null"作比较
            curly: true,  // 花括号不能省略
            // newcap: true, //对于首字母大写的函数（声明的类），强制使用new
            // undef: true,  // 查找所有未定义变量
            // unused: true, // 查找从未使用的变量或函数
            // noempty: true, // 禁止出现空的代码块
            // asi : true, // true忽略没有加分号的行尾
            // onevar : true, // 函数只被var的形式声明一遍
            // maxerr: 1,  // 错误提示超过这个阈值，不再检查
            // boss: true  // true，表示忽略if(a = 0)这样的代码
        },
        files: ['<%=pack.jsLibPath%>/jshint.js'] //, '<%=pack.jsLibPath%>/**/*.js']
    },
    copy:{
      main:{
        files:[
          {expand: true, flatten: true, src: ['app/Public/img/*'], dest: 'app/output/img/', filter: 'isFile'},
        ]
      }
    },
    compress: {
      main:{
        options:{
          archive: 'app/output.zip'
        },
        files: [
          {
            expand: true, 
            // flatten: true,  //所有文件被压缩到同一个目录下，显然结构上不合理。
            cwd: 'app/output/',  //设置路径
            src: '**/*', 
            dest: '', // 设置压缩包里的文件路径，为空，表示压缩文件从压缩包根目录开始。
            filter: 'isFile'
          }
        ]
      }
    },
    clean: {
      build: {
        src: ['app/output']
      }
    },
    // less to css
    less: {
        development: {
          options: {
              compress: false// 删除css空行和空格
          },
          // files: {
          //   "<%=pack.name%>/Public/css/search-result.css" : "<%=pack.name%>/Public/css/less/search-result.less",
          //   "<%=pack.name%>/Public/css/aaa.css" : "<%=pack.name%>/Public/css/less/aaa.less"
          // }
          files:[{
              expand: true,
              cwd: '<%=pack.name%>/Public/css/less',
              src: ['*.less'],
              dest: '<%=pack.name%>/Public/css',
              ext: '.css'
          }]
        }
    },
    // 监听.less文件的变化
    watch: {
        css: {
          files: '<%=pack.name%>/Public/css/less/*.less',
          tasks: ['less', 'sftp']
        },
    },
    // 上传最新的.css文件
    sftp: {
        test: {
          files: {
            "./": ["<%=pack.name%>/Public/css/*.css"]
          },
          options: {
              path: '/home/q/www/lihonglei/360jiebao/trunk',
              host: '<%= pack.host %>',
              username: '<%= pack.username %>',
              password: '<%= pack.password %>',
              showProgress: true, //显示上传文件的具体信息
              createDirectories: true, //创建对应的目录路径
              srcBasePath: '<%=pack.name%>/' //指定根目录，只创建根目录之后的文件或路径
          }
        }
    }
  });
  // 加载任务的插件
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ssh');
  // 注册默认任务 grunt == grunt uglify + grunt concat 
  grunt.registerTask('default', ['uglify', 'cssmin']);
  grunt.registerTask('onebox', ['cssmin:onebox', 'uglify:onebox', 'processhtml:onebox', 'htmlmin:onebox']);
  grunt.registerTask('msm', ['cssmin:msm', 'uglify:msm', 'htmlmin:msm']);
};