-- Tabla de Roles (Admin, Editor, etc.)

-- DROP DATABASE talentohumano360;

CREATE DATABASE talentohumano360;
USE talentohumano360;

CREATE TABLE ROLES (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name_role VARCHAR(50) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_rol TINYINT(1) DEFAULT 1
);
-- Tabla de Permisos (Crear, Editar, Leer, Eliminar)
CREATE TABLE PERMISSIONS (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_permissions TINYINT(1) DEFAULT 1
);
-- Tabla de Páginas (Vistas del Front-end)
CREATE TABLE PAGES (
    page_id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    route VARCHAR(255) NOT NULL,
    description TEXT,
    status_page TINYINT(1) DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    page_route VARCHAR(255) -- Según tu diagrama
);
-- Tabla Maestra de Tipos de Eventos (Para la trazabilidad)
CREATE TABLE MASTER_TYPE_EVENT (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    status_id INT DEFAULT 1,
    created_at DATE,
    description VARCHAR(255)
);
-- Tabla de Usuarios
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at DATETIME,
    name VARCHAR(100),
    last_name VARCHAR(100),
    status_id INT DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id)
);
-- Relación Muchos a Muchos: Roles y Permisos
CREATE TABLE ROLE_PERMISSIONS (
    role_permissions_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id),
    FOREIGN KEY (permission_id) REFERENCES PERMISSIONS(permission_id)
);
-- Relación Muchos a Muchos: Roles y Páginas
CREATE TABLE ROLE_PAGES (
    role_page_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    page_id INT,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id),
    FOREIGN KEY (page_id) REFERENCES PAGES(page_id)
);
CREATE TABLE SYSTEM_TRAZABILITY (
    trazability_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_id INT,
    page_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    details_json JSON, -- Muy útil para guardar logs detallados
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (event_id) REFERENCES MASTER_TYPE_EVENT(event_id),
    FOREIGN KEY (page_id) REFERENCES PAGES(page_id)
);


-- Flujo de centro de costos.
USE talentohumano360;

CREATE TABLE STATUS_MASTER (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS MASTER_REGIONAL (
    regional_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_reg_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE MASTER_LEADER (
    leader_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_lead_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE MASTER_UNIT (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_unit_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE ZONA (
    zona_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    regional_id INT,
    CONSTRAINT fk_zona_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id),
    CONSTRAINT fk_zona_reg FOREIGN KEY (regional_id) REFERENCES MASTER_REGIONAL(regional_id)
);

CREATE TABLE MASTER_OFFICES (
    office_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    departament_id INT,
    leader_id INT,
    zona_id INT,
    created_ad DATE,
    CONSTRAINT fk_off_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id),
    CONSTRAINT fk_off_lead FOREIGN KEY (leader_id) REFERENCES MASTER_LEADER(leader_id),
    CONSTRAINT fk_off_zona FOREIGN KEY (zona_id) REFERENCES ZONA(zona_id)
);

CREATE TABLE COST_CENTER (
    cost_center_id INT AUTO_INCREMENT PRIMARY KEY,
    regional_id INT,
    helisa_cc VARCHAR(20), 
    unit_id INT,
    office_id INT,
    ptr INT,
    city_id INT,
    area_id INT,
    company_id INT,
    leader_id INT,
    client_id INT,
    CONSTRAINT fk_cc_reg FOREIGN KEY (regional_id) REFERENCES MASTER_REGIONAL(regional_id),
    CONSTRAINT fk_cc_unit FOREIGN KEY (unit_id) REFERENCES MASTER_UNIT(unit_id),
    CONSTRAINT fk_cc_off FOREIGN KEY (office_id) REFERENCES MASTER_OFFICES(office_id),
    CONSTRAINT fk_cc_lead FOREIGN KEY (leader_id) REFERENCES MASTER_LEADER(leader_id)
);

-- Desactiva el modo seguro
SET SQL_SAFE_UPDATES = 0;

-- Ejecuta tu actualización
UPDATE MASTER_LEADER ml 
JOIN USERS u ON ml.name = CONCAT(u.name, ' ', u.last_name) 
SET ml.user_id = u.user_id;

-- Vuelve a activarlo por seguridad
SET SQL_SAFE_UPDATES = 1;

USE talentohumano360;

-- Esto crea el registro que MASTER_REGIONAL está buscando
INSERT INTO STATUS_MASTER (status_id, status) VALUES (1, 'Activo');

-- Opcional: agrega otros estados comunes
INSERT INTO STATUS_MASTER (status) VALUES ('Inactivo'), ('Pendiente');

-- 1. REGISTROS PARA MASTER_REGIONAL
INSERT INTO MASTER_REGIONAL (name, status_id) VALUES 
('ZONA BOGOTA', 1),
('NORORIENTE', 1),
('ANTIOQUIA Y SABANAS', 1),
('BOGOTÁ Y CENTRO', 1),
('EJE CAFETERO Y SUR', 1),
('ZONA NORTE', 1),
('GESTORIA ANTIOQUIA Y SABANAS', 1),
('GESTORIA BOGOTA Y CENTRO', 1),
('ZONA OCCIDENTE', 1),
('ZONA ORIENTE', 1),
('ZONA CENTRO', 1),
('ZONA MEDELLIN', 1),
('TROPAS ANTIOQUIA Y SABANAS', 1),
('TROPAS BOGOTA Y CENTRO', 1),
('TROPAS SUR', 1),
('ADMINISTRACION', 1),
('ZONA SUPERVISOR', 1);



-- 3. REGISTROS PARA MASTER_UNIT
INSERT INTO MASTER_UNIT (name, status_id) VALUES 
('TRANSACCIONAL', 1),
('ESPECIALIZADA', 1);

-- Flujo de ciudades y departamentos.

-- 1. Crear Departamentos
CREATE TABLE IF NOT EXISTS MASTER_DEPARTAMENT (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_dane VARCHAR(5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT,
    CONSTRAINT fk_dept_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);
-- 2. Crear Ciudades
CREATE TABLE IF NOT EXISTS MASTER_CITIES (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codigo_dane VARCHAR(5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    departament_id INT,
    status_id INT,
    CONSTRAINT fk_city_dept FOREIGN KEY (departament_id) REFERENCES MASTER_DEPARTAMENT(departament_id),
    CONSTRAINT fk_city_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

INSERT INTO MASTER_DEPARTAMENT (name, status_id) VALUES 
('VALLE DEL CAUCA', 1), ('CUNDINAMARCA', 1), ('ATLANTICO', 1), 
('ANTIOQUIA', 1), ('BOLIVAR', 1), ('TOLIMA', 1), ('HUILA', 1), 
('CESAR', 1), ('SANTANDER', 1), ('SUCRE', 1), ('MAGDALENA', 1), 
('CORDOBA', 1), ('QUINDIO', 1), ('BOYACA', 1), ('CALDAS', 1), 
('CASANARE', 1), ('ARAUCA', 1), ('LA GUAJIRA', 1), ('META', 1), 
('RISARALDA', 1), ('CAQUETA', 1), ('N. DE SANTANDER', 1), ('NARIÑO', 1), 
('CAUCA', 1), ('AMAZONAS', 1), ('PUTUMAYO', 1), ('GUAVIARE', 1), 
('VAUPES', 1), ('VICHADA', 1), ('SAN ANDRES', 1), ('GUAINIA', 1);

INSERT INTO MASTER_CITIES (name, departament_id, status_id) VALUES 
('PALMIRA', 1, 1), ('CALI', 1, 1), ('BUGALAGRANDE', 1, 1), ('SEVILLA', 1, 1), ('FLORIDA', 1, 1), ('LA UNION', 1, 1), ('TULUA', 1, 1), ('GINEBRA', 1, 1), ('EL CERRITO', 1, 1), ('CANDELARIA', 1, 1), ('CARTAGO', 1, 1), ('YUMBO', 1, 1), ('GUACARI', 1, 1), ('JAMUNDI', 1, 1), ('LA VICTORIA', 1, 1), ('BUENAVENTURA', 1, 1), ('PRADERA', 1, 1), ('BUGA', 1, 1), ('GUADALAJARA DE BUGA', 1, 1), ('ROLDANILLO', 1, 1), ('ZARZAL', 1, 1), ('ANDALUCIA', 1, 1), ('TRUJILLO', 1, 1), ('CAICEDONIA', 1, 1), ('BOGOTA', 2, 1), ('SOACHA', 2, 1), ('FUNZA', 2, 1), ('CHIA', 2, 1), ('ZIPAQUIRA', 2, 1), ('FACATATIVA', 2, 1), ('MADRID', 2, 1), ('CAJICA', 2, 1), ('SIBATE', 2, 1), ('TOCANCIPA', 2, 1), ('GACHANCIPA', 2, 1), ('VILLA DE SAN DIEGO DE UBATE', 2, 1), ('UBATE', 2, 1), ('COTA', 2, 1), ('BOGOTA DC', 2, 1), ('GACHANCIPÁ', 2, 1), ('GIRARDOT', 2, 1), ('ARBELAEZ', 2, 1), ('CHOCONTA', 2, 1), ('BARRANQUILLA', 3, 1), ('SOLEDAD', 3, 1), ('JUAN DE ACOSTA', 3, 1), ('SANTO TOMAS', 3, 1), ('PUERTO COLOMBIA', 3, 1), ('PONEDERA', 3, 1), ('MEDELLIN', 4, 1), ('ITAGUI', 4, 1), ('SABANETA', 4, 1), ('RIONEGRO', 4, 1), ('BELLO', 4, 1), ('GIRARDOTA', 4, 1), ('ENVIGADO', 4, 1), ('SOPETRAN', 4, 1), ('CAUCASIA', 4, 1), ('EL PEÑOL', 4, 1), ('ARBOLETES', 4, 1), ('BARBOSA', 4, 1), ('SAN JERONIMO', 4, 1), ('SANTAFE DE ANTIOQUIA', 4, 1), ('YOLOMBO', 4, 1), ('COPACABANA', 4, 1), ('LA CEJA', 4, 1), ('PUERTO BERRIO', 4, 1), ('YONDO', 4, 1), ('EL SANTUARIO', 4, 1), ('MARINILLA', 4, 1), ('APARTADO', 4, 1), ('CAREPA', 4, 1), ('BETULIA', 4, 1), ('CARTAGENA', 5, 1), ('SANTA CRUZ DE MOMPOX', 5, 1), ('MOMPOS', 5, 1), ('TURBACO', 5, 1), ('MAGANGUE', 5, 1), ('MAHATES', 5, 1), ('ZAMBRANO', 5, 1), ('IBAGUE', 6, 1), ('ESPINAL', 6, 1), ('LIBANO', 6, 1), ('NATAGAIMA', 6, 1), ('AMBALEMA', 6, 1), ('PLANADAS', 6, 1), ('FLANDES', 6, 1), ('NEIVA', 7, 1), ('LA PLATA', 7, 1), ('ACEVEDO', 7, 1), ('PITALITO', 7, 1), ('SAN AGUSTIN', 7, 1), ('YAGUARA', 7, 1), ('PITALITO HUILA', 7, 1), ('GIGANTE', 7, 1), ('VALLEDUPAR', 8, 1), ('BOSCONIA', 8, 1), ('SAN ALBERTO', 8, 1), ('EL PASO', 8, 1), ('CURUMANI', 8, 1), ('BUCARAMANGA', 9, 1), ('SAN GIL', 9, 1), ('PIEDECUESTA', 9, 1), ('FLORIDABLANCA', 9, 1), ('EL PLAYON', 9, 1), ('GIRON', 9, 1), ('BARRANCABERMEJA', 9, 1), ('VALLE DE SAN JOSE', 9, 1), ('PUENTE NACIONAL', 9, 1), ('CHARALA', 9, 1), ('SUAITA', 9, 1), ('SINCELEJO', 10, 1), ('COROZAL', 10, 1), ('MORROA', 10, 1), ('SANTA MARTA', 11, 1), ('FUNDACIÓN', 11, 1), ('CIENAGA', 11, 1), ('SALAMINA', 11, 1), ('PLATO', 11, 1), ('MONTERIA', 12, 1), ('MONTELIBANO', 12, 1), ('AYAPEL', 12, 1), ('LA APARTADA', 12, 1), ('ARMENIA', 13, 1), ('MONTENEGRO', 13, 1), ('CIRCASIA', 13, 1), ('CALARCA', 13, 1), ('DUITAMA', 14, 1), ('SOGAMOSO', 14, 1), ('CHIQUINQUIRA', 14, 1), ('RAMIRIQUI', 14, 1), ('MONIQUIRA', 14, 1), ('PACHAVITA', 14, 1), ('TUNJA', 14, 1), ('SAN MIGUEL DE SEMA', 14, 1), ('MANIZALES', 15, 1), ('VILLAMARIA', 15, 1), ('RIOSUCIO', 15, 1), ('LA DORADA', 15, 1), ('MANZANARES', 15, 1), ('YOPAL', 16, 1), ('OROCUE', 16, 1), ('ARAUCA', 17, 1), ('RIOHACHA', 18, 1), ('HATONUEVO', 18, 1), ('FONSECA', 18, 1), ('MAICAO', 18, 1), ('DISTRACCION', 18, 1), ('SAN JUAN DEL CESAR', 18, 1), ('MANAURE', 18, 1), ('URIBIA', 18, 1), ('BARRANCAS', 18, 1), ('DIBULLA', 18, 1), ('VILLAVICENCIO', 19, 1), ('RESTREPO', 19, 1), ('ACACIAS', 19, 1), ('CASTILLA LA NUEVA', 19, 1), ('GRANADA', 19, 1), ('BARRANCA DE UPIA', 19, 1), ('PEREIRA', 20, 1), ('DOSQUEBRADAS', 20, 1), ('SANTA ROSA DE CABAL', 20, 1), ('LA VIRGINIA', 20, 1), ('QUINCHIA', 20, 1), ('FLORENCIA', 21, 1), ('SAN VICENTE DEL CAGUÁN', 21, 1), ('PUERTO RICO', 21, 1), ('CUCUTA', 22, 1), ('LOS PATIOS', 22, 1), ('OCAÑA', 22, 1), ('PASTO', 23, 1), ('SAN ANDRES DE TUMACO', 23, 1), ('IPIALES', 23, 1), ('PUPIALES', 23, 1), ('TUMACO', 23, 1), ('POPAYAN', 24, 1), ('LETICIA', 25, 1), ('MOCOA', 26, 1), ('VALLE DEL GUAMUEZ', 26, 1), ('PUERTO ASIS', 26, 1), ('SIBUNDOY', 26, 1), ('SAN JOSE DEL GUAVIARE', 27, 1), ('MITU', 28, 1), ('PUERTO CARREÑO', 29, 1), ('SAN ANDRES', 30, 1);

SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'talentohumano360' AND TABLE_NAME = 'MASTER_OFFICES';


-- cambio de flujo master_leader - users.



-- Insertamos los líderes en la tabla USERS. 

INSERT INTO ROLES (name_role, description, status_rol) 
VALUES 
('LIDER', 'Usuario con permisos de supervisión y gestión de equipos.', 1),
('ANALISTA', 'Usuario encargado del procesamiento de datos y tareas operativas.', 1);


-- Insertar los líderes como usuarios
-- Nota: Usamos un email generado a partir del nombre y una clave genérica
INSERT INTO USERS (name, last_name, email, password_hash, role_id, status_id) VALUES 
('DAYRON', 'DE JESUS GAMERO PEÑA', 'dayron.gamero@talento.com', '$2b$10$DefaultHash123', 2, 1),
('RAFAEL', 'DAVID ROYS PACHECO', 'rafael.roys@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LEDYS', 'MARIA OTALVARO BEDOYA', 'ledys.otalvaro@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LINA', 'MARIA CORTES GOMEZ', 'lina.cortes@talento.com', '$2b$10$DefaultHash123', 2, 1),
('DIEGO', 'FERNANDO RODRIGUEZ GUERRERO', 'diego.rodriguez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LUZ', 'ADRIANA RIOS PARRA', 'luz.rios@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MARISOL', 'CAMARGO CARVAJAL', 'marisol.camargo@talento.com', '$2b$10$DefaultHash123', 2, 1),
('IRMA', 'LUCIA HERNANDEZ FLOREZ', 'irma.hernandez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JHON', 'WALTHER RAIGOZA GONZALEZ', 'jhon.raigoza@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MARIA', 'CRISTINA FIGUEROA GUZMAN', 'maria.figueroa@talento.com', '$2b$10$DefaultHash123', 2, 1),
('VICTOR', 'ALVAREZ HERNANDEZ', 'victor.alvarez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('KELLY', 'ALEXANDRA BENITEZ TORRES', 'kelly.benitez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ROCIO', 'BLANDON AREVALO', 'rocio.blandon@talento.com', '$2b$10$DefaultHash123', 2, 1),
('KELLY', 'YOHANA CASTRILLON FLOREZ', 'kelly.castrillon@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LAURA', 'MARCELA MONTOYA PIEDRAHITA', 'laura.montoya@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MONICA', 'LILIANA ORTEGA JOJOA', 'monica.ortega@talento.com', '$2b$10$DefaultHash123', 2, 1),
('KAREN', 'ASTRID PINZON CASTAÑEDA', 'karen.pinzon@talento.com', '$2b$10$DefaultHash123', 2, 1),
('DARIO', 'ALEXANDER AGUIRRE TRUJILLO', 'dario.aguirre@talento.com', '$2b$10$DefaultHash123', 2, 1),
('OSCAR', 'ALEJANDRO NIETO FULA', 'oscar.nieto@talento.com', '$2b$10$DefaultHash123', 2, 1),
('DAVID', 'HENRIQUE BLANCO PALMA', 'david.blanco@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ESPERANZA', 'TRUJILLO RINCON', 'esperanza.trujillo@talento.com', '$2b$10$DefaultHash123', 2, 1),
('NATHALY', 'GONZALEZ CAMACHO', 'nathaly.gonzalez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JIMENA', 'ALEXANDRA RAMIREZ CARVAJAL', 'jimena.ramirez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LEIDY', 'VANESSA ESTEVEZ CONTRERAS', 'leidy.estevez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('FREDY', 'FERNANDO RIVEROS OSPINA', 'fredy.riveros@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ANA', 'JUDITH GONZÁLEZ MAHECHA', 'ana.gonzalez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('KELLY', 'JOHANA CANO MAZO', 'kelly.cano@talento.com', '$2b$10$DefaultHash123', 2, 1),
('YAZMIN', 'RUEDA BOLIVAR', 'yazmin.rueda@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JOHANNA', 'MILENA MORENO CARDOZO', 'johanna.moreno@talento.com', '$2b$10$DefaultHash123', 2, 1),
('GLORIA', 'VANESSA RODRIGUEZ MUÑOZ', 'gloria.rodriguez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('CLAUDIA', 'PATRICIA ACOSTA ROMERO', 'claudia.acosta@talento.com', '$2b$10$DefaultHash123', 2, 1),
('SANDRA', 'XIMENA LATORRE NOGUERA', 'sandra.latorre@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LUIS', 'CARLOS PEÑARANDA BARRIENTOS', 'luis.peñaranda@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MARIA', 'FERNANDA RAMIREZ PALACIOS', 'maria.ramirez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('CINDY', 'PAOLA SUAREZ SANABRIA', 'cindy.suarez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('SANDRA', 'PATRICIA ALARCON SEGURA', 'sandra.alarcon@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MARYOIRY', 'LILIANA AVILA RUBIO', 'maryoiry.avila@talento.com', '$2b$10$DefaultHash123', 2, 1),
('SANDRA', 'YAMILE HERNANDEZ CRISTANCHO', 'sandra.hernandez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('SEBASTIAN', 'ARISMENDY MESA', 'sebastian.arismendy@talento.com', '$2b$10$DefaultHash123', 2, 1),
('WILLIAM', 'GARCES CASTRO', 'william.garces@talento.com', '$2b$10$DefaultHash123', 2, 1),
('EVELYN', 'SUAZA MONTOYA', 'evelyn.suaza@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ELBA', 'LUCIA ESTEVEZ CONTRERAS', 'elba.estevez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('NORMA', 'LUCIA RANGEL ESTEVEZ', 'norma.rangel@talento.com', '$2b$10$DefaultHash123', 2, 1),
('NUBIA', 'ESPERANZA PARRADO CARDENAS', 'nubia.parrado@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JONH', 'ALEXANDER HORTUA BARRETO', 'jonh.hortua@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LUZ', 'ANGELA BULLA SILVA', 'luz.bulla@talento.com', '$2b$10$DefaultHash123', 2, 1),
('CRISTHIAN', 'ALFONSO CARDONA ARIAS', 'cristian.cardona@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MARITZA', 'TATIANA TOLOZA MOJICA', 'maritza.toloza@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JHON', 'FREDY SUAREZ ZARATE', 'jhon.suarez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('WILLIAM', 'OSVALDO ORTIZ HERRERA', 'william.ortiz@talento.com', '$2b$10$DefaultHash123', 2, 1),
('YERSY', 'RICARDO IBARRA GARRETA', 'yersy.ibarra@talento.com', '$2b$10$DefaultHash123', 2, 1),
('HENRY', 'GIRALDO JARAMILLO', 'henry.giraldo@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ANNY', 'ALEXANDRA SIERRA CARDENAS', 'anny.sierra@talento.com', '$2b$10$DefaultHash123', 2, 1),
('GISELA', 'SUAZA MONTOYA', 'gisela.suaza@talento.com', '$2b$10$DefaultHash123', 2, 1),
('MEIBY', 'JULIETH CAMACHO', 'meiby.camacho@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JENNIFER', 'ANGELICA ORJUELA PARRA', 'jennifer.orjuela@talento.com', '$2b$10$DefaultHash123', 2, 1),
('ERIKA', 'STEFFANIA MELO GUTIERREZ', 'erika.melo@talento.com', '$2b$10$DefaultHash123', 2, 1),
('LUIS', 'FELIPE LOPEZ RUIZ', 'luis.lopez@talento.com', '$2b$10$DefaultHash123', 2, 1),
('JEISON', 'MAURICIO ZAPATA ALONSO', 'jeison.zapata@talento.com', '$2b$10$DefaultHash123', 2, 1);

-- A. Añadimos la columna que recibirá el ID del usuario
-- La ponemos después de leader_id para mantener el orden
ALTER TABLE MASTER_LEADER 
ADD COLUMN user_id INT AFTER leader_id;

-- B. Creamos la Llave Foránea (Foreign Key)
-- Esto garantiza que no puedas asignar un líder a un usuario que no exista
ALTER TABLE MASTER_LEADER 
ADD CONSTRAINT fk_leader_user 
FOREIGN KEY (user_id) REFERENCES USERS(user_id);



-- C. Vinculamos los registros mediante un JOIN
UPDATE MASTER_LEADER ml
JOIN USERS u ON ml.name = CONCAT(u.name, ' ', u.last_name)
SET ml.user_id = u.user_id;

-- D. Eliminamos la columna name de MASTER_LEADER
-- A partir de ahora, el nombre se consulta haciendo JOIN con USERS
ALTER TABLE MASTER_LEADER 
DROP COLUMN name;

USE talentohumano360;

-- Desactivamos revisiones de llaves foráneas temporalmente para poder limpiar
SET FOREIGN_KEY_CHECKS = 0;

-- Borrar todos los registros de la tabla de líderes
TRUNCATE TABLE MASTER_LEADER;

-- Volvemos a activar las revisiones
SET FOREIGN_KEY_CHECKS = 1;

select*from users;

USE talentohumano360;

-- 1. Crear tabla de Cargos (Master Job Titles)
CREATE TABLE MASTER_JOB_TITLES (
    id_job INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT
);

-- 2. Crear tabla de Órdenes de Contratación (Hiring Order)
CREATE TABLE HIRING_ORDER (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    id_job INT,
    user_id INT,
    detail_justification VARCHAR(255),
    polygraph_test TINYINT(1),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by VARCHAR(100),
    probation_end_date DATETIME,
    hire_date DATETIME,
    probation_days TINYINT(1), -- Según tu imagen es TINYINT
    uploaded_by VARCHAR(100),
    cost_center_id INT,
    plant_id INT,
    office_id INT,
    contract_id INT NOT NULL,
    city_id INT,
    client_id INT,
    status_id INT,
    selection_confirmed VARCHAR(100),
    selection_hiring_confirmed VARCHAR(100),
    leader_id INT
);

SELECT * FROM users;

INSERT INTO USERS (
    role_id, 
    email, 
    password_hash, 
    name, 
    last_name, 
    status_id
) VALUES (
    2, 
    'dfelipenunez@gmail.com', 
    '$2a$12$vu6pFNMMo1zUXdA94amz0.QlzLN5yclV5sY0/3qzcpcUjc0QHdMdS', 
    'Felipe', 
    'Conde', 
    1
);

ALTER TABLE USERS 
ADD COLUMN failed_attempts INT DEFAULT 0 AFTER status_id,
ADD COLUMN is_locked TINYINT(1) DEFAULT 0 AFTER failed_attempts;

ALTER TABLE USERS 
ADD COLUMN password_expires_at DATETIME AFTER password_changed_at,
ADD COLUMN change_password_required TINYINT(1) DEFAULT 0 AFTER password_expires_at;