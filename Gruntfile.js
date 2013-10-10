'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 9000,
          base: 'src',
          open: 'http://localhost:<%= connect.server.options.port %>'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
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
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: '.jshintrc',
      }
    },
    less: {
      build: {
        options: {
          paths: ['src/styles'],
          yuicompress: true
        },
        files: {
          'src/styles/main.css': 'src/styles/main.less'
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
      tasks: ['jshint'],
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
      'connect',
      'less:watch',
      'watch'
    ]);
  });

};
