import { ICmParser, ICmResult, ICmShell } from "../../shell";
import { AddFileParser } from "./addFileParser";
import { Uri } from "vscode";

export class AddFile {

  public static async run(
      shell: ICmShell,
      uris: Uri[] | undefined
  ): Promise<void | undefined> {

    if (!uris) {
      return;
    }
    
    const parser: ICmParser<void> = new AddFileParser();

    const paths: string[] = uris.map(v => {return v.fsPath});

    try {
      const result: ICmResult<void> = await shell.exec("add", paths, parser);

      if (!result.success || result.error) {
        throw result.error;
      }

      return ;
    } catch {

    }
  }
}
