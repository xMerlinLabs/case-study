var gulp = require('gulp');
var sass = require('gulp-sass');
var fileinclude = require('gulp-file-include');

var sassMain = ['./src/sass/main.scss'];
var sassSources = ['./src/components/**/*.scss']; // Any .scss file in any sub-directory

gulp.task('sass', function() {
  console.log('compiling sass...');
  return gulp.src(sassMain) // use sassMain file source
      .pipe(sass({
          outputStyle: 'compressed' // Style of compiled CSS
      })
      .on('error', function() {
        console.log('there was a sass error');
      })) // Log descriptive errors to the terminal
      .pipe(gulp.dest('./public')); // The destination for the compiled file
});

gulp.task('fileinclude', function() {
  console.log('file include...');
  return gulp.src('./src/pages/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })
    .on('error', function(e) {
      console.log('there was a file include error');
    }))
    .pipe(gulp.dest('./public'));
});

// Task to watch for changes in our file sources
gulp.task('watch', function() {
  console.log('watching...');
  gulp.watch(sassMain, gulp.series('sass'));
  gulp.watch(sassSources, gulp.series('sass'));
  gulp.watch(['./src/pages/index.html'], gulp.series('fileinclude'))
  //gulp.series(gulp.watch(sassMain,['sass']), gulp.watch(sassSources,['sass']));
});

gulp.task('default', gulp.series('sass', 'fileinclude', 'watch'));