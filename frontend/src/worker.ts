import { hexToCryptoKey } from "./lib/crypto/utils";
import FileUploaderWorker from "./lib/worker/file-uploader-worker";
import type { Message, InitializeMessage} from "./lib/worker/types";

let uploader: FileUploaderWorker | null = null;
onmessage = async event => {
  const message = event.data as Message;
  if (message.type === "initialize") {
    const initializeMessage = message.message as InitializeMessage;
    const key = await hexToCryptoKey(initializeMessage.key);
    uploader = new FileUploaderWorker(
      initializeMessage.token,
      initializeMessage.archiveId,
      key,
    );
  } else {
    if (uploader === null)
      throw new Error("Uploader not initialized - the initialize message must be sent before use");

    uploader.handleMessage(event);
  }
}
