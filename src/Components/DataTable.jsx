import { useState, useMemo } from 'react';

// Common empty state for tables
const EmptyState = ({ title = 'No results found', message = 'Try adjusting your search or filters.' }) => (
  <tr>
    <td colSpan="100%">
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </td>
  </tr>
);

const DataTable = ({ columns, data, onRowClick, emptyTitle, emptyMessage, actions }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle sorting logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle undefined/null
        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';

        // Handle numbers/strings
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                onClick={() => col.sortable !== false && requestSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
              >
                {col.label}{col.sortable !== false && getSortIndicator(col.key)}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <EmptyState title={emptyTitle} message={emptyMessage} />
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td onClick={e => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
