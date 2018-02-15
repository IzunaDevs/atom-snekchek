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
                result = await helpers.exec(atom.config.get("snekchek.executablePath"), parameters, options); //runs snekchek
            } catch(e){
                console.log(e);
                return []; //return nothing if lint fails
            }
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
                        console.log("pushing: "+pos);
                        console.log(error.msg,error.errcode);
                        ret.push({ //pushing the actual information to the style issue list
                                    severity: "info",
                                    location: {
                                                file: projectPath + error.path.slice(1),
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
