import * as vscode from "vscode";
import { parse } from "@vue/compiler-sfc";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vueSfcAnalyzer.analyzeVueFile",
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

      if (errors.length > 0) {
        vscode.window.showErrorMessage("Error occurred while parsing Vue SFC.");
        console.error("Parsing errors:", errors);
        return;
      }

      console.log("==================== Vue SFC Analysis Result ====================");
      if (descriptor.template) {
        console.log("template:", descriptor.template.content);
      }

      if (descriptor.script) {
        console.log("script:", descriptor.script.content);
      }

      if (descriptor.scriptSetup) {
        console.log("script Setup:", descriptor.scriptSetup.content);
      }

      console.log("style:");
      for (const style of descriptor.styles) {
        console.log(style.content);
      }

      vscode.window.showInformationMessage("Vue file analysis completed. See the debug console for details.");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
