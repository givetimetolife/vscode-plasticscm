import { ICmParser, ICmResult, ICmShell } from "../../shell";
import { UndoFileParser } from "./undoParser";
import { Uri } from "vscode";

export class Undo {

  public static async run(
      shell: ICmShell,
      uris: Uri[] | undefined
  ): Promise<void | undefined> {

    if (!uris) {
      return;
    }
    
    const parser: ICmParser<void> = new UndoFileParser();

    const paths: string[] = uris.map(v => {return v.fsPath});

    try {
      const result: ICmResult<void> = await shell.exec("undo", paths, parser);

      if (!result.success || result.error) {
        throw result.error;
      }

      return ;
    } catch {

    }
  }
}
