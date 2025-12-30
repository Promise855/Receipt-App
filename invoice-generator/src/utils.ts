export function numberToWords(num: number): string {
  if (isNaN(num) || num < 0) return "Invalid Amount";
  if (num === 0) return "Zero Naira Only";

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion"];

  function convertGroupToWords(n: number): string {
    let words = [];
    if (n >= 100) {
      words.push(units[Math.floor(n / 100)] + " Hundred");
      n %= 100;
      if (n > 0) words.push("And");
    }
    if (n >= 20) {
      words.push(tens[Math.floor(n / 10)]);
      n %= 10;
    } else if (n >= 10) {
      words.push(teens[n - 10]);
      return words.join(" ");
    }
    if (n > 0) words.push(units[n]);
    return words.join(" ");
  }

  let [integerPart, decimalPart] = num.toFixed(2).split(".");
  integerPart = parseInt(integerPart, 10);
  decimalPart = parseInt(decimalPart, 10);

  let words = [];
  let scaleIndex = 0;

  while (integerPart > 0) {
    let group = integerPart % 1000;
    if (group > 0) {
      let groupWords = convertGroupToWords(group);
      if (scaleIndex > 0) groupWords += " " + scales[scaleIndex];
      words.unshift(groupWords);
    }
    integerPart = Math.floor(integerPart / 1000);
    scaleIndex++;
  }

  let integerWords = words.length > 0 ? words.join(" ") : "Zero";
  let decimalWords = decimalPart > 0 ? convertGroupToWords(decimalPart) + " Kobo" : "";
  return integerWords + " Naira" + (decimalWords ? " and " + decimalWords : "") + " Only";
}