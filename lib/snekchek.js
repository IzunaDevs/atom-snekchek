'use babel'
let helpers;
let result;
let projectPath

helpers = require('atom-linter');



export function activate() {

}

export function deactivate() {
}

export function provideLinter() {

    return {
        name: "snekchek",
        scope: "file",
        lintsOnChange: false,
        grammarScopes: ["source.python"],
        lint: async (textEditor) => {
            projectPath = atom.project.relativizePath(textEditor.getPath())[0];
            var ret = [];
            const editorPath = textEditor.getPath();
            const filePath = textEditor.getPath()
            const parameters = ["--json"];
            const options = {
                cwd: projectPath,
                ignoreExitCode: true,
            }
            try{
                result = await helpers.exec(atom.config.get("snekchek.executablePath"), parameters, options);
                result = JSON.parse(result);
                for(var linter in result){
                    if (linter == "total" || linter == "safety")
                        continue
                    var errors = result[linter];
                    for(var error in errors){
                        error = errors[error];

                        ret.push({
                                    severity: "info",
                                    location: {
                                                file: projectPath + error.path.slice(1),
                                                position: helpers.generateRange(textEditor, parseInt(error.line), parseInt(error.col))
                                            },
                                    excerpt: error.errcode + ": "+ error.msg ,
                                    description: ""
                                })
                    }
                }
            } catch(e){
                console.log(e);
            }
            return ret;
        }

    }
}
