export function parseDMY(str) {
  // expects 'dd-mm-yyyy' -> Date
  const [d,m,y] = (str||'').split('-').map(Number);
  if (!d||!m||!y) return null;
  return new Date(y, m-1, d);
}
export function toDMY(date) {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
