var gulp = require('gulp');
var sass = require('gulp-sass')(require('node-sass'));
var fileinclude = require('gulp-file-include');

var sassMain = ['./src/sass/main.scss'];
var sassSources = ['./src/components/**/*.scss']; // Any .scss file in any sub-directory

gulp.task('sass', function() {
  console.log('[GULP] compiling sass...');
  return gulp.src(sassMain) // use sassMain file source
      .pipe(sass({
          outputStyle: 'compressed' // Style of compiled CSS
      })
      .on('error', function(e) {
        console.error('[GULP] there was a sass error', e);
      })) // Log descriptive errors to the terminal
      .pipe(gulp.dest('./public')); // The destination for the compiled file
});

gulp.task('copy', function() {
  console.log('[GULP] copy files');
  return gulp.src(['./src/components/**/*.{img,png,svg,mp4,jpg,jpeg}', './src/img/*.{img,png,svg,mp4,jpg,jpeg}'])
    .pipe(gulp.dest('./public/img/'))
});

gulp.task('fileinclude', function() {
  console.log('[GULP] file include...');
  return gulp.src('./src/pages/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })
    .on('error', function(e) {
      console.log('[GULP] there was a file include error', e);
    }))
    .pipe(gulp.dest('./public'));
});

// Task to watch for changes in our file sources
gulp.task('watch', function() {
  console.log('[GULP] watching...');
  gulp.watch(sassMain, gulp.series('sass'));
  gulp.watch(sassSources, gulp.series('sass'));
  gulp.watch(['./src/pages/index.html', './src/components/**/*.html'], gulp.series('fileinclude'))
  gulp.watch(['./src/components/**/*', './src/img/*'], gulp.series('copy'))
});

gulp.task('default', gulp.series('sass', 'fileinclude', 'copy', 'watch'));

gulp.task('prod', gulp.series('sass', 'fileinclude', 'copy'));
