// will be removed

module.exports = function (grunt) {
	grunt.initConfig({
        ts: {
            default: {
                tsconfig: {
                    tsconfig: 'tsconfig.json',
                    ignoreFiles: false,
                    ignoreSettings: false,
                    overwriteFilesGlob: false,
                    updateFiles: true
                }
                //watch: 'app'
            }
        }
	});

    grunt.loadNpmTasks("grunt-ts");

	grunt.registerTask('default', [
		'ts'
	]);
};
