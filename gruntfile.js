module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-ts");

  grunt.initConfig({
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: "./assets",
            src: ["**"],
            dest: "./dist/assets"
          },
          {
            expand: true,
            cwd: ".",
            src: ["index.html"],
            dest: "./dist"
          }
        ]
      }
    },
    ts: {
      app: {
        files: [{
          src: ["ts/**/*.ts"],
          dest: "./dist/js/"
        }],
        options: {
          module: "commonjs",
          target: "es6",
          sourceMap: false,
          rootDir: "ts"
        }
      }
    },
    less: {
      development: {
        files: [{
          expand: true,
          cwd: 'less',
          src: ['*.less'],
          dest: './dist/css/',
          ext: '.css'
        }],
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        }
      }
    },
    watch: {
      ts: {
        files: ["ts/**/*.ts"],
        tasks: ["ts"]
      },
      views: {
        files: ["views/**/*.pug"],
        tasks: ["copy"]
      },
      less: {
        files: ["less/**/*.less"],
        tasks: ["less"]
      }
    }
  });

  grunt.registerTask("default", [
    "copy",
    "ts",
    "less"
  ]);

};