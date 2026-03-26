import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import styles from './DataTable.module.scss';

export default function DataTable({
  columns,
  data,
  loading,
  onSearch,
  filters,
  onFilter,
  emptyMessage = 'No se encontraron resultados',
}) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (val) => {
    setSearchValue(val);
    onSearch?.(val);
  };

  if (loading) {
    return (
      <div className={styles.dataTable__loading}>
        <div className={styles.dataTable__spinner} />
      </div>
    );
  }

  return (
    <div className={styles.dataTable}>
      <div className={styles.dataTable__toolbar}>
        {onSearch && (
          <SearchBar value={searchValue} onChange={handleSearch} placeholder="Buscar..." />
        )}
        {filters && (
          <div className={styles.dataTable__filters}>
            {filters.map((filter) => (
              <select
                key={filter.key}
                className={styles.dataTable__filterSelect}
                value={filter.value}
                onChange={(e) => onFilter?.(filter.key, e.target.value)}
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      <table className={styles.dataTable__table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.dataTable__th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.dataTable__empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id ?? idx} className={styles.dataTable__row}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.dataTable__td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
