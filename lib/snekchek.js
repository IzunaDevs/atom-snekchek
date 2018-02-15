'use babel'
let helpers;
let result;
let projectPath

helpers = require('atom-linter');



export function activate() {
    console.log("snekchek activated");
}

export function deactivate() {
    console.log("snekchek deactivated");
}

export function provideLinter() {
    console.log("snekchek linting")

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
                    if (linter == "total")
                        continue
                    var errors = result[linter];
                    for(var error in errors){
                        error = errors[error];
                        console.log(atom.project.relativizePath(error.path));
                        ret.push({
                                    severity: "error",
                                    location: {
                                                file: editorPath + error.path.slice(1),
                                                position: helpers.generateRange(textEditor, error.line, error.col)
                                            },
                                    excerpt: error.errcode + ": "+ error.msg ,
                                    description: ""
                    })
                    }
                }
            } catch(e){
                console.log(e);
            }
            console.log(JSON.stringify(ret));
            return ret;
        }

    }
}
