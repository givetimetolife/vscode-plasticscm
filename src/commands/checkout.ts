import { commands, Disposable, SourceControlResourceGroup, window, Uri, SourceControlResourceState } from "vscode";
import { Checkout as CmCheckoutCommand } from "../cm/commands";
import { PlasticScm } from "../plasticScm";
import { PlasticScmResource } from "../plasticScmResource";
import { Workspace } from "../workspace";
import { WorkspaceOperation } from "../workspaceOperations";


export class UndoCheckoutCommand implements Disposable {
    private readonly mPlasticScm: PlasticScm;
    private readonly mDisposable?: Disposable;
  
    public constructor(plasticScm: PlasticScm) {
      this.mPlasticScm = plasticScm;
      this.mDisposable = commands.registerCommand(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        "plastic-scm.undocheckout", args => execute(args, plasticScm, WorkspaceOperation.UndoCheckout));
    }

    public dispose(): void {
        if (this.mDisposable) {
          this.mDisposable.dispose();
        }
    }
}  

export class CheckoutCommand implements Disposable {
  private readonly mPlasticScm: PlasticScm;
  private readonly mDisposable?: Disposable;

  public constructor(plasticScm: PlasticScm) {
    this.mPlasticScm = plasticScm;
    this.mDisposable = commands.registerCommand(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      "plastic-scm.checkout", args => execute(args, plasticScm, WorkspaceOperation.Checkout));
  }

  public dispose(): void {
    if (this.mDisposable) {
      this.mDisposable.dispose();
    }
  }

}

async function execute(args: any, mPlasticScm: PlasticScm, operation: WorkspaceOperation): Promise<void> {

    const workspace: Workspace | undefined = args instanceof Workspace ?
    args as Workspace :
    await mPlasticScm.promptUserToPickWorkspace();

    if (!workspace) {
        return;
    }

    if (workspace.operations.isRunning(WorkspaceOperation.Checkin)) {
        return;
    }

    
    let uris: string[] = [];

    if (args instanceof Uri) {
      if (args.scheme === "file") {
        uris = [args.fsPath];
      }
    } else {
      const resource = args;

      if (resource) {
        // uris =  ([ resource ] as PlasticScmResource[]).map(r => r.resourceUri.fsPath);

        uris = [(resource as PlasticScmResource).resourceUri.fsPath];
      } else if (window.activeTextEditor) {
        uris = [window.activeTextEditor.document.uri.fsPath];
      }
    }

    if(uris === undefined || uris.length ===0){
        return
    }

    await workspace.operations.run(operation, async () => {
      try {
        const coResult = await CmCheckoutCommand.run(
          workspace.shell,
          operation,
          uris);
      } catch (e) {
        const error = e as Error;
        const token = "Error: ";
        const message = error.message.substring(error.message.lastIndexOf(token) + token.length);
        mPlasticScm.channel.appendLine(`ERROR: ${message}`);
        await window.showErrorMessage(`Plastic SCM Checkout failed: ${message}`);
      }
    });
  }