const {src, dest, watch, series, parallel} = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();
const pkg = require('./package.json');
const conf = pkg["gulp-config"];
const sizes = conf.sizes;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const server = browserSync.create();
const isProd = process.env.NODE_ENV === "production";

function icon(done) {
  for(let size of sizes) {
    let width = size[0];
    let height = size[1];
    src('./icon.png')
      .pipe($.imageResize({
        width,
        height,
        crop: true,
        upscale: false
      }))
      .pipe($.imagemin())
      .pipe($.rename(`favicon-${width}x${height}.png`))
      .pipe(dest('./dist/images/icon'));
  }
  done();
}

function styles() {
  return src(
    "/Users/takahashitakumi/Downloads/workspace/gulptest/src/sass/main.scss"
  )
    .pipe($.if(!isProd,$.sourcemaps.init()))
    .pipe(sass())
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe($.if(!isProd,$.sourcemaps.write('.')))
    .pipe(dest("./dist/css"));
}

function scripts() {
  return src("./src/js/*.js")
    .pipe($.if(!isProd,$.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(!isProd,$.sourcemaps.write(".")))
    .pipe(dest("./dist/js"));
}

function startAppServer() {
  server.init({
    server: {
      baseDir: './dist'
    }
  });

  watch('./src/**/*.scss', styles);
  watch('./src/**/*.scss').on('change', server.reload);
}

function lint() {
  return src("./src/js/*.js")
    .pipe($.eslint({fix: true}))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .pipe(dest("./src/js"));
}

const serve = series(parallel(styles, series(lint, scripts)), startAppServer);
exports.icon = icon;
exports.scripts = scripts;
exports.styles = styles;
exports.lint = lint;
exports.serve = serve;