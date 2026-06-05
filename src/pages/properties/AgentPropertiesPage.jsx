import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import useAgentProperties from '../../hooks/useAgentProperties';
import propertyApi from '../../services/properties/propertyApi';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import Swal from 'sweetalert2';
import usePropertyPriceDisplay from '../../hooks/usePropertyPriceDisplay';
import styles from './AgentPropertiesPage.module.scss';

const PROPERTY_TYPE_LABELS = {
  HOUSE: 'Casa',
  APARTMENT: 'Departamento',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  WAREHOUSE: 'Depósito',
  FARM: 'Granja',
};

const PROPERTY_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  PUBLISHED: 'Publicado',
  SOLD: 'Vendido',
  RENTED: 'Alquilado',
  ARCHIVED: 'Archivado',
};

const PROPERTY_STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  PUBLISHED: 'info',
  SOLD: 'accent',
  RENTED: 'accent',
  ARCHIVED: 'neutral',
};

const TYPE_OPTIONS = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'WAREHOUSE', label: 'Depósito' },
  { value: 'FARM', label: 'Granja' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'RENTED', label: 'Alquilado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];

export default function AgentPropertiesPage() {
  const { data: response, isLoading } = useAgentProperties();
  const queryClient = useQueryClient();
  const { formatPrice } = usePropertyPriceDisplay(0);
  const properties = response?.data || [];
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [acceptingAssignmentId, setAcceptingAssignmentId] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await propertyApi.getMyAssignments();
      const all = res.data?.data ?? res.data ?? [];
      setPendingRequests(all.filter((a) => a.status === 'PENDING'));
    } catch (err) {
      console.error("Error al cargar solicitudes pendientes:", err);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  async function handleAccept(assignmentId) {
    const confirm = await Swal.fire({
      title: '¿Aceptar la gestión de esta propiedad?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    setAcceptingAssignmentId(assignmentId);
    try {
      await propertyApi.acceptAssignment(assignmentId);
      Swal.fire({ icon: 'success', title: 'Asignación aceptada', timer: 1500, showConfirmButton: false });
      fetchPendingRequests();
      queryClient.invalidateQueries({ queryKey: ['agentProperties'] });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al aceptar' });
    } finally {
      setAcceptingAssignmentId(null);
    }
  }

  async function handleReject(assignmentId) {
    const confirm = await Swal.fire({
      title: '¿Rechazar esta solicitud?',
      text: 'El propietario será notificado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      await propertyApi.rejectAssignment(assignmentId);
      Swal.fire({ icon: 'success', title: 'Solicitud rechazada', timer: 1500, showConfirmButton: false });
      fetchPendingRequests();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al rechazar' });
    }
  }

  const columns = useMemo(() => [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Propiedad',
      render: (v, row) => (
        <Link to={`/properties/${row.id}`} style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 500 }}>
          {v}
        </Link>
      ),
    },
    { key: 'propertyType', label: 'Tipo', render: (v) => PROPERTY_TYPE_LABELS[v] || v },
    { key: 'price', label: 'Precio', render: (v) => formatPrice(v).label || '—' },
    { key: 'locationName', label: 'Ubicación' },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (
        <Badge variant={PROPERTY_STATUS_COLORS[value] || 'neutral'}>
          {PROPERTY_STATUS_LABELS[value] || value}
        </Badge>
      ),
    },
  ], [formatPrice]);

  const filteredData = useMemo(() => {
    let result = properties;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.locationName?.toLowerCase().includes(q) ||
          p.id?.toString().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter((p) => p.propertyType === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [properties, search, typeFilter, statusFilter]);

  const handleFilter = (key, value) => {
    if (key === 'propertyType') setTypeFilter(value);
    if (key === 'status') setStatusFilter(value);
  };

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Propiedades</h1>
          <p className={styles.page__subtitle}>Administra tu inventario de propiedades</p>
        </div>
        <Link to="/create-property">
          <Button variant="primary" size="sm">
            <FiHome /> Nueva Propiedad
          </Button>
        </Link>
      </div>

      {!loadingRequests && pendingRequests.length > 0 && (
        <div className={styles.page__card} style={{ marginBottom: 16, padding: 16, border: '1px solid #ffeeba', backgroundColor: '#fff3cd' }}>
          <h6 className="mb-3" style={{ fontWeight: 600 }}>
            Solicitudes de asignación{' '}
            <Badge variant="warning">{pendingRequests.length}</Badge>
          </h6>
          {pendingRequests.map((req) => (
            <div key={req.id} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee' }}>
              <div>
                <strong>{req.propertyTitle}</strong>
                <br />
                <small className="text-muted">{req.propertyAddress || ''}</small>
                <br />
                <small className="text-muted">Propietario: {req.ownerName}</small>
              </div>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleAccept(req.id)}
                  disabled={acceptingAssignmentId === req.id}
                >
                  {acceptingAssignmentId === req.id ? 'Aceptando…' : 'Aceptar'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleReject(req.id)}>
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.page__card}>
        <DataTable
          columns={columns}
          data={filteredData}
          loading={isLoading}
          onSearch={setSearch}
          filters={[
            { key: 'propertyType', label: 'Tipo', value: typeFilter, options: TYPE_OPTIONS },
            { key: 'status', label: 'Estado', value: statusFilter, options: STATUS_OPTIONS },
          ]}
          onFilter={handleFilter}
          emptyMessage="No se encontraron propiedades"
        />
      </div>
    </div>
  );
}
