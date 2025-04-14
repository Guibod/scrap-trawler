export const removeDiacritics = (str: string) =>
  str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const humanTimestamp = (date = new Date()) => {
  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

export const capitalize = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}