import FileUploaderWorker from "./lib/worker/file-uploader-worker";
import type {Message} from "./lib/worker/types";

const uploader = new FileUploaderWorker();
onmessage = event => uploader.handleMessage(event);
