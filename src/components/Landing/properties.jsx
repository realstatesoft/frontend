import React from "react";
import { Container, Carousel, Card, Row, Col, Badge } from "react-bootstrap";

const Properties = () => {
  const properties = [
    {
      id: 1, tag: "Disponible", price: "85000",
      location: "Palermo, Buenos Aires", bedrooms: "3", bathrooms: "2", area: "120",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
    },
    {
      id: 2, tag: "Vendido", price: "120000",
      location: "Recoleta, Buenos Aires", bedrooms: "4", bathrooms: "3", area: "180",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
    },
    {
      id: 3, tag: "Disponible", price: "65000",
      location: "Córdoba, Nueva Córdoba", bedrooms: "2", bathrooms: "1", area: "75",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    },
    {
      id: 4, tag: "Reservado", price: "95000",
      location: "Belgrano, Buenos Aires", bedrooms: "3", bathrooms: "2", area: "110",
      image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83"
    },
    {
      id: 5, tag: "Disponible", price: "150000",
      location: "Mendoza, Ciudad", bedrooms: "5", bathrooms: "3", area: "250",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
    },
    {
      id: 6, tag: "En oferta", price: "72000",
      location: "Rosario, Centro", bedrooms: "2", bathrooms: "1", area: "85",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227"
    },
    {
      id: 7, tag: "Disponible", price: "110000",
      location: "San Isidro, Zona Norte", bedrooms: "4", bathrooms: "2", area: "160",
      image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6"
    },
    {
      id: 8, tag: "Vendido", price: "200000",
      location: "Tigre, Nordelta", bedrooms: "5", bathrooms: "4", area: "300",
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde"
    },
    {
      id: 9, tag: "Disponible", price: "55000",
      location: "La Plata, Centro", bedrooms: "1", bathrooms: "1", area: "50",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3"
    },
    {
      id: 10, tag: "Reservado", price: "88000",
      location: "Caballito, Buenos Aires", bedrooms: "3", bathrooms: "2", area: "95",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d"
    },
    {
      id: 11, tag: "Disponible", price: "135000",
      location: "Pilar, Buenos Aires", bedrooms: "4", bathrooms: "3", area: "200",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
    },
    {
      id: 12, tag: "En oferta", price: "78000",
      location: "Salta, Centro", bedrooms: "2", bathrooms: "1", area: "90",
      image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc"
    }
  ];

  const propertyGroups = Array.from({ length: Math.ceil(properties.length / 4) }, (v, i) =>
    properties.slice(i * 4, i * 4 + 4)
  );

  return (
    <>
      {/* Header blanco */}
      <div
        className="text-center py-4"
        style={{ backgroundColor: "#fff" }}
      >

      </div>
      <div style={{ backgroundColor: "#f3f4f6", width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
        <Container className="py-5">

          <style>{`
        .custom-carousel .carousel-control-prev,
        .custom-carousel .carousel-control-next {
          width: 45px;
          height: 45px;
          top: 40%;
          background-color: rgba(122, 106, 106, 0.6);
          border-radius: 50%;
          opacity: 1;
        }
        .custom-carousel .carousel-control-prev { left: -45px; }
        .custom-carousel .carousel-control-next { right: -45px; }
        .custom-carousel .carousel-control-prev:hover,
        .custom-carousel .carousel-control-next:hover {
          background-color: rgba(0,0,0,0.8);
        }
      `}</style>
          <div className="custom-carousel position-relative px-5">
            <Carousel indicators={true} variant="dark" controls={true} interval={null}>
              {propertyGroups.map((group, index) => (
                <Carousel.Item key={index} className="px-3">
                  <Row className="mb-5 flex-nowrap overflow-hidden g-3">
                    {group.map((property) => (
                      <Col md={3} key={property.id} className="p-1">
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                          {/* Contenedor de imagen con etiqueta encima */}
                          <div className="position-relative">
                            <Badge
                              bg="orange"
                              className="position-absolute top-0 start-0 m-3 px-3 py-2"
                              style={{
                                backgroundColor: '#e64a19',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                zIndex: 2
                              }}
                            >
                              {property.tag}
                            </Badge>
                            <Card.Img
                              variant="top"
                              src={property.image}
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                          </div>

                          {/* Cuerpo con líneas de carga (skeleton) como en tu imagen */}
                          <Card.Body className="bg-white px-3 py-3">
                            <h5 className="fw-bold text-success mb-1">
                              Gs {Number(property.price).toLocaleString()}
                            </h5>
                            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                              📍 {property.location}
                            </p>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.85rem' }}>
                              <span>🛏 {property.bedrooms}</span>
                              <span>🚿 {property.bathrooms}</span>
                              <span>📐 {property.area} m²</span>
                            </div>

                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        </Container>
      </div>
    </>
  );
};

// Estilo para simular las líneas grises de tu imagen
const skeletonStyle = {
  height: '15px',
  backgroundColor: '#efefef',
  borderRadius: '10px'
};

export default Properties;