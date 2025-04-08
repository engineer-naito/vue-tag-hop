import * as vscode from "vscode";
import { parse, SFCDescriptor } from "@vue/compiler-sfc";

async function getVueSfcDescriptor(): Promise<{ descriptor: SFCDescriptor | null; document: vscode.TextDocument | null }> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return { descriptor: null, document: null };
  }

  const document = editor.document;

  if (document.languageId !== "vue") {
    vscode.window.showErrorMessage("Please open a Vue SFC (.vue file).");
    return { descriptor: null, document: null };
  }

  const { descriptor, errors } = parse(document.getText());

  if (errors.length > 0) {
    vscode.window.showErrorMessage("Error occurred while parsing Vue SFC.");
    console.error("Parsing errors:", errors);
    return { descriptor: null, document: null };
  }

  return { descriptor, document };
}

export function activate(context: vscode.ExtensionContext) {
  const analyzeCommand = vscode.commands.registerCommand("vue-tag-hop.analyzeVueFile", async () => {
    const { descriptor } = await getVueSfcDescriptor();
    if (!descriptor) {return;}

    console.log("======= Raw descriptor output (expanded) =======");
    console.dir(descriptor, { depth: null, colors: true });

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
  });

  const jumpToTemplateCommand = vscode.commands.registerCommand("vue-tag-hop.jumpToTemplate", async () => {
    const { descriptor } = await getVueSfcDescriptor();
    const editor = vscode.window.activeTextEditor;
    if (!descriptor || !editor || !descriptor.template) {return;}

    const line = descriptor.template.loc.start.line - 1;
    const position = new vscode.Position(line, 0);
    const range = new vscode.Range(position, position);

    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  });

  context.subscriptions.push(analyzeCommand, jumpToTemplateCommand);
}

export function deactivate() {}
