export function humanReadableBytes(bytes: number, decimals = 2) {
  if (bytes === 0)
    return "0 B"

  const sizes = ["B", "KB", "MB", "GB"];

  const sizeLabelIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, sizeLabelIndex)).toFixed(decimals));
  return `${size} ${sizes[sizeLabelIndex]}`;
}
