'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from "./utils";

interface StringToTypeMap<T> {
    [k: string]: T;
}

interface NumberToTypeMap<T> {
    [k: number]: T;
}

class SelectionHistogram {
    data: StringToTypeMap<number> = {};
    endLine: string = "\r\n";
    appendEndLine: boolean = false;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerTextEditorCommand('extension.createHistogram', (editor: vscode.TextEditor, editBuilder: vscode.TextEditorEdit) => {

        let document = editor.document;
        let selections = editor.selections;

        if (selections.length == 1 && selections[0].start.isEqual(selections[0].end)) {
            // if no selections, create histogram on entire active document.
            selections = [new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(document.lineCount, 0))];
        }

        let histograms: NumberToTypeMap<SelectionHistogram> = {};

        selections.forEach(function (selection, index) {

            let histogram = new SelectionHistogram();
            let text = document.getText(new vscode.Range(selection.start, selection.end));

            // attempt to identify line ending: if could not find CRLF, try LF. if LF not found, this could be a single line.   
            if (text.indexOf("\r\n") == -1 && text.indexOf("\n") >= 0) {
                histogram.endLine = "\n";
            }

            // TODO: continously search for line endings and create histogram while doing so.
            let lines = text.split(histogram.endLine); 

            for (let i = 0; i < lines.length; i++) {

                let line = lines[i];

                if (line.length == 0) {
                    continue;
                } 

                if (histogram.data[line] > 0) {
                    histogram.data[line] += 1;
                } else {
                    histogram.data[line] = 1;
                }
            }

            histogram.appendEndLine = text.endsWith(histogram.endLine);
            histograms[index] = histogram;
        });

        selections.forEach((selection, index) => {

            let histogram = histograms[index];
            let tuples: [string, number][] = [];

            // sort by count, descending

            for (let key in histogram.data) {
                tuples.push([key, histogram.data[key]]);
            };

            tuples.sort((a, b) => {

                if (a[1] == b[1]) {
                    return 0;
                } else if (a[1] < b[1]) {
                    return 1;
                }

                return -1;
            });

            // generate result text and replace selection
            
            let result = "";
            let maxLen = 0;

            for (let i = 0; i < tuples.length; i++) {

                let count = tuples[i][1].toString();
                let key = tuples[i][0];

                if (i == 0) {
                    maxLen = count.length;
                } else {
                    result += histogram.endLine;
                }

                result += utils.leftPad(count, maxLen, " ") + " " + key;  
            }

            if (histogram.appendEndLine) {
                result += histogram.endLine;
            }

            editBuilder.replace(selection, result);
        });
        
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}