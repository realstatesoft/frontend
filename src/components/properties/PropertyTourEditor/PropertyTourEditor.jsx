import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Button, Row, Col, Card, Form, Spinner, Badge, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import Swal from "sweetalert2";
import model3dApi from "../../../services/properties/model3dApi";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import "./PropertyTourEditor.css";

/**
 * PropertyTourEditor
 * Interfaz visual para que el agente configure el tour 360 sin tocar JSON.
 */
export default function PropertyTourEditor({ show, onHide, propertyId, media, currentConfig, onSave }) {
  const [nodes, setNodes] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [startNodeId, setStartNodeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingLink, setPendingLink] = useState(null); // { yaw, pitch }

  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // 1. Inicializar nodos a partir de la media 360 disponible
  useEffect(() => {
    if (!show) return;

    const scenes360 = media.filter((m) => m.type === "IMAGE_360");
    const validIds = new Set(scenes360.map((m, idx) => m.id ? `media_${m.id}` : `pending_${idx}`));
    
    // Si ya existe una config, la mapeamos, sino creamos nodos base
    if (currentConfig && currentConfig.nodes?.length > 0) {
      // Cruzar la config existente con la media actual para actualizar IDs y limpiar links rotos
      const existingNodes = currentConfig.nodes
        .map(node => {
          const mediaMatch = scenes360.find(m => m.url === node.panorama);
          if (!mediaMatch) return null; // Foto borrada físicamente

          const currentId = `media_${mediaMatch.id}`;
          return {
            ...node,
            id: currentId,
            // Filtrar links que apunten a habitaciones que ya no existen
            links: (node.links || []).filter(link => {
              const targetMatch = scenes360.find(m => `media_${m.id}` === link.nodeId || m.url === link.nodeId);
              return !!targetMatch;
            }).map(link => {
               // Normalizar el nodeId al ID actual
               const targetMatch = scenes360.find(m => `media_${m.id}` === link.nodeId || m.url === link.nodeId);
               return { ...link, nodeId: `media_${targetMatch.id}` };
            })
          };
        })
        .filter(Boolean); // Quitar nodos que ya no tienen foto

      const validIds = existingNodes.map(n => n.id);
      setNodes(existingNodes);
      
      // Validar y normalizar IDs de inicio y activo
      const rawStartId = currentConfig.startNodeId;
      setStartNodeId(validIds.includes(rawStartId) ? rawStartId : (existingNodes[0]?.id || null));
      setActiveNodeId((prev) => (validIds.includes(prev) ? prev : (existingNodes[0]?.id || null)));
    } else {
      const baseNodes = scenes360.map((m, idx) => ({
        // Usar ID real o generar uno basado en la URL/índice para evitar 'undefined'
        id: m.id ? `media_${m.id}` : `pending_${idx}`,
        panorama: m.url,
        name: m.title || `Habitación ${idx + 1}`,
        links: [],
      }));
      setNodes(baseNodes);
      if (baseNodes.length > 0) {
        setStartNodeId(baseNodes[0].id);
        setActiveNodeId(baseNodes[0].id);
      }
    }
  }, [show, media, currentConfig]);

  // 2. Manejar visor Photo Sphere
  useEffect(() => {
    if (!activeNodeId || !containerRef.current) return;

    const activeNode = nodes.find((n) => n.id === activeNodeId);
    if (!activeNode) return;

    if (viewerRef.current) viewerRef.current.destroy();

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: activeNode.panorama,
      plugins: [[MarkersPlugin, {}]],
      navbar: ["zoom", "move", "fullscreen"],
    });

    const markersPlugin = viewer.getPlugin(MarkersPlugin);

    // Dibujar markers existentes del nodo activo
    activeNode.links.forEach((link, idx) => {
      const targetNode = nodes.find(n => n.id === link.nodeId);
      markersPlugin.addMarker({
        id: `link_${idx}`,
        position: link.position,
        html: `
          <div class="custom-tour-marker">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#3b6bf5" class="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
            </svg>
            <div class="tour-marker-label">${escapeHtml(targetNode?.name || 'Habitación')}</div>
          </div>
        `,
        size: { width: 32, height: 32 },
        tooltip: `Ir a: ${escapeHtml(targetNode?.name || 'Habitación')}`,
      });
    });

    // Capturar clic para nuevo hotspot
    viewer.addEventListener("click", (e) => {
      // Evitar clics accidentales si el modal está abierto
      if (showLinkModal) return;

      setPendingLink({
        yaw: e.data.yaw,
        pitch: e.data.pitch,
      });
      setShowLinkModal(true);
    });

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.warn("Error al destruir el visor:", e);
        }
        viewerRef.current = null;
      }
    };
  }, [activeNodeId, nodes, showLinkModal]);

  // Acciones de UI
  const handleRenameNode = (id, newName) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, name: newName } : n));
  };

  const handleAddLink = (targetNodeId) => {
    if (!pendingLink) return;

    setNodes(nodes.map(n => {
      if (n.id === activeNodeId) {
        return {
          ...n,
          links: [...n.links, { nodeId: targetNodeId, position: pendingLink }]
        };
      }
      return n;
    }));
    setShowLinkModal(false);
    setPendingLink(null);
  };

  const handleRemoveLink = (nodeId, linkIndex) => {
    setNodes(nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          links: n.links.filter((_, i) => i !== linkIndex)
        };
      }
      return n;
    }));
  };

  const handleSaveTour = async () => {
    if (nodes.length === 0) {
      Swal.fire("Error", "Debes tener al menos una habitación 360.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const config = {
        startNodeId: startNodeId,
        nodes: nodes.map(n => ({
          id: n.id,
          panorama: n.panorama,
          name: n.name,
          links: n.links
        }))
      };

      const jsonString = JSON.stringify(config);
      const blob = new Blob([jsonString], { type: "application/json" });
      const file = new File([blob], `tour_config_${propertyId || 'new'}.json`, { type: "application/json" });

      let result;
      if (propertyId) {
        const { data } = await model3dApi.uploadTourConfig(propertyId, file);
        result = data;
      } else {
        const { data } = await model3dApi.uploadTourConfigGeneric(file);
        result = data;
      }

      if (result && result.success && result.data) {
        if (onSave) onSave(result.data); // Notificar al padre (form)
        await Swal.fire("¡Éxito!", "El recorrido virtual se ha configurado correctamente.", "success");
        onHide();
      } else {
        throw new Error(result?.message || "Error desconocido al guardar la configuración.");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar la configuración: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="tour-editor-modal">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Configurador de Recorrido Virtual</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Row className="g-0 h-100">
          {/* Sidebar: Lista de habitaciones */}
          <Col md={3} className="border-end bg-light tour-editor-sidebar">
            <div className="p-3 border-bottom bg-white sticky-top">
              <h6 className="mb-0 fw-bold">Habitaciones ({nodes.length})</h6>
              <small className="text-muted">Arrastrá para ordenar o editá los nombres.</small>
            </div>
            <div className="p-2 tour-scenes-list">
              {nodes.map((node, idx) => (
                <Card 
                  key={node.id || `node-${idx}`} 
                  className={`mb-2 scene-card ${activeNodeId === node.id ? 'active' : ''}`}
                  onClick={() => setActiveNodeId(node.id)}
                >
                  <Card.Body className="p-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="scene-thumb" style={{ backgroundImage: `url(${node.panorama})` }}></div>
                      <div className="flex-grow-1 overflow-hidden">
                        <Form.Control 
                          size="sm" 
                          className="border-0 bg-transparent p-0 scene-name-input" 
                          value={node.name}
                          onChange={(e) => handleRenameNode(node.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="d-flex gap-1 mt-1">
                          {startNodeId === node.id && <Badge bg="warning" text="dark" size="sm" style={{fontSize: '9px'}}>Inicio</Badge>}
                          <Badge bg="info" style={{fontSize: '9px'}}>{node.links.length} Conexiones</Badge>
                        </div>
                      </div>
                      <DropdownScene node={node} isStart={startNodeId === node.id} setStart={() => setStartNodeId(node.id)} />
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          {/* Main: Visor Interactivo */}
          <Col md={9} className="d-flex flex-column bg-dark position-relative">
            {activeNodeId ? (
              <>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white" style={{zIndex: 5}}>
                  <div>
                    <span className="text-muted small d-block">Habitación actual:</span>
                    <strong className="text-primary">{nodes.find(n => n.id === activeNodeId)?.name}</strong>
                  </div>
                  <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Haz clic en el visor para añadir un punto de navegación.
                  </div>
                </div>
                
                <div className="tour-editor-viewport-container">
                  <div ref={containerRef} className="tour-editor-viewport"></div>
                  
                  {/* Listado de conexiones actuales del nodo activo */}
                  <div className="tour-links-overlay p-3">
                     <h6 className="fw-bold mb-2 small text-uppercase">Navegación desde aquí:</h6>
                     <div className="d-flex gap-2 flex-wrap">
                       {nodes.find(n => n.id === activeNodeId)?.links.map((link, idx) => (
                         <Badge key={`link-${activeNodeId}-${link.nodeId}-${idx}`} bg="light" text="dark" className="border d-flex align-items-center gap-2 p-2">
                           <i className="bi bi-arrow-right-short text-primary"></i>
                           {nodes.find(n => n.id === link.nodeId)?.name}
                           <i className="bi bi-x-circle text-danger cursor-pointer" onClick={() => handleRemoveLink(activeNodeId, idx)}></i>
                         </Badge>
                       ))}
                       {nodes.find(n => n.id === activeNodeId)?.links.length === 0 && (
                         <span className="text-muted small italic">Sin conexiones. Haz clic en la escena para añadir una.</span>
                       )}
                     </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted bg-light">
                <Spinner animation="grow" variant="primary" className="me-2" />
                Selecciona una habitación para empezar a configurar.
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSaveTour} disabled={isSaving}>
          {isSaving ? <Spinner size="sm" /> : <i className="bi bi-save me-2"></i>}
          Guardar Recorrido
        </Button>
      </Modal.Footer>

      {/* Modal para vincular punto */}
      <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">Vincular con...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">¿A qué habitación debe llevar este punto?</p>
          <div className="d-grid gap-2">
            {nodes.filter(n => n.id !== activeNodeId).map(node => (
              <Button 
                key={node.id} 
                variant="outline-primary" 
                size="sm" 
                className="text-start d-flex align-items-center gap-2"
                onClick={() => handleAddLink(node.id)}
              >
                <div className="scene-thumb-mini" style={{ backgroundImage: `url(${node.panorama})` }}></div>
                {node.name}
              </Button>
            ))}
            {nodes.length <= 1 && <span className="text-danger small">Necesitas al menos otra habitación.</span>}
          </div>
        </Modal.Body>
      </Modal>
    </Modal>
  );
}

// Subcomponente para el menú de cada escena
function DropdownScene({ node, isStart, setStart }) {
  return (
    <Dropdown onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle variant="link" size="sm" className="text-muted p-0 no-caret shadow-none">
        <i className="bi bi-three-dots-vertical"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="shadow-sm">
        <Dropdown.Item 
          className={`d-flex align-items-center gap-2 ${isStart ? 'disabled text-success' : ''}`} 
          onClick={setStart}
        >
          <i className="bi bi-star"></i> {isStart ? 'Es la habitación inicial' : 'Marcar como inicial'}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
