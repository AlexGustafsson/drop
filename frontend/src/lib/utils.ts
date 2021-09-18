const TIME_MINUTE = 60
const TIME_HOUR = 60 * TIME_MINUTE
const TIME_DAY = 24 * TIME_HOUR
const TIME_WEEK = 7 * TIME_DAY
const TIME_MONTH = 4 * TIME_WEEK
const TIME_YEAR = 12 * TIME_MONTH

export function humanReadableBytes(bytes: number, decimals = 2) {
  if (bytes === 0)
    return "0 B"

  const sizes = ["B", "KB", "MB", "GB"];

  const sizeLabelIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, sizeLabelIndex)).toFixed(decimals));
  return `${size} ${sizes[sizeLabelIndex]}`;
}

export function humanReadableDuration(timestamp: number) {
  const now = Math.floor(new Date().valueOf() / 1000);
  console.log(timestamp, now);
  let difference = now - timestamp;
  let duration = "";
  if (difference >= TIME_YEAR) {
    let years = difference / TIME_YEAR;
    duration = `${years} years`;
  } else if (difference > TIME_MONTH) {
    let months = Math.round(difference / TIME_MONTH);
    duration = `${months} months`;
  } else if (difference >= TIME_DAY) {
    let day = Math.round(difference / TIME_DAY);
    duration = `${day} day`;
  } else if (difference >= TIME_HOUR) {
    let hour = Math.round(difference / TIME_HOUR);
    duration = `${hour} hour`;
  } else if (difference >= TIME_MINUTE) {
    let minutes = Math.round(difference / TIME_MINUTE);
    duration = `${minutes} minutes`;
  } else if (difference >= 0) {
    duration = `${difference} seconds`;
  }

  duration = duration.trimEnd();
  if (difference < 0)
    duration = "in " + duration;
  else
    duration += " ago";
  return duration;
}
