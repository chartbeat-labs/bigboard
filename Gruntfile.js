'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      dev: {
        options: {
          port: 9000,
          base: 'src',
          open: 'http://localhost:<%= connect.dev.options.port %>/#/domain.com?apiKey=apikey'
        }
      },
      prod: {
        options: {
          port: 9001,
          base: 'dist',
          open: 'http://localhost:<%= connect.prod.options.port %>/#/domain.com?apiKey=apikey'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/scripts/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js',
              'src/**/*.js',
              ],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['src/bower_components/**']
      }
    },
    less: {
      build: {
        options: {
          paths: ['src/styles'],
          yuicompress: true
        },
        files: {
          'dist/styles/main.css': 'src/styles/main.less'
        }
      },
      watch: {
        options: {
          paths: ['src/styles'],
          dumpLineNumbers: 'comments'
        },
        files: {
          'src/styles/main.css': 'src/styles/main.less'
        }
      }
    },
    watch: {
      less: {
        files: ['src/styles/{,*/}*.less'],
        tasks: ['less:watch']
      },
      files: ['<%= jshint.files %>',
              'src/*'
            ],
      // tasks: ['jshint'],
      options: {
        livereload: true,
        dateFormat: function(time) {
          grunt.log.writeln('Reload took ' + time + 'ms');
          grunt.log.writeln('Waiting for more changes...');
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['connect', 'open', 'watch']);
  grunt.registerTask('test', ['jshint']);
  
  grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'less:build']);

  // Allows for production server by running 'grunt server:prod'
  grunt.registerTask('server', function (target) {
    if (target === 'prod') {
      return grunt.task.run(['build']);
    }

    grunt.task.run([
      'connect:dev',
      'less:watch',
      'watch'
    ]);
  });

};
