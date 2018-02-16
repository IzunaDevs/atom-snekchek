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
            const parameters = ["--json",filePath];
            const options = {
                cwd: projectPath,
                ignoreExitCode: true,
                throwOnStderr: false
            }
            result = await helpers.exec(atom.config.get("snekchek.executablePath"), parameters, options); //runs snekchek
            console.log(result);
            result = JSON.parse(result);
            for(var linter in result){ //walking all linters
                if (linter == "total" || linter == "safety"){ //ignoring total and safety for now
                    continue;
                }
                var errors = result[linter];
                for(var error in errors){ //walking all errors of one linter
                    error = errors[error];
                    var pos;
                    try{
                        pos = helpers.generateRange(textEditor, parseInt(error.line)-1, parseInt(error.col)-1); //tries to place in right line
                    } catch(e){ // if that fails, for example because of missing docstring try to default to line 1 else ignore
                        if(textEditor.getBuffer().lineLengthForRow(0) > 0){
                            pos = helpers.generateRange(textEditor, 0, 0);
                        }
                        else{
                            continue;
                        }
                    }
                    ret.push({ //pushing the actual information to the style issue list
                                severity: "error",
                                location: {
                                            file: filePath,
                                            position: pos
                                        },
                                excerpt: error.errcode + ": "+ error.msg ,
                                description: ""
                            })
                    }
                }

            return ret;
        }

    }
}
