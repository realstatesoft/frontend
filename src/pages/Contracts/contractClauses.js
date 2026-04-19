/**
 * Cláusulas predefinidas para contratos de Venta, Alquiler y Generales.
 */

export const SALE_CLAUSES = [
  {
    id: 'sale_title',
    label: 'Título de propiedad limpio',
    text: 'El vendedor declara que el inmueble se encuentra libre de gravámenes, hipotecas, embargos, litigios pendientes y cualquier limitación de dominio. En caso de existir algún vicio oculto en el título, el vendedor será responsable de su saneamiento.',
  },
  {
    id: 'sale_delivery',
    label: 'Entrega del inmueble',
    text: 'El vendedor se compromete a entregar el inmueble en las mismas condiciones en que fue mostrado al comprador, incluyendo instalaciones fijas, accesorios y mejoras existentes, en un plazo no mayor a 30 días hábiles contados a partir de la firma de la escritura pública.',
  },
  {
    id: 'sale_payment',
    label: 'Forma de pago',
    text: 'El comprador se obliga a realizar el pago del precio pactado según el calendario de pagos acordado. El incumplimiento de cualquier pago en la fecha estipulada generará intereses moratorios del 1.5% mensual sobre el monto vencido.',
  },
  {
    id: 'sale_expenses',
    label: 'Gastos de escrituración',
    text: 'Los gastos notariales, registrales, impuestos de transferencia y cualquier otro costo asociado a la escrituración serán cubiertos de la siguiente manera: 50% por el vendedor y 50% por el comprador, salvo acuerdo diferente entre las partes.',
  },
  {
    id: 'sale_warranty',
    label: 'Vicios ocultos',
    text: 'El vendedor garantiza que el inmueble no presenta vicios ocultos estructurales. En caso de descubrirse defectos no visibles dentro de los 6 meses posteriores a la entrega, el vendedor asumirá los costos de reparación o, a elección del comprador, se reducirá proporcionalmente el precio de venta.',
  },
  {
    id: 'sale_penalty',
    label: 'Cláusula penal por incumplimiento',
    text: 'En caso de incumplimiento por cualquiera de las partes, la parte incumplidora deberá pagar como penalidad el equivalente al 10% del valor total del contrato, sin perjuicio de las acciones legales que correspondan.',
  },
  {
    id: 'sale_arbitration',
    label: 'Resolución de controversias',
    text: 'Cualquier controversia derivada del presente contrato será resuelta mediante arbitraje ante el centro de arbitraje de la localidad, conforme a su reglamento vigente. Las partes renuncian a cualquier otro fuero que pudiera corresponderles.',
  },
];

export const RENT_CLAUSES = [
  {
    id: 'rent_use',
    label: 'Uso del inmueble',
    text: 'El inquilino se compromete a utilizar el inmueble exclusivamente para uso habitacional/comercial según lo pactado. Queda prohibido destinar el inmueble a actividades distintas, subarrendar total o parcialmente, o ceder el contrato sin autorización escrita del propietario.',
  },
  {
    id: 'rent_payment',
    label: 'Pago de renta',
    text: 'El inquilino pagará la renta mensual dentro de los primeros 5 días de cada mes. El retraso en el pago generará un recargo del 5% sobre el monto mensual por cada semana de atraso. Dos meses consecutivos de impago facultarán al propietario para rescindir el contrato.',
  },
  {
    id: 'rent_deposit',
    label: 'Depósito de garantía',
    text: 'Al momento de la firma, el inquilino entregará un depósito equivalente a 2 meses de renta como garantía. Dicho depósito será devuelto al término del contrato, previa verificación del estado del inmueble y deducción de adeudos pendientes, en un plazo no mayor a 30 días.',
  },
  {
    id: 'rent_maintenance',
    label: 'Mantenimiento y reparaciones',
    text: 'Las reparaciones menores y el mantenimiento ordinario del inmueble serán responsabilidad del inquilino. Las reparaciones mayores de tipo estructural, instalaciones eléctricas principales, plomería y techos serán responsabilidad del propietario, salvo que el daño sea causado por negligencia del inquilino.',
  },
  {
    id: 'rent_inspection',
    label: 'Inspecciones periódicas',
    text: 'El propietario podrá realizar inspecciones al inmueble con previo aviso de 48 horas al inquilino. Las inspecciones se realizarán en horario hábil y con una frecuencia no mayor a una vez por trimestre, salvo situaciones de emergencia.',
  },
  {
    id: 'rent_termination',
    label: 'Terminación anticipada',
    text: 'Cualquiera de las partes podrá dar por terminado el contrato antes de su vencimiento, notificando por escrito con al menos 60 días de anticipación. En caso de terminación anticipada por parte del inquilino, este perderá el depósito de garantía como penalización.',
  },
  {
    id: 'rent_return',
    label: 'Devolución del inmueble',
    text: 'Al término del contrato, el inquilino deberá devolver el inmueble en las mismas condiciones en que lo recibió, descontando el desgaste normal por el uso. Se levantará un acta de entrega firmada por ambas partes donde se detalle el estado del inmueble.',
  },
];

export const GENERAL_CLAUSES = [
  {
    id: 'gen_force_majeure',
    label: 'Fuerza mayor',
    text: 'Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando este se deba a causas de fuerza mayor o caso fortuito, entendiéndose como tales: desastres naturales, pandemias, guerras, actos de autoridad gubernamental u otras circunstancias imprevisibles e inevitables.',
  },
  {
    id: 'gen_confidentiality',
    label: 'Confidencialidad',
    text: 'Las partes se comprometen a mantener en estricta confidencialidad los términos económicos y condiciones del presente contrato, así como cualquier información personal o financiera intercambiada durante la negociación.',
  },
  {
    id: 'gen_modifications',
    label: 'Modificaciones al contrato',
    text: 'Cualquier modificación al presente contrato deberá realizarse por escrito y ser firmada por todas las partes involucradas. Las modificaciones verbales no tendrán validez legal.',
  },
  {
    id: 'gen_notifications',
    label: 'Notificaciones',
    text: 'Todas las notificaciones entre las partes deberán realizarse por escrito, ya sea por correo electrónico certificado o por medio físico con acuse de recibo, a las direcciones proporcionadas en el presente contrato.',
  },
];

/**
 * Retorna el set de cláusulas correspondiente al tipo de contrato.
 */
export function getClausesForType(contractType) {
  switch (contractType) {
    case 'SALE':
    case 'OPTION_TO_BUY':
      return [...SALE_CLAUSES, ...GENERAL_CLAUSES];
    case 'RENT':
      return [...RENT_CLAUSES, ...GENERAL_CLAUSES];
    default:
      return GENERAL_CLAUSES;
  }
}
