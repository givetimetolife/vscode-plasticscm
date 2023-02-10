import { ICmParser, ICmResult, ICmShell } from "../../shell";
import { CheckoutFileParser } from "./checkoutFileParser";
import { WorkspaceOperation } from "../../../workspaceOperations";

export class Checkout {

  public static async run(
      shell: ICmShell,
      operation: WorkspaceOperation,
      paths: string[] 
  ): Promise<void | undefined> {

    if (!paths) {
      return;
    }
    
    const parser: ICmParser<void> = new CheckoutFileParser();

    try {
       let result: ICmResult<void>;
      if(operation === WorkspaceOperation.Checkout) {
        result = await shell.exec("co", paths, parser);
      }else {
        result = await shell.exec("unco", paths, parser);
      }
      if (!result.success || result.error) {
        throw result.error;
      }
    } catch { 

    }
  }
}
