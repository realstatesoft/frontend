import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiDollarSign, FiEye, FiRefreshCw, FiPlus, FiEdit2, FiFeather, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import StatCard from '../../components/common/StatCard/StatCard';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import {
  useContractsAsListingAgent,
  useContractsAsBuyerAgent,
  useContractsAsSeller,
  useContractsAsBuyer,
  useUpdateContractStatus,
  useDownloadContract,
} from '../../hooks/useContracts';

import { useAuth } from '../../hooks/useAuth';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
} from '../../constants/contractConstants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ContractDetailModal from './ContractDetailModal';
import ContractStatusModal from './ContractStatusModal';
import ContractSignModal from './ContractSignModal';
import styles from './ContractsPage.module.scss';

const TABS = [
  { key: 'seller',    label: 'Propietario / Vendedor'  },
  { key: 'buyer',     label: 'Comprador / Inquilino'   },
  { key: 'listing',   label: 'Agente Listador'          },
  { key: 'buyerAgent',label: 'Agente del Comprador'    },
];

/** Contratos en los que el usuario puede firmar (SENT o PARTIALLY_SIGNED) */
const SIGNABLE_STATUSES = new Set(['SENT', 'PARTIALLY_SIGNED']);

export default function ContractsPage() {
  const [activeTab, setActiveTab]       = useState('seller');
  const [filterType, setFilterType]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState(null);
  const [statusContract, setStatusContract]     = useState(null);
  const [signContract, setSignContract]         = useState(null);

  const { user }                = useAuth();
  const { data: sellerRes,  isLoading: loadingSeller  } = useContractsAsSeller();
  const { data: buyerRes,   isLoading: loadingBuyer   } = useContractsAsBuyer();
  const { data: listingRes, isLoading: loadingListing } = useContractsAsListingAgent();
  const { data: bAgentRes,  isLoading: loadingBAgent  } = useContractsAsBuyerAgent();
  const updateStatus = useUpdateContractStatus();
  const downloadMutation = useDownloadContract();

  const rawLookup = {
    seller:     sellerRes?.data,
    buyer:      buyerRes?.data,
    listing:    listingRes?.data,
    buyerAgent: bAgentRes?.data,
  };
  const loadingLookup = {
    seller:     loadingSeller,
    buyer:      loadingBuyer,
    listing:    loadingListing,
    buyerAgent: loadingBAgent,
  };

  const rawList = useMemo(() => {
    const src = rawLookup[activeTab];
    return Array.isArray(src) ? src : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sellerRes, buyerRes, listingRes, bAgentRes]);

  const isLoading = loadingLookup[activeTab];

  const count = (key) => {
    const src = {
      seller:     sellerRes?.data,
      buyer:      buyerRes?.data,
      listing:    listingRes?.data,
      buyerAgent: bAgentRes?.data,
    }[key];
    return Array.isArray(src) ? src.length : 0;
  };

  const allContracts = useMemo(() => {
    const map = new Map();
    [sellerRes?.data, buyerRes?.data, listingRes?.data, bAgentRes?.data]
      .filter(Array.isArray)
      .flat()
      .forEach((c) => map.set(c.id, c));
    return [...map.values()];
  }, [sellerRes, buyerRes, listingRes, bAgentRes]);

  const stats = useMemo(() => {
    const total  = allContracts.length;
    const signed = allContracts.filter((c) => c.status === 'SIGNED').length;
    const drafts = allContracts.filter((c) => c.status === 'DRAFT').length;
    const commission = allContracts.reduce(
      (acc, c) => acc + (parseFloat(c.totalCommissionAmount) || 0), 0,
    );
    return { total, signed, drafts, commission };
  }, [allContracts]);

  const filtered = useMemo(() => rawList.filter((c) => {
    if (filterType   && c.contractType !== filterType)   return false;
    if (filterStatus && c.status       !== filterStatus) return false;
    return true;
  }), [rawList, filterType, filterStatus]);

  const handleStatusChange = async (contractId, newStatus) => {
    try {
      await updateStatus.mutateAsync({ id: contractId, status: newStatus });
      setStatusContract(null);
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El contrato pasó a: ${CONTRACT_STATUS_LABELS[newStatus]}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del contrato.',
      });
    }
  };

  const COLUMNS = [
    {
      key: 'propertyTitle',
      label: 'Propiedad',
      render: (v) => <span className={styles.contracts__propName}>{v || '-'}</span>,
    },
    {
      key: 'contractType',
      label: 'Tipo',
      render: (v) => (
        <Badge variant={v === 'SALE' ? 'info' : 'accent'}>
          {CONTRACT_TYPE_LABELS[v] || v}
        </Badge>
      ),
    },
    {
      key: 'buyerName',
      label: 'Comprador / Inquilino',
      render: (v) => v || '-',
    },
    {
      key: 'sellerName',
      label: 'Vendedor / Prop.',
      render: (v) => v || '-',
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (v) => formatCurrency(v),
    },
    {
      key: 'totalCommissionAmount',
      label: 'Comision',
      render: (v) => (
        <span className={styles.contracts__commission}>{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (v) => (
        <Badge variant={CONTRACT_STATUS_COLORS[v] || 'neutral'}>
          {CONTRACT_STATUS_LABELS[v] || v}
        </Badge>
      ),
    },
    {
      key: 'startDate',
      label: 'Fecha inicio',
      render: (v) => formatDate(v),
    },
    {
      key: '_actions',
      label: '',
      render: (_, row) => (
        <div className={styles.contracts__actions}>
          {/* Ver detalle */}
          <button
            className={styles.contracts__actionBtn}
            title="Ver detalle"
            onClick={(e) => { 
              e.stopPropagation(); 
              const base = user?.role === 'AGENT' ? 'agent' : 'owner';
              navigate(`/${base}/contratos/${row.id}`); 
            }}
          >
            <FiEye />
          </button>

          {/* Editar borrador — solo si DRAFT */}
          {row.status === 'DRAFT' && (
            <button
              className={`${styles.contracts__actionBtn} ${styles['contracts__actionBtn--edit']}`}
              title="Editar borrador"
              onClick={(e) => {
                e.stopPropagation();
                const base = user?.role === 'AGENT' ? 'agent' : 'owner';
                navigate(`/${base}/contratos/${row.id}/editar`);
              }}
            >
              <FiEdit2 />
            </button>
          )}

          {/* Firmar — solo si SENT o PARTIALLY_SIGNED y el usuario no ha firmado aún */}
          {SIGNABLE_STATUSES.has(row.status) && !row.currentUserHasSigned && (
            <button
              className={`${styles.contracts__actionBtn} ${styles['contracts__actionBtn--sign']}`}
              title="Firmar contrato"
              onClick={(e) => { e.stopPropagation(); setSignContract(row); }}
            >
              <FiFeather />
            </button>
          )}

          {/* Descargar PDF */}
          <button
            className={`${styles.contracts__actionBtn} ${styles['contracts__actionBtn--download']}`}
            title="Descargar PDF"
            onClick={(e) => {
              e.stopPropagation();
              downloadMutation.mutate({ id: row.id });
            }}
            disabled={downloadMutation.isPending}
          >
            <FiDownload />
          </button>

          {/* Cambiar estado */}
          {ALLOWED_STATUS_TRANSITIONS[row.status] && (
            <button
              className={`${styles.contracts__actionBtn} ${styles['contracts__actionBtn--update']}`}
              title="Actualizar estado"
              onClick={(e) => { e.stopPropagation(); setStatusContract(row); }}
            >
              <FiRefreshCw />
            </button>
          )}
        </div>
      ),
    },
  ];

  const FILTERS = [
    {
      key: 'type',
      label: 'Tipo de contrato',
      value: filterType,
      options: CONTRACT_TYPE_OPTIONS.map((label) => ({
        value: CONTRACT_TYPE[label],
        label,
      })),
    },
    {
      key: 'status',
      label: 'Estado',
      value: filterStatus,
      options: CONTRACT_STATUS_OPTIONS.map((label) => ({
        value: CONTRACT_STATUS[label],
        label,
      })),
    },
  ];

  const handleFilter = (key, value) => {
    if (key === 'type')   setFilterType(value);
    if (key === 'status') setFilterStatus(value);
  };

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Contratos</h1>
          <p className={styles.page__subtitle}>
            Gestion de contratos de compraventa y alquiler
          </p>
        </div>
        <button
          className={`${styles.btn} ${styles['btn--primary']}`}
          onClick={() => {
            const base = user?.role === 'AGENT' ? 'agent' : 'owner';
            navigate(`/${base}/contratos/nuevo`);
          }}
        >
          <FiPlus />
          Nuevo contrato
        </button>
      </div>

      <div className={styles.page__stats}>
        <StatCard
          label="Total Contratos"
          value={stats.total}
          icon={<FiFileText />}
          colorAccent="info"
        />
        <StatCard
          label="Contratos Firmados"
          value={stats.signed}
          icon={<FiCheckCircle />}
          colorAccent="success"
        />
        <StatCard
          label="Comision Total"
          value={formatCurrency(stats.commission)}
          icon={<FiDollarSign />}
          colorAccent="accent"
        />
      </div>

      <div className={styles.page__tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.page__tab} ${activeTab === tab.key ? styles['page__tab--active'] : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.page__tabCount}>{count(tab.key)}</span>
          </button>
        ))}
      </div>

      <div className={styles.page__card}>
        <DataTable
          columns={COLUMNS}
          data={filtered}
          loading={isLoading}
          filters={FILTERS}
          onFilter={handleFilter}
          emptyMessage="No se encontraron contratos"
        />
      </div>

      {statusContract && (
        <ContractStatusModal
          contract={statusContract}
          onConfirm={handleStatusChange}
          onClose={() => setStatusContract(null)}
          loading={updateStatus.isPending}
        />
      )}

      {signContract && (
        <ContractSignModal
          contract={signContract}
          onClose={() => setSignContract(null)}
          onSuccess={() => setSignContract(null)}
        />
      )}
    </div>
  );
}
