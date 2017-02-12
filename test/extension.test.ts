//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

import * as path from 'path';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
//import * as vscode from 'vscode';

import { Disposable } from 'vscode';
//import * as myExtension from '../src/extension';
var tmp = require('tmp');
import * as mockery from 'mockery';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Startup Tests", () => {
    let vscode, extension, context;
	/*suiteSetup(() => {
        context = {
            subscriptions: [],
        };
        extension = require("../src/extension");
	});*/
    suiteSetup(() => {
        mockery.enable({ useCleanCache: true });
        mockery.warnOnUnregistered(false);

        vscode = {
            commands: {
                registerCommand: (commandName, activationAction) => <Disposable> {
                    commandName,
                    activate: activationAction,
                    dispose: () => { /* NOOP */ },
                },
            },
        };

        mockery.registerMock("vscode", vscode);
    });
    setup(() => {
        context = {
            subscriptions: [],
        };

        extension = require("../src/extension");
    });

    suiteTeardown(() => {
        mockery.disable();
    });
    test("should activate", (done) => {

        let activation = extension.activate(context);

        assert.equal(!!activation, true);

        done();
    });

    test("should register command", (done) => {

        extension.activate(context);

        assert.equal(!!context.subscriptions.length, true);

        done();
    });

});

import * as vscode from 'vscode';
// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Function Tests", () => { 
    
    
    suiteSetup( () => {
 

        var testpath; 
		let dir = tmp.dirSync(); 
        testpath = dir.name; 
        let uri1 = vscode.Uri.parse(testpath);
        //vscode.commands.executeCommand('vscode.openFolder', uri1, false);  
 
        //console.log(vscode.workspace.rootPath )
       //var extension = require("../src/extension");
    });
    suiteTeardown(() => {
        vscode.commands.executeCommand('vscode.closeFolder');  
    }); 
    test("should call login without errors",  async ( ) => {
  
        assert.ok(await vscode.commands.executeCommand('extension.login', "a", "b")); 
 
    });
    test("should call highlight without errors", async ( ) => { 

        assert.ok(await vscode.commands.executeCommand('extension.highlight')); 
 
    });
    test("should call submit without errors", async ( ) => {

        assert.ok(await vscode.commands.executeCommand('extension.submit')); 
    });
    // Defines a Mocha unit test
    /*
    test('Open Preview Side By Side', async () => {
		let uri = vscode.Uri.file(path.join(testpath, 'ok.test'));
		let doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc);
		assert.ok(await vscode.commands.executeCommand('uiflow.openPreviewSideBySide'));
	});

    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });*/
 


});