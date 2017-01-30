'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import axios from 'axios';
var escape = require('markdown-escape')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated 

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });


    let disposable2 = vscode.commands.registerCommand('extension.ctest', () => {

        let alreadyOpenedFirstMarkdown = false;
    let markdown_preview_command_id = "";
    let close_other_editor_command_id = "";
    if (vscode.version < "1.3.0") {
        close_other_editor_command_id = "workbench.action.closeOtherEditors";
        markdown_preview_command_id = "workbench.action.markdown.openPreviewSideBySide";
    } else {
        close_other_editor_command_id = "workbench.action.closeEditorsInOtherGroups";
        markdown_preview_command_id = "markdown.showPreviewToSide";
    }  
        // The code you place here will be executed every time your command is executed 
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var doc = editor.document;
        //doc.languageId = "markdown";
        var selections = editor.selections;
        var txts: string[] = [];
        for (let selection of selections) {
            var text = editor.document.getText(selection);
            txts.push(text);
            console.log(text); // 1, "string", false
        } 
        const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'safsa.md'));

        vscode.workspace.openTextDocument(newFile).then((textDocument) => {
            if (!textDocument) {
                console.log('Could not open file!');
                return;
            }
            vscode.window.showTextDocument(textDocument).then((editor) => {
                if (!editor) {
                    console.log('Could not show document!');
                    return;
                }
                editor.edit(edit => {
                    var lng = doc.languageId;
                    console.log(lng);
                    var prefix = "";
                    if (lng != "plaintext"){
                        prefix = lng;
                    }
                    editor = vscode.window.activeTextEditor;
                    doc = editor.document; 

        vscode.commands.executeCommand(close_other_editor_command_id)
        .then(() => vscode.commands.executeCommand(markdown_preview_command_id))
        .then(() => {}, (e) => console.error(e));
    
                    console.log(doc.getText().length);
                    edit.delete(new vscode.Range(0, 0, doc.getText().length, 0));
                    var newstring = "";
                    for (let txt of txts) {
                        var count = 4+(txt.match(/`/g) || []).length; //logs 3
     
                        var backticks = Array(count).join("`") 
                        newstring += backticks+prefix+"\n" + txt + "\n"+backticks+"\n\nwrite your comments here\n\n";
                    }
                    edit.insert(new vscode.Position(0, 0), newstring);
                });
                //       deferred.resolve(editor);
            });
        });
        // Display a message box to the user 
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {
}