'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';
import * as tmp from 'tmp';
var escape = require('markdown-escape')


var userEmail;
var userPassword; 
// The commands have been defined in the package.json file
function login(a=null, b=null){  
    if (a !== null && b !== null){
        userEmail = a;
        userPassword = b;
    }
    else{
        vscode.window.showInputBox({prompt: 'Please enter your InnoFlow email:'})
            .then(val => {
                userEmail = Buffer.from(val).toString('base64');
                vscode.window.showInputBox({prompt: 'Please enter your password:'})
                    .then(val => {
                        userPassword = Buffer.from(val).toString('base64');
                    });
            }); 
    }
    return true;
}

function submit(){

        // Check if there is active tab
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active text editor');
            console.log('No active text editor');  // No open text editor
            return;
        }
        var doc = editor.document;

        // Check if user logged in with InnoFlow acount
        if (!userEmail || !userPassword) {
            vscode.window.showInformationMessage('Please login with InnoFlow account (Default shortcut: shift+cmd+l on Mac, shift+window+l on Window)');
            console.log('Please login with InnoFlow account'); 
            return;
        }

        // Allow user to cancel submission
        vscode.window.showQuickPick(['Submit Code/Comment','Cancel'])
            .then(val => {
                if (val != 'Cancel') {
                    var data = JSON.stringify({
                        email : userEmail,
                        password : userPassword,
                        code : Buffer.from(doc.getText()).toString('base64')
                    });

                    vscode.window.showInformationMessage('Submitting Code/Comment');
                    require('./httpsConnection/httpsRequest.js')(data);
                } else {
                    vscode.window.showInformationMessage('Code/Comment submission cancelled');
                    console.log('Code/Comment submission cancelled');
                    return;
                }
            })
            return true;
    }

function highlight(){    

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
                console.log( 'No active text editor'); // No open text editor
                return;
            }

            var doc = editor.document;
            var selections = editor.selections;
            var txts: string[] = [];
            for (let selection of selections) {
                var text = editor.document.getText(selection);
                txts.push(text);
                console.log(text);
            }
            var newFile;
            if  (vscode.workspace.rootPath === undefined) {
                vscode.window.showInformationMessage('Please open a folder first.');
                console.log('Please open a folder first.');  
		        let dir = tmp.dirSync(); 
                var testpath = dir.name;  
                newFile = vscode.Uri.parse('untitled:' + path.join(testpath,'highlight.md'));

            } 
            else{
              newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'highlight.md'));

            }

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
            return true;
        }

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) { 
    // Login with InnoFlow account
    let disposablelogin = vscode.commands.registerCommand('extension.login',login);

    // Submit correct tab to InnoFlow server
    let disposablesubmit = vscode.commands.registerCommand('extension.submit',  submit);

    let disposablehighlight = vscode.commands.registerCommand('extension.highlight', highlight);
    context.subscriptions.push(disposablelogin);
    context.subscriptions.push(disposablesubmit);
    context.subscriptions.push(disposablehighlight);
    return true;
}

// this method is called when your extension is deactivated
export function deactivate() {

}