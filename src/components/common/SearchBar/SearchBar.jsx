import { FiSearch } from 'react-icons/fi';
import styles from './SearchBar.module.scss';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className={styles.searchBar}>
      <FiSearch className={styles.searchBar__icon} />
      <input
        type="text"
        className={styles.searchBar__input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
