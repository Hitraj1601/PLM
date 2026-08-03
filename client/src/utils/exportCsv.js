/**
 * Converts an array of objects to a CSV string and triggers a browser file download.
 * @param {Array<Object>} data - The dataset to export.
 * @param {string} filename - The target filename (e.g., 'bom_export.csv').
 * @param {Array<{key: string, label: string}>} [columns] - Optional specific columns mapping.
 */
export function exportToCSV(data, filename = 'export.csv', columns = null) {
  if (!data || !data.length) return;

  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  const headers = cols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => {
    return cols.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
