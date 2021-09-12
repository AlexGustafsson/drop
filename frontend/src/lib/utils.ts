export function humanReadableBytes(bytes: number, decimals = 2) {
  if (bytes === 0)
    return "0 B"

  const sizes = ["B", "KB", "MB", "GB"];

  const sizeLabelIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, sizeLabelIndex)).toFixed(decimals));
  return `${size} ${sizes[sizeLabelIndex]}`;
}

export function humanReadableDuration(timestamp: number) {
  const now = new Date().getUTCSeconds();
  const difference = now - timestamp;
  let duration = `${difference} seconds`;
  if (difference < 0)
    duration = "in " + duration;
  else
    duration += " ago";
  return duration;
}
