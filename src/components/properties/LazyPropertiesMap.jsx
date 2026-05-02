import { lazy, Suspense } from 'react';
import { Spinner } from 'react-bootstrap';

const PropertiesMap = lazy(() => import('./PropertiesMap'));

/**
 * Lazy-loading wrapper for PropertiesMap.
 * Defers the ~250KB Leaflet bundle until the map is actually rendered.
 * The fallback preserves the exact layout height to prevent CLS.
 */
export default function LazyPropertiesMap(props) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: 440,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa',
            borderRadius: 24,
          }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      }
    >
      <PropertiesMap {...props} />
    </Suspense>
  );
}
