module.exports = function(grunt) {
    var config

    try {
        config = require('./.screeps.json')
    } catch { }

    var branch = process.env.SCREEPS_BRANCH || config.branch
    var email = process.env.SCREEPS_EMAIL || config.email
    var token = process.env.SCREEPS_TOKEN || config.token
    var js_dir = grunt.option('jsdir') || 'js/src'
    var pkg_dir = grunt.option('pkgdir') || 'screeps/pkg'

    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-mkdir')

    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                token: token,
                branch: branch
            },
            dist: {
                src: ['dist/*']
            }
        },

        clean: {
            'dist': ['dist']
        },

        mkdir: {
            all: {
                options: {
                    mode: 0700,
                    create: ['dist']
                }
            }
        },

        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: `${js_dir}/`,
                    src: '**',
                    dest: 'dist/'
                }]
            },
            wasm: {
                files: [{
                    expand: true,
                    cwd: `${pkg_dir}/`,
                    src: ['screeps_bg.wasm'],
                    dest: 'dist/',
                }]
            },
            binds: {
                files: [{
                    expand: true,
                    cwd: `${pkg_dir}/`,
                    src: ['screeps.js'],
                    dest: 'dist/',
                }],
                options: {
                    process: function(context, srcpath) {
                        var lines = context.split(/\r?\n/).filter(s => !s.match(/require\(`util`\)/));
                        var content = lines.slice(0, lines.length - 9).join('\n');

                        return `${content}

const bytes = require("screeps_bg");
const wasmModule = new WebAssembly.Module(bytes);

imports.env = {
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({ initial: 256 }),
    table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
};

const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;`;
                    }
                },
            }
        },
    })

    grunt.registerTask('default', ['clean', 'mkdir', 'copy', 'screeps'])
}
