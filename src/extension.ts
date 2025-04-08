import * as vscode from "vscode";
import { parse } from "@vue/compiler-sfc";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
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

      const text = document.getText();
      const { descriptor, errors } = parse(text, { sourceMap: false });

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

  context.subscriptions.push(disposable);
}

export function deactivate() {}
