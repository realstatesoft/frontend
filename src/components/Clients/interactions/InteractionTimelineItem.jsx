import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  ChatSquareTextFill,
  ClockHistory,
  EnvelopeFill,
  GeoAltFill,
  JournalText,
  LightningChargeFill,
  PencilSquare,
  PeopleFill,
  TelephoneFill,
  Trash,
  Whatsapp,
} from "react-bootstrap-icons";
import {
  INTERACTION_SOURCE_STYLES,
  INTERACTION_TYPE_STYLES,
} from "../../../constants/clientInteractionConstants";
import {
  formatDateTime,
  formatTimeAgo,
  toDateTimeLocalInput,
} from "../../../utils/dateFormat";

function getInteractionIcon(type) {
  switch (type) {
    case "CALL":
      return TelephoneFill;
    case "EMAIL":
      return EnvelopeFill;
    case "WHATSAPP":
      return Whatsapp;
    case "VISIT":
      return GeoAltFill;
    case "MEETING":
      return PeopleFill;
    case "NOTE":
    default:
      return JournalText;
  }
}

function buildEditForm(interaction) {
  return {
    subject: interaction?.subject ?? "",
    note: interaction?.note ?? "",
    outcome: interaction?.outcome ?? "",
    occurredAt: toDateTimeLocalInput(interaction?.occurredAt),
  };
}

function hasRelevantUpdate(interaction) {
  if (!interaction?.updatedAt) {
    return false;
  }

  if (typeof interaction?.edited === "boolean") {
    return interaction.edited;
  }

  if (typeof interaction?.isEdited === "boolean") {
    return interaction.isEdited;
  }

  if (typeof interaction?.hasRevision === "boolean") {
    return interaction.hasRevision;
  }

  if (!interaction?.createdAt) {
    return false;
  }

  return interaction.updatedAt !== interaction.createdAt;
}

export default function InteractionTimelineItem({
  interaction,
  updating,
  deleting,
  onUpdate,
  onDelete,
}) {
  const { t } = useTranslation('clients');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => buildEditForm(interaction));

  const Icon = useMemo(() => getInteractionIcon(interaction.type), [interaction.type]);
  const typeStyle = INTERACTION_TYPE_STYLES[interaction.type] ?? INTERACTION_TYPE_STYLES.NOTE;
  const sourceStyle =
    INTERACTION_SOURCE_STYLES[interaction.source] ?? INTERACTION_SOURCE_STYLES.MANUAL;
  const canManage = interaction.source === "MANUAL";
  const isNote = interaction.type === "NOTE";
  const typeLabelMap = {
    CALL: t('interactions.types.call'),
    EMAIL: t('interactions.types.email'),
    WHATSAPP: t('interactions.types.whatsapp'),
    VISIT: t('interactions.types.visit'),
    MEETING: t('interactions.types.meeting'),
    NOTE: t('interactions.types.note'),
  };
  const sourceLabelMap = {
    MANUAL: t('interactions.source.manual'),
    SYSTEM: t('interactions.source.system'),
  };

  useEffect(() => {
    setForm(buildEditForm(interaction));
  }, [interaction]);

  const resetForm = () => {
    setForm(buildEditForm(interaction));
  };

  const handleEditToggle = () => {
    if (editing) {
      resetForm();
      setEditing(false);
      return;
    }

    setEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await onUpdate(interaction.id, {
      subject: form.subject.trim(),
      note: form.note.trim(),
      outcome: form.outcome.trim(),
      occurredAt: form.occurredAt,
    });

    if (success) {
      setEditing(false);
    }
  };

  return (
    <div className="crm-interaction-item">
      <div
        className="crm-interaction-item__icon"
        style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
      >
        <Icon size={18} />
      </div>

      <Card
        className={`border-0 shadow-sm crm-interaction-card ${
          interaction.source === "SYSTEM" ? "crm-interaction-card--system" : ""
        } ${isNote ? "crm-interaction-card--note" : ""}`}
      >
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Badge
                bg="none"
                className="px-3 py-2 rounded-pill border-0 fw-semibold"
                style={typeStyle}
              >
                {typeLabelMap[interaction.type] ?? interaction.type}
              </Badge>
              <Badge
                bg="none"
                className="px-3 py-2 rounded-pill border-0 fw-semibold"
                style={sourceStyle}
              >
                {interaction.source === "SYSTEM" ? (
                  <>
                    <LightningChargeFill className="me-1" />
                    {sourceLabelMap[interaction.source]}
                  </>
                ) : (
                  sourceLabelMap[interaction.source] ?? interaction.source
                )}
              </Badge>
            </div>

            <div className="text-muted small d-flex align-items-center gap-2">
              <ClockHistory size={14} />
              <span>{formatDateTime(interaction.occurredAt)}</span>
            </div>
          </div>

          {editing ? (
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    {t('interactions.subject')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    {t('interactions.dateTime')}
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="occurredAt"
                    value={form.occurredAt}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small fw-semibold text-secondary">
                    {t('interactions.note')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small fw-semibold text-secondary">
                    {t('interactions.outcome')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="outcome"
                    value={form.outcome}
                    onChange={handleChange}
                    disabled={updating}
                  />
                </Col>
              </Row>

              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={handleEditToggle}
                  disabled={updating}
                >
                  {t('close', { ns: 'common' })}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-pill px-4"
                  disabled={updating}
                >
                  {updating ? t('saving') : `${t('save')} ${t('edit').toLowerCase()}`}
                </Button>
              </div>
            </Form>
          ) : (
            <>
              {interaction.subject && (
                <h5 className="fw-bold mb-2 text-dark">{interaction.subject}</h5>
              )}

              {interaction.note && (
                <p className="crm-interaction-note text-muted mb-3">{interaction.note}</p>
              )}

              {interaction.outcome && (
                <div className="mb-3">
                  <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill border">
                    {t('interactions.result')} {interaction.outcome}
                  </Badge>
                </div>
              )}

              {!interaction.subject && !interaction.note && !interaction.outcome && (
                <p className="text-muted mb-3">
                  {t('interactions.noDetails')}
                </p>
              )}

              <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div className="text-muted small d-flex flex-wrap gap-3 align-items-center">
                  {hasRelevantUpdate(interaction) && (
                    <span className="d-inline-flex align-items-center gap-1">
                      <ChatSquareTextFill size={14} />
                      {t('interactions.updated', { value: formatTimeAgo(interaction.updatedAt) })}
                    </span>
                  )}
                  {interaction.source === "SYSTEM" && (
                    <span>{t('interactions.autoEvent')}</span>
                  )}
                </div>

                {canManage && (
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill px-3"
                      onClick={handleEditToggle}
                      disabled={updating || deleting}
                    >
                      <PencilSquare className="me-2" />
                      {isNote ? t('interactions.editNote') : t('interactions.edit')}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-pill px-3"
                      onClick={() => onDelete(interaction)}
                      disabled={updating || deleting}
                    >
                      <Trash className="me-2" />
                      {deleting ? t('processing', { ns: 'common' }) : t('interactions.delete')}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
