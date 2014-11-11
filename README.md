# grunt-stylus-base-files

> stylus-base-files is a node module for substituting list of base Stylus files to stylus tasks. Used mostly for grunt-contrib-stylus.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-stylus-base-files --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-stylus-base-files');
```

## The "stylusbasefiles" task

### Overview
In your project's Gruntfile, add a section named `stylusbasefiles` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  stylusbasefiles: {
    your_target: {
      options: {
          stylus_task: ['stylus', 'development']
      },

      files: '<%= stylus.development.files %>'
    },
  },
})
```
Then you should add task `stylusbasefiles` into task chain before `stylus` task. For example:

```js
grunt.registerTask('default', ['stylusbasefiles:your_target', 'stylus:development']);
```