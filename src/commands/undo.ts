import { commands, Disposable, SourceControlResourceState, window, Uri } from "vscode";
import { ChangeType } from "../models";
import { Undo as CmUndoCommand } from "../cm/commands";
import { PlasticScm } from "../plasticScm";
import { PlasticScmResource } from "../plasticScmResource";
import { Workspace } from "../workspace";
import { WorkspaceOperation } from "../workspaceOperations";

export class UndoCommand implements Disposable {
  private readonly mPlasticScm: PlasticScm;
  private readonly mDisposable?: Disposable;

  public constructor(plasticScm: PlasticScm) {
    this.mPlasticScm = plasticScm;
    this.mDisposable = commands.registerCommand(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      "plastic-scm.undo", args => this.execute(args));
  }

  public dispose(): void {
    if (this.mDisposable) {
      this.mDisposable.dispose();
    }
  }

  public async execute(
    arg?: PlasticScmResource | Uri,
    ...resourceStates: SourceControlResourceState[]): Promise<void> {
    const workspace: Workspace | undefined = await this.mPlasticScm.promptUserToPickWorkspace();
    if (!workspace) {
      return;
    }

    let uris: Uri[] | undefined;

    if (arg instanceof Uri) {
      if (arg.scheme === "file") {
        uris = [arg];
      }
    } else {
      const resource = arg;

      // if (!(resource instanceof PlasticScmResource)) {
      //   // can happen when called from a keybinding
      //   resource = this.getSCMResource();
      // }

      if (resource) {
        uris = ([ resource, ...resourceStates ] as PlasticScmResource[])
          .filter(r => r.type !== ChangeType.Deleted)
          .map(r => r.resourceUri);
      } else if (window.activeTextEditor) {
        uris = [window.activeTextEditor.document.uri];
      }
    }

    if (!uris) {
      return;
    }


    await workspace.operations.run(WorkspaceOperation.UndoCheckout, async () => {
      try {
        const result = await CmUndoCommand.run(
          workspace.shell,
          uris,
        );

        // return success msg
        await Promise.all("");
      } catch (e) {
        const error = e as Error;
        const token = "Error: ";
        const message = error.message.substring(error.message.lastIndexOf(token) + token.length);
        this.mPlasticScm.channel.appendLine(`ERROR: ${message}`);
        await window.showErrorMessage(`Plastic SCM Undo File failed: ${message}`);
      }
    });
  }
}
