'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';
var escape = require('markdown-escape')

// The commands have been defined in the package.json file

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    var userEmail;
    var userPassword;

    // Login with InnoFlow account
    let login = vscode.commands.registerCommand('extension.login', () => {
        vscode.window.showInputBox({prompt: 'Please enter your InnoFlow email:'})
            .then(val => {
                userEmail = val;
                vscode.window.showInputBox({prompt: 'Please enter your password:'})
                    .then(val => {
                        userPassword = val;
                    });
            });
    });

    // Submit correct tab to InnoFlow server
    let submit = vscode.commands.registerCommand('extension.submit', () => {

        // Check if there is active tab
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active text editor');
            return; // No open text editor
        }
        var doc = editor.document;

        // Check if user logged in with InnoFlow acount
        if (!userEmail || !userPassword) {
            vscode.window.showInformationMessage('Please login with InnoFlow account (Default shortcut: shift+cmd+l on Mac, shift+window+l on Window)');
            return;
        }

        // Allow user to cancel submission
        vscode.window.showQuickPick(['Submit Code/Comment','Cancel'])
            .then(val => {
                if (val != 'Cancel') {
                    var data = JSON.stringify({
                        email : userEmail,
                        password : userPassword,
                        code : doc.getText()
                    });

                    vscode.window.showInformationMessage('Submitting Code/Comment');
                    require('./httpsConnection/httpsRequest.js')(data);
                } else {
                    vscode.window.showInformationMessage('Code/Comment submission cancelled');
                    return;
                }
            })
    });


    let highlight = vscode.commands.registerCommand('extension.highlight', () => {

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
            var editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // No open text editor
            }

            var doc = editor.document;
            var selections = editor.selections;
            var txts: string[] = [];
            for (let selection of selections) {
                var text = editor.document.getText(selection);
                txts.push(text);
                console.log(text);
            }
            if  (vscode.workspace.rootPath === undefined) {
                vscode.window.showInformationMessage('Please open a folder first.');
            return;
            } 
            const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'highlight.md'));

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
                });
            });
        });
    context.subscriptions.push(login);
    context.subscriptions.push(submit);
    context.subscriptions.push(highlight);
}

// this method is called when your extension is deactivated
export function deactivate() {

}