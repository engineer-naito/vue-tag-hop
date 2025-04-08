import * as vscode from "vscode";
import { parse } from "@vue/compiler-sfc";

export function activate(context: vscode.ExtensionContext) {
  const analyzeCommand = vscode.commands.registerCommand(
    "vue-tag-hop.analyzeVueFile",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;

      if (document.languageId !== "vue") {
        vscode.window.showErrorMessage("Please open a Vue SFC (.vue file).");
        return;
      }

      const { descriptor, errors } = parse(document.getText());

      console.log("======= Raw descriptor output (expanded) =======");
      console.dir(descriptor, { depth: null, colors: true });

      if (errors.length > 0) {
        vscode.window.showErrorMessage("Error occurred while parsing Vue SFC.");
        console.error("Parsing errors:", errors);
        return;
      }

      console.log("==================== Vue SFC Block Start Lines ====================");

      if (descriptor.script) {
        console.log("<script> starts at line:", descriptor.script.loc.start.line);
      }

      if (descriptor.scriptSetup) {
        console.log("<script setup> starts at line:", descriptor.scriptSetup.loc.start.line);
      }

      if (descriptor.template) {
        console.log("<template> starts at line:", descriptor.template.loc.start.line);
      }

      descriptor.styles.forEach((style, index) => {
        console.log(`<style>[${index}] starts at line:`, style.loc.start.line);
      });

      vscode.window.showInformationMessage("Vue file analysis completed. Start lines logged in debug console.");
    }
  );

  const jumpToTemplateCommand = vscode.commands.registerCommand(
    "vue-tag-hop.jumpToTemplate",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;

      if (document.languageId !== "vue") {
        vscode.window.showErrorMessage("Please open a Vue SFC (.vue file).");
        return;
      }

      const { descriptor, errors } = parse(document.getText());

      if (errors.length > 0 || !descriptor.template) {
        vscode.window.showErrorMessage("Unable to parse or locate <template> block.");
        console.error("Parsing errors:", errors);
        return;
      }

      // indexing starts at 0
      const line = descriptor.template.loc.start.line - 1;
      const position = new vscode.Position(line, 0);
      const range = new vscode.Range(position, position);

      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
  );

  context.subscriptions.push(analyzeCommand, jumpToTemplateCommand);
}

export function deactivate() {}
