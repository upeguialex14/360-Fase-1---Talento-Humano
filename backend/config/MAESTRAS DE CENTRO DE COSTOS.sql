-- Tabla de Roles (Admin, Editor, etc.)
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

-- 2. REGISTROS PARA MASTER_LEADER
INSERT INTO MASTER_LEADER (name, status_id) VALUES 
('DAYRON DE JESUS GAMERO PEÑA', 1),
('RAFAEL DAVID ROYS PACHECO', 1),
('LEDYS MARIA OTALVARO BEDOYA', 1),
('LINA MARIA CORTES GOMEZ', 1),
('DIEGO FERNANDO RODRIGUEZ GUERRERO', 1),
('LUZ ADRIANA RIOS PARRA', 1),
('MARISOL CAMARGO CARVAJAL', 1),
('IRMA LUCIA HERNANDEZ FLOREZ', 1),
('JHON WALTHER RAIGOZA GONZALEZ', 1),
('MARIA CRISTINA FIGUEROA GUZMAN', 1),
('VICTOR ALVAREZ HERNANDEZ', 1),
('KELLY ALEXANDRA BENITEZ TORRES', 1),
('ROCIO BLANDON AREVALO', 1),
('KELLY YOHANA CASTRILLON FLOREZ', 1),
('LAURA MARCELA MONTOYA PIEDRAHITA', 1),
('MONICA LILIANA ORTEGA JOJOA', 1),
('KAREN ASTRID PINZON CASTAÑEDA', 1),
('DARIO ALEXANDER AGUIRRE TRUJILLO', 1),
('OSCAR ALEJANDRO NIETO FULA', 1),
('DAVID HENRIQUE BLANCO PALMA', 1),
('ESPERANZA TRUJILLO RINCON', 1),
('NATHALY GONZALEZ CAMACHO', 1),
('JIMENA ALEXANDRA RAMIREZ CARVAJAL', 1),
('LEIDY VANESSA ESTEVEZ CONTRERAS', 1),
('FREDY FERNANDO RIVEROS OSPINA', 1),
('ANA JUDITH GONZÁLEZ MAHECHA', 1),
('KELLY JOHANA CANO MAZO', 1),
('YAZMIN RUEDA BOLIVAR', 1),
('JOHANNA MILENA MORENO CARDOZO', 1),
('GLORIA VANESSA RODRIGUEZ MUÑOZ', 1),
('CLAUDIA PATRICIA ACOSTA ROMERO', 1),
('SANDRA XIMENA LATORRE NOGUERA', 1),
('LUIS CARLOS PEÑARANDA BARRIENTOS', 1),
('MARIA FERNANDA RAMIREZ PALACIOS', 1),
('CINDY PAOLA SUAREZ SANABRIA', 1),
('SANDRA PATRICIA ALARCON SEGURA', 1),
('MARYOIRY LILIANA AVILA RUBIO', 1),
('SANDRA YAMILE HERNANDEZ CRISTANCHO', 1),
('SEBASTIAN ARISMENDY MESA', 1),
('WILLIAM GARCES CASTRO', 1),
('EVELYN SUAZA MONTOYA', 1),
('ELBA LUCIA ESTEVEZ CONTRERAS', 1),
('NORMA LUCIA RANGEL ESTEVEZ', 1),
('NUBIA ESPERANZA PARRADO CARDENAS', 1),
('JONH ALEXANDER HORTUA BARRETO', 1),
('LUZ ANGELA BULLA SILVA', 1),
('CRISTHIAN ALFONSO CARDONA ARIAS', 1),
('MARITZA TATIANA TOLOZA MOJICA', 1),
('JHON FREDY SUAREZ ZARATE', 1),
('WILLIAM OSVALDO ORTIZ HERRERA', 1),
('YERSY RICARDO IBARRA GARRETA', 1),
('HENRY GIRALDO JARAMILLO', 1),
('ANNY ALEXANDRA SIERRA CARDENAS', 1),
('GISELA SUAZA MONTOYA', 1),
('MEIBY JULIETH CAMACHO', 1),
('JENNIFER ANGELICA ORJUELA PARRA', 1),
('ERIKA STEFFANIA MELO GUTIERREZ', 1),
('LUIS FELIPE LOPEZ RUIZ', 1),
('JEISON MAURICIO ZAPATA ALONSO', 1);

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

-- Maestra de Géneros
CREATE TABLE MASTER_TYPE_GENDER (
    gender_id INT AUTO_INCREMENT PRIMARY KEY,
    type_gender VARCHAR(50) UNIQUE NOT NULL,
    status_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Tipos de Documento (Cédula, Pasaporte, etc.)
CREATE TABLE MASTER_TYPE_DOCUMENT (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_document VARCHAR(100) UNIQUE NOT NULL,
    status_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Principal de Personas
CREATE TABLE PEOPLE (
    people_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT, -- FK hacia MASTER_TYPE_DOCUMENT
    document_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    birthdate DATE,
    phone_number VARCHAR(20),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    gender_id INT, -- FK hacia MASTER_TYPE_GENDER
    details_id INT,
    housing_city_id INT,
    city_births_id INT,
    people_business_id INT,
    departament_id INT
);

-- Tabla de Expediente Documental
CREATE TABLE DOCUMENT_EXPEDIENT (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    document_name VARCHAR(150),
    order_id INT,
    type_file INT,
    upload_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    attachments MEDIUMBLOB, -- Para archivos pesados
    attachments_verified TINYINT(1) DEFAULT 0,
    document_checks TINYINT(1) DEFAULT 0,
    file_size BIGINT,
    file_extension VARCHAR(10)
);

-- Tabla Puente: Relación entre Órdenes y Personas
CREATE TABLE ORDER_PEOPLE (
    id_order_people INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    people_id INT
);

-- Conectar PEOPLE con sus maestros de tipo de documento y género
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_type_doc FOREIGN KEY (type_id) REFERENCES MASTER_TYPE_DOCUMENT(type_id),
ADD CONSTRAINT fk_people_gender FOREIGN KEY (gender_id) REFERENCES MASTER_TYPE_GENDER(gender_id);

-- Conectar ORDER_PEOPLE con la tabla de personas
ALTER TABLE ORDER_PEOPLE 
ADD CONSTRAINT fk_order_people_entity FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar ORDER_PEOPLE con HIRING_ORDER (que creamos en el bloque anterior)
ALTER TABLE ORDER_PEOPLE 
ADD CONSTRAINT fk_order_people_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id);

-- Conectar DOCUMENT_EXPEDIENT con HIRING_ORDER
ALTER TABLE DOCUMENT_EXPEDIENT 
ADD CONSTRAINT fk_doc_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id);


-- Maestra de Contratos (Tipos de contrato: Término fijo, indefinido, etc.)
CREATE TABLE MASTER_CONTRACTS (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    type_contract VARCHAR(100),
    name_contract VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT -- FK hacia STATUS_MASTER
);

-- Maestra de Clientes (Empresas a las que se les presta el servicio)
CREATE TABLE MASTER_CLIENT (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    NIT VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT -- FK hacia STATUS_MASTER
);

-- Conectar MASTER_CONTRACTS con estados
ALTER TABLE MASTER_CONTRACTS 
ADD CONSTRAINT fk_contract_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- Conectar MASTER_CLIENT con estados
ALTER TABLE MASTER_CLIENT 
ADD CONSTRAINT fk_client_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- CONEXIÓN HACIA HIRING_ORDER (La tabla del primer bloque)
-- Ahora que ya existen estas maestras, vinculamos la orden de contratación
ALTER TABLE HIRING_ORDER 
ADD CONSTRAINT fk_hiring_contract FOREIGN KEY (contract_id) REFERENCES MASTER_CONTRACTS(contract_id),
ADD CONSTRAINT fk_hiring_client FOREIGN KEY (client_id) REFERENCES MASTER_CLIENT(client_id);


-- Maestras de caracterización
CREATE TABLE MASTER_SEXUAL_ORIENTATION (
    orientation_id INT AUTO_INCREMENT PRIMARY KEY,
    type_orientation VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_SPECIAL_POPULATION (
    special_population_id INT AUTO_INCREMENT PRIMARY KEY,
    type_special VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_ETHNIC_GROUP (
    ethnic_id INT AUTO_INCREMENT PRIMARY KEY,
    type_ethnic VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_BLOOD (
    blood_id INT AUTO_INCREMENT PRIMARY KEY,
    type_blood VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_HOUSING (
    housing_id INT AUTO_INCREMENT PRIMARY KEY,
    type_housing VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_VEHICLE (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    type_vehicle VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_STATUS_ENDOWMENT (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_endowment VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Detalles
CREATE TABLE PEOPLE_DETAILS (
    details_id INT AUTO_INCREMENT PRIMARY KEY,
    orientation_id INT,
    special_population_id INT,
    ethnic_id INT,
    stratum TINYINT,
    partner_name VARCHAR(50),
    neighborhood VARCHAR(50),
    address VARCHAR(100),
    children_count INT,
    partner_id_number VARCHAR(20),
    size_shirt VARCHAR(5),
    size_jean VARCHAR(5),
    size_shoes VARCHAR(5),
    size_jacket VARCHAR(5),
    status_endowment INT,
    size_vest VARCHAR(5),
    blood_id INT,
    housing_id INT,
    vehicle_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE PEOPLE_DETAILS 
ADD CONSTRAINT fk_det_orientation FOREIGN KEY (orientation_id) REFERENCES MASTER_SEXUAL_ORIENTATION(orientation_id),
ADD CONSTRAINT fk_det_special FOREIGN KEY (special_population_id) REFERENCES MASTER_SPECIAL_POPULATION(special_population_id),
ADD CONSTRAINT fk_det_ethnic FOREIGN KEY (ethnic_id) REFERENCES MASTER_ETHNIC_GROUP(ethnic_id),
ADD CONSTRAINT fk_det_blood FOREIGN KEY (blood_id) REFERENCES MASTER_TYPE_BLOOD(blood_id),
ADD CONSTRAINT fk_det_housing FOREIGN KEY (housing_id) REFERENCES MASTER_TYPE_HOUSING(housing_id),
ADD CONSTRAINT fk_det_vehicle FOREIGN KEY (vehicle_id) REFERENCES MASTER_TYPE_VEHICLE(vehicle_id),
ADD CONSTRAINT fk_det_endowment FOREIGN KEY (status_endowment) REFERENCES MASTER_STATUS_ENDOWMENT(status_id);

-- AHORA SÍ: Conectamos PEOPLE con esta tabla de detalles que dejamos pendiente antes
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_details FOREIGN KEY (details_id) REFERENCES PEOPLE_DETAILS(details_id);


-- Maestra de Nivel Educativo (Bachiller, Técnico, Profesional, etc.)
CREATE TABLE MASTER_LEVEL_EDUCATION (
    level_education_id INT AUTO_INCREMENT PRIMARY KEY,
    type_education VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Títulos Obtenidos
CREATE TABLE MASTER_TITLE_EDUCATION (
    title_education_id INT AUTO_INCREMENT PRIMARY KEY,
    title_education VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Información Extendida del Personal
CREATE TABLE PEOPLE_EXTENDED_INFO (
    extended_info_id INT AUTO_INCREMENT PRIMARY KEY,
    people_id INT UNIQUE NOT NULL, -- Relación 1:1 con PEOPLE
    ref_int_metadata VARCHAR(50),
    pep_metadata VARCHAR(255),
    name_emergency VARCHAR(150),
    number_phone_emergency VARCHAR(20),
    contact_relationship VARCHAR(100),
    name_relationship VARCHAR(50),
    level_education_id INT,
    title_education_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conectar con la tabla de personas (PEOPLE)
ALTER TABLE PEOPLE_EXTENDED_INFO 
ADD CONSTRAINT fk_ext_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar con las maestras de educación
ALTER TABLE PEOPLE_EXTENDED_INFO 
ADD CONSTRAINT fk_ext_level FOREIGN KEY (level_education_id) REFERENCES MASTER_LEVEL_EDUCATION(level_education_id),
ADD CONSTRAINT fk_ext_title FOREIGN KEY (title_education_id) REFERENCES MASTER_TITLE_EDUCATION(title_education_id);


-- Maestra de EPS
CREATE TABLE MASTER_EPS (
    eps_id INT AUTO_INCREMENT PRIMARY KEY,
    name_eps VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Fondos de Pensión
CREATE TABLE MASTER_PENSION (
    pension_id INT AUTO_INCREMENT PRIMARY KEY,
    name_fund VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Cajas de Compensación
CREATE TABLE MASTER_COMPENSATION_BOX (
    compesation_box_id INT AUTO_INCREMENT PRIMARY KEY,
    name_compesation_box VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Condiciones Médicas
CREATE TABLE MASTER_MEDICAL (
    medical_condition_id INT AUTO_INCREMENT PRIMARY KEY,
    type_medical_condition VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT
);

-- Maestra de ARL
CREATE TABLE MASTER_ARL (
    arl_id INT AUTO_INCREMENT PRIMARY KEY,
    name_arl VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Salud y Seguridad
CREATE TABLE PEOPLE_HEALT_SECURITY (
    healt_security_id INT AUTO_INCREMENT PRIMARY KEY,
    people_id INT UNIQUE, -- Relación 1:1 con PEOPLE
    eps_id INT,
    pension_id INT,
    compensation_box_id INT,
    medical_conditions_id INT,
    bank_account VARCHAR(20),
    other_medical_conditions TEXT,
    data_processing_authorization TINYINT(1),
    compensation_family_box INT, -- FK hacia la misma caja o bandera
    housing_allawance TINYINT(1),
    arl_id INT
);

-- Conectar con la tabla de personas (PEOPLE)
ALTER TABLE PEOPLE_HEALT_SECURITY 
ADD CONSTRAINT fk_healt_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar con las maestras de seguridad social
ALTER TABLE PEOPLE_HEALT_SECURITY 
ADD CONSTRAINT fk_healt_eps FOREIGN KEY (eps_id) REFERENCES MASTER_EPS(eps_id),
ADD CONSTRAINT fk_healt_pension FOREIGN KEY (pension_id) REFERENCES MASTER_PENSION(pension_id),
ADD CONSTRAINT fk_healt_box FOREIGN KEY (compensation_box_id) REFERENCES MASTER_COMPENSATION_BOX(compesation_box_id),
ADD CONSTRAINT fk_healt_medical FOREIGN KEY (medical_conditions_id) REFERENCES MASTER_MEDICAL(medical_condition_id),
ADD CONSTRAINT fk_healt_arl FOREIGN KEY (arl_id) REFERENCES MASTER_ARL(arl_id);

-- Conectar las maestras con STATUS_MASTER (que ya existe)
ALTER TABLE MASTER_EPS ADD CONSTRAINT fk_eps_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_PENSION ADD CONSTRAINT fk_pension_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_COMPENSATION_BOX ADD CONSTRAINT fk_box_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_MEDICAL ADD CONSTRAINT fk_medical_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_ARL ADD CONSTRAINT fk_arl_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);


-- Maestra de Empresas (Compañías internas o externas)
CREATE TABLE MASTER_COMPANY (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Áreas (Recursos Humanos, Contabilidad, etc.)
CREATE TABLE MASTER_AREA (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Tipos de Personas (Empleado, Contratista, Pasante, etc.)
CREATE TABLE MASTER_TYPE_PEOPLE (
    type_people_id INT AUTO_INCREMENT PRIMARY KEY,
    type_people VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Datos Empresariales del Personal
CREATE TABLE BUSINESS_PEOPLE_DATA (
    people_business_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    city_work_id INT,
    contract_id INT,
    leader_id INT,
    notes VARCHAR(200),
    missing_vacancy VARCHAR(50),
    job_title INT, -- Referencia a MASTER_JOB_TITLES
    salary DECIMAL(15,2),
    termination_date DATETIME,
    start_date DATETIME,
    end_state DATETIME,
    status_id INT,
    order_id INT,
    cost_center_id INT,
    unit_id INT,
    type_people_id INT,
    company_id INT,
    area_id INT
);

-- Conectar BUSINESS_PEOPLE_DATA con sus nuevas maestras
ALTER TABLE BUSINESS_PEOPLE_DATA 
ADD CONSTRAINT fk_bus_company FOREIGN KEY (company_id) REFERENCES MASTER_COMPANY(company_id),
ADD CONSTRAINT fk_bus_area FOREIGN KEY (area_id) REFERENCES MASTER_AREA(area_id),
ADD CONSTRAINT fk_bus_type_p FOREIGN KEY (type_people_id) REFERENCES MASTER_TYPE_PEOPLE(type_people_id);

-- Conectar con tablas creadas en bloques anteriores
ALTER TABLE BUSINESS_PEOPLE_DATA 
ADD CONSTRAINT fk_bus_client FOREIGN KEY (client_id) REFERENCES MASTER_CLIENT(client_id),
ADD CONSTRAINT fk_bus_contract FOREIGN KEY (contract_id) REFERENCES MASTER_CONTRACTS(contract_id),
ADD CONSTRAINT fk_bus_job FOREIGN KEY (job_title) REFERENCES MASTER_JOB_TITLES(id_job),
ADD CONSTRAINT fk_bus_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id),
ADD CONSTRAINT fk_bus_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- ¡CONEXIÓN CLAVE! Cerramos el pendiente en la tabla PEOPLE
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_business FOREIGN KEY (people_business_id) REFERENCES BUSINESS_PEOPLE_DATA(people_business_id);


-- Tabla de Plantas de Operación
CREATE TABLE OPERATION_PLANT (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    cost_center_id INT -- FK hacia COST_CENTER
);
-- Conectar OPERATION_PLANT con COST_CENTER (que creamos al inicio del proyecto)
ALTER TABLE OPERATION_PLANT 
ADD CONSTRAINT fk_plant_cost_center FOREIGN KEY (cost_center_id) REFERENCES COST_CENTER(cost_center_id);

-- CONEXIÓN CLAVE: Cerramos el pendiente en HIRING_ORDER
ALTER TABLE HIRING_ORDER 
ADD CONSTRAINT fk_hiring_plant FOREIGN KEY (plant_id) REFERENCES OPERATION_PLANT(plant_id);
USE talentohumano360;

SELECT * FROM ROLE_pages;

-- Limpiamos registros previos para evitar conflictos de IDs si es necesario
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ROLES;
SET FOREIGN_KEY_CHECKS = 1;

-- Insertamos la nueva estructura jerárquica
INSERT INTO ROLES (role_id, name_role, description, status_rol) VALUES
(1, 'Gerente', 'Alto Mando: Gestión administrativa y estratégica', 1),
(2, 'Tecnologia', 'Alto Mando: Administración de sistemas y seguridad', 1),
(3, 'Lideres', 'Medio Mando: Gestión de equipos y centros de costos', 1),
(4, 'Soporte', 'Medio Mando: Soporte técnico y gestión de usuarios', 1),
(5, 'Analista', 'Bajo Mando: Operación y análisis de datos', 1);

USE talentohumano360;

USE talentohumano360;

-- Agregamos el campo para el cambio de contraseña obligatorio
ALTER TABLE USERS 
ADD COLUMN requires_password_change TINYINT(1) DEFAULT 1;

-- Agregamos el número de documento como identificador único de login
-- Lo posicionamos después del user_id para mantener el orden lógico
ALTER TABLE USERS 
ADD COLUMN document_number VARCHAR(20) UNIQUE AFTER user_id;

DESCRIBE USERS;

USE talentohumano360;

USE talentohumano360;

-- Primero borramos cualquier intento fallido previo para que no haya conflicto de documento
DELETE FROM USERS WHERE document_number = '12345678';

-- Insertamos el usuario con los nombres de columna exactos de tu DESCRIBE
INSERT INTO USERS (
    document_number, 
    role_id, 
    email, 
    password_hash, 
    name, 
    last_name, 
    status_id, 
    requires_password_change
) VALUES (
    '7777777777', 
    1, -- Rol Gerente (según el script de roles que cargamos)
    'soporte@talentohumano368.com', 
    '$2a$12$emg98crxoW9F0eHUZnk8iuUJSWyyJ77v0K7wChV9NHVA5YEKFub.C', -- El backend luego se encargará de validar esto o hashearlo
    'Alex', 
    'Nieto', 
    1, 
    1
);

describe master_offices;

select * from master_offices;

USE talentohumano360;

-- Limpiamos por si acaso quedó algún registro a medias
TRUNCATE TABLE PAGES;

-- Insertamos las páginas con los nombres de columna correctos
INSERT INTO PAGES (page_name, route, description, status_page, page_route) VALUES
('Dashboard', '/dashboard', 'Panel principal de indicadores', 1, '/dashboard'),
('Gestión de Roles', '/roles', 'Administración de jerarquías', 1, '/roles'),
('Gestión de Permisos', '/permissions', 'Asignación de accesos por página', 1, '/permissions'),
('Gestión de Usuarios', '/users', 'Administración de personal y cuentas', 1, '/users'),
('Planta Operación', '/planta', 'Control de personal operativo', 1, '/planta'),
('Centro de Costos', '/costos', 'Gestión financiera por áreas', 1, '/costos'),
('Carga Excel', '/upload', 'Importación masiva de datos', 1, '/upload'),
('Orden de Contratación', '/contratacion', 'Generación de documentos legales', 1, '/contratacion');

-- Le damos al Gerente (ID 1) permiso para ver todas las páginas recién creadas
INSERT INTO ROLE_PAGES (role_id, page_id)
SELECT 1, page_id FROM PAGES;

SELECT * FROM PAGES;
DESCRIBE PAGES;

USE talentohumano360;

USE talentohumano360;

USE talentohumano360;

-- PASO A: Crear la columna que el Backend necesita para el JOIN
ALTER TABLE PAGES ADD COLUMN page_code VARCHAR(50) AFTER page_id;

USE talentohumano360;

-- Si esto falla con "Duplicate column", no importa, significa que ya está.
ALTER TABLE role_pages ADD COLUMN page_code VARCHAR(50) NOT NULL;

SET SQL_SAFE_UPDATES = 0;

-- Llenamos los códigos en la tabla maestra
UPDATE PAGES SET page_code = 'DASHBOARD' WHERE route = '/dashboard';
UPDATE PAGES SET page_code = 'ROLES' WHERE route = '/roles';
UPDATE PAGES SET page_code = 'PERMISSIONS' WHERE route = '/permissions';
UPDATE PAGES SET page_code = 'USERS' WHERE route = '/users';
UPDATE PAGES SET page_code = 'PLANTA' WHERE route = '/planta';
UPDATE PAGES SET page_code = 'COSTOS' WHERE route = '/costos';
UPDATE PAGES SET page_code = 'UPLOAD' WHERE route = '/upload';
UPDATE PAGES SET page_code = 'CONTRATACION' WHERE route = '/contratacion';

-- Limpiamos la tabla de relación para evitar basura
TRUNCATE TABLE role_pages;

-- Insertamos la relación final
INSERT INTO role_pages (role_id, page_code, can_view, can_edit) 
SELECT 1, page_code, 1, 1 FROM PAGES;



-- Añadimos las columnas de permisos que el backend consulta
ALTER TABLE role_pages ADD COLUMN can_view TINYINT(1) DEFAULT 1;
ALTER TABLE role_pages ADD COLUMN can_edit TINYINT(1) DEFAULT 1;

-- Verificamos que el page_code sea la llave de unión
-- (Si ya existe, te dará error de duplicado, ignóralo y sigue)
ALTER TABLE role_pages MODIFY COLUMN page_code VARCHAR(50) NOT NULL;

-- Limpiamos para evitar conflictos
TRUNCATE TABLE role_pages;

-- Insertamos los permisos: El Rol 1 (Gerente) tiene permiso 1 (Sí) en cada página
INSERT INTO role_pages (role_id, page_code, can_view, can_edit) 
SELECT 1, page_code, 1, 1 FROM PAGES;

DESCRIBE permissions;

USE talentohumano360;

-- 1. Creamos la columna que el backend está buscando
ALTER TABLE permissions ADD COLUMN permission_code VARCHAR(100) AFTER permission_id;

-- 2. Llenamos la columna permission_code usando la descripción o valores genéricos
-- Esto es para que el código tenga un 'código' de texto que leer
SET SQL_SAFE_UPDATES = 0;
UPDATE permissions SET permission_code = UPPER(REPLACE(description, ' ', '_'));

-- 3. Si tienes un permiso general, asegúrate de que sea potente
UPDATE permissions SET permission_code = 'ACCESS_ALL' WHERE permission_id = 1;

-- 1. Aseguramos que la tabla de unión también tenga la columna permission_code
-- (Si ya existe, te dará error de duplicado, ignóralo)
ALTER TABLE role_permissions ADD COLUMN permission_code VARCHAR(100);

-- 2. Limpiamos y asignamos todos los permisos al Gerente (role_id = 1)
TRUNCATE TABLE role_permissions;

INSERT INTO role_permissions (role_id, permission_code)
SELECT 1, permission_code FROM permissions;

-- 1. Aseguramos que la tabla tenga los nombres que Copilot ve en el código
ALTER TABLE role_permissions CHANGE COLUMN role_code role_id INT; -- Si se llamaba role_code
ALTER TABLE role_permissions MODIFY COLUMN permission_code VARCHAR(100);

-- 2. Población definitiva para el Gerente
INSERT INTO role_permissions (role_id, permission_code)
SELECT 1, permission_code FROM permissions
ON DUPLICATE KEY UPDATE permission_code = VALUES(permission_code);

describe master_offices;

SELECT * FROM master_company;



describe master_regional;

INSERT INTO master_regional (name, status_id) VALUES 
('ZONA BOGOTA', 1),
('ADMINISTRACION', 1),
('NORORIENTE', 1),
('ANTIOQUIA Y SABANAS', 1),
('BOGOTÁ Y CENTRO', 1),
('EJE CAFETERO Y SUR', 1),
('ZONA CENTRO', 1),
('ZONA OCCIDENTE', 1),
('ZONA NORTE', 1),
('ZONA MEDELLIN', 1),
('BOGOTÁ', 1),
('GESTORIA ANTIOQUIA Y SABANAS', 1),
('GESTORIA BOGOTA Y CENTRO', 1),
('ZONA ORIENTE', 1),
('ZONA ANTIOQUIA', 1),
('BOGOTA Y CENTRO', 1),
('ZONA SUPERVISOR', 1),
('TROPAS ANTIOQUIA Y SABANAS', 1),
('TROPAS BOGOTA Y CENTRO', 1),
('TROPAS SUR', 1),
('TROPAS EJE CAFETERO', 1);

-- BLOQUE FINAL:
-- Consolidación final de la red de oficinas
-- 1. Agregamos las columnas que faltan
ALTER TABLE MASTER_OFFICES 
ADD COLUMN id_ciudad INT NULL AFTER name,
ADD COLUMN id_regional INT NULL AFTER zona_id;

-- 2. Renombramos para que coincidan con tu script (opcional, pero ayuda al orden)
ALTER TABLE MASTER_OFFICES CHANGE COLUMN department_id id_ciudad INT NULL;
ALTER TABLE MASTER_OFFICES CHANGE COLUMN leader_id id_lider INT NULL;
ALTER TABLE MASTER_OFFICES CHANGE COLUMN zona_id id_zona INT NULL;

SET FOREIGN_KEY_CHECKS = 0;

-- BLOQUE 1: REORGANIZADO PARA MASTER_OFFICE
INSERT INTO MASTER_OFFICES (name, id_ciudad, status_id, departament_id, leader_id, zona_id, id_regional, created_ad) VALUES
('ADMIN ESPECIALIZADA', 25, 1, 25, 1, 1, 10, NOW()),
('ADMIN FUERZA VENTAS', 25, 1, 25, 32, 2, 14, NOW()),
('Admin Gestoria', 25, 1, 25, 39, 2, 14, NOW()),
('ADMIN LUKA', 25, 1, 25, NULL, 2, 14, NOW()),
('ADMIN LUKA EXITO', 25, 1, 25, NULL, 2, 14, NOW()),
('ADMIN RED DE OFICINAS', 25, 1, 25, 29, 2, 14, NOW()),
('ADMINISTRACION', 25, 1, 25, NULL, 2, 14, NOW()),
('ADMON TALENTO HUMANO', 1, 1, 1, 41, 2, 14, NOW()),
('BAGR - Albania', 1182, 1, 1182, 2, 3, 4, NOW()),
('BAGR - Betulia', 173, 1, 173, 3, 4, 1, NOW()),
('BAGR - Bilbao', 1182, 1, 1182, 4, 5, 1, NOW()),
('BAGR - Bosa', 25, 1, 25, 5, 6, 2, NOW()),
('BAGR - Briceño', 1182, 1, 1182, 6, 7, 1, NOW()),
('BAGR - BuenaVista', 1182, 1, 1182, 7, 8, 4, NOW()),
('BAGR - Cantagallo', 1182, 1, 1182, NULL, 9, 4, NOW()),
('BAGR - Carepa', 172, 1, 172, 8, 10, 1, NOW()),
('BAGR - Chicoral', 1182, 1, 1182, 9, 11, 1, NOW()),
('BAGR - Corregimiento Arauca', 1182, 1, 1182, 10, 12, 3, NOW()),
('BAGR - Dibulla', 153, 1, 153, 2, 3, 4, NOW()),
('BAGR - El Calvario', 1182, 1, 1182, 11, 13, 4, NOW()),
('BAGR - El Limon', 1182, 1, 1182, 9, 11, 1, NOW()),
('BAGR - El Paso Cesar', 99, 1, 99, 2, 3, 4, NOW()),
('BAGR - El Playon', 105, 1, 105, 12, 9, 4, NOW()),
('BAGR - El Reten', 1182, 1, 1182, 2, 3, 4, NOW()),
('BAGR - Granabastos Soledad', 145, 1, 145, 1, 14, 4, NOW()),
('BAGR - Guacheta', 1182, 1, 1182, 13, 15, 2, NOW()),
('BAGR - Hatonuevo', 145, 1, 145, 2, 3, 4, NOW()),
('BAGR - La Apartada', 123, 1, 123, 8, 10, 1, NOW()),
('BAGR - La Esperanza', 1182, 1, 1182, 12, 9, 4, NOW()),
('BAGR - La Victoria', 115, 1, 115, 14, 16, 3, NOW()),
('BAGR - Mahates', 179, 1, 179, 1, 14, 4, NOW()),
('BAGR - Manzanares', 140, 1, 140, 10, 12, 3, NOW()),
('BAGR - Pachavita', 133, 1, 133, 13, 15, 2, NOW()),
('BAGR - Pitalito III', 191, 1, 191, 4, 5, 1, NOW()),
('BAGR - Ponedera', 149, 1, 149, 1, 14, 4, NOW()),
('BAGR - Puente Nacional', 109, 1, 109, 7, 8, 4, NOW()),
('BAGR - Puerto Triunfo', 1182, 1, 1182, NULL, 7, 1, NOW()),
('BAGR - Quinchia', 164, 1, 164, 15, 17, 4, NOW()),
('BAGR - Salgar', 1182, 1, 1182, 3, 4, 1, NOW()),
('BAGR - San Adolfo', 1182, 1, 1182, 4, 5, 1, NOW()),
('BAGR - San Jose de Ure', 1182, 1, 1182, 8, 10, 1, NOW()),
('BAGR - San Miguel de Sema', 135, 1, 135, 7, 8, 4, NOW()),
('BAGR - Santa Barbara', 1182, 1, 1182, 3, 4, 1, NOW()),
('BAGR - Santa Rosa', 1182, 1, 1182, 1, 14, 4, NOW()),
('BAGR - Santiago Norte Santander', 1182, 1, 1182, 12, 9, 4, NOW()),
('BAGR - Santiago Putumayo', 1182, 1, 1182, 16, 18, 3, NOW()),
('BAGR - Suaita', 111, 1, 111, 7, 8, 4, NOW()),
('BAGR - Turbaco', 177, 1, 177, 1, 14, 4, NOW()),
('BAGR - Valle De San Jose', 108, 1, 108, 17, 19, 3, NOW()),
('BAGR - Yolombo', 164, 1, 164, 6, 7, 1, NOW()),
('BAGR - Zambrano', 180, 1, 180, 1, 14, 4, NOW()),
('BBOG - Apertura Cuentas Cali', 12, 1, 12, 18, 20, 3, NOW()),
('BBOG - AXON Extensión de Caja CAD 30', 25, 1, 25, 19, 21, 2, NOW()),
('BBOG - AXON Extensión de Caja CADE Plaza de las Americas', 25, 1, 25, 5, 6, 2, NOW()),
('BBOG - AXON Extensión de Caja Centro Administrativo 114', 25, 1, 25, 13, 15, 2, NOW()),
('BBOG - BACK Medellin', 154, 1, 154, 3, 4, 1, NOW()),
('BBOG - BBOG Extension Barrancabermeja', 107, 1, 107, 12, 9, 4, NOW()),
('BBOG - Belen de Umbria', 1182, 1, 1182, 15, 17, 4, NOW()),
('BBOG - Cecar Sincelejo', 112, 1, 112, 8, 10, 1, NOW()),
('BBOG - Centro Cial. Mercurio', 126, 1, 126, NULL, 22, 11, NOW()),
('BBOG - Expreso Brasilia', 144, 1, 144, 20, 23, 4, NOW()),
('BBOG - Extension Alcaldía de Arauca', 143, 1, 143, 21, 24, 2, NOW()),
('BBOG - Extension Cantagallo', 1182, 1, 1182, 12, 9, 4, NOW()),
('BBOG - Extension Castilla la Nueva', 157, 1, 157, 11, 13, 4, NOW()),
('BBOG - Extension City U', 25, 1, 25, 22, 25, 2, NOW()),
('BBOG - Extension COOPETRAN', 101, 1, 101, 17, 19, 3, NOW()),
('BBOG - Extensión de Caja Alcaldía Buenavetura', 116, 1, 116, 23, 26, 3, NOW()),
('BBOG - Extension de Caja Arbelaez', 142, 1, 142, 9, 11, 1, NOW()),
('BBOG - Extension de Caja Barranca de Upia', 159, 1, 159, 11, 13, 4, NOW()),
('BBOG - Extensión de Caja Candelaria', 12, 1, 12, 23, 26, 3, NOW()),
('BBOG - Extension de Caja Cavasa', 12, 1, 12, 23, 26, 3, NOW()),
('BBOG - Extensión de Caja Gobernación del Cesar', 196, 1, 196, 2, 3, 4, NOW()),
('BBOG - Extension de Caja Ingredion', 12, 1, 12, 23, 26, 3, NOW()),
('BBOG - Extension de Caja Ipiales', 173, 1, 173, 16, 18, 3, NOW()),
('BBOG - Extension de Caja Jamundi', 114, 1, 114, 18, 20, 3, NOW()),
('BBOG - Extension de Caja La Victoria', 115, 1, 115, NULL, 27, 12, NOW()),
('BBOG - Extensión de Caja Riosucio', 138, 1, 138, 15, 17, 4, NOW()),
('BBOG - Extension de Caja Yopal', 141, 1, 141, 7, 8, 4, NOW()),
('BBOG - Extension de Caja Yumbo', 112, 1, 112, 23, 26, 3, NOW()),
('BBOG - Extension Departamento Norte de Santander', 168, 1, 168, 12, 9, 4, NOW()),
('BBOG - Extension Electrificadora de Santander', 101, 1, 101, 17, 19, 3, NOW()),
('BBOG - Extension Escuela de Aviación', 12, 1, 12, 23, 26, 3, NOW()),
('BBOG - Extension Gobernación de Arauca', 143, 1, 143, 21, 24, 2, NOW()),
('BBOG - Extension Los Patios', 169, 1, 169, 12, 9, 4, NOW()),
('BBOG - Extension Municipio San José de Cúcuta', 168, 1, 168, 12, 9, 4, NOW()),
('BBOG - Extension Natagaima', 184, 1, 184, 9, 11, 1, NOW()),
('BBOG - Extension Pontificia Bolivariana', 101, 1, 101, 24, 28, 3, NOW()),
('BBOG - Extension Puerto Rico Caqueta', 167, 1, 167, 4, 5, 1, NOW()),
('BBOG - Extension UNAB', 101, 1, 101, 17, 19, 3, NOW()),
('BBOG - Extension Universidad Santo Tomas sede calle 72', 25, 1, 25, 19, 21, 2, NOW()),
('BBOG - Extension Yondó', 168, 1, 168, 12, 9, 4, NOW()),
('BBOG - Fondo Nacional Ahorro', 25, 1, 25, 25, 29, 2, NOW()),
('BBOG - Frigorifico Guadalupe', 25, 1, 25, NULL, 1, 10, NOW()),
('BBOG - Gobernación de San Andrés', 185, 1, 185, 26, 30, 2, NOW()),
('BBOG - Gobernacion del Meta', 154, 1, 154, 11, 13, 4, NOW()),
('BBOG - GobernaciondeBoyaca', 134, 1, 134, 7, 8, 4, NOW()),
('BBOG - La Previsora', 25, 1, 25, 19, 21, 2, NOW()),
('BBOG - POST VENTA BARRANQUILLA', 144, 1, 144, NULL, 31, 12, NOW()),
('BBOG - POST VENTA BOGOTA', 25, 1, 25, NULL, 1, 10, NOW()),
('BBOG - POST VENTA BUCARAMANGA', 101, 1, 101, NULL, 22, 11, NOW()),
('BBOG - POST VENTA CALI', 12, 1, 12, NULL, 27, 3, NOW()),
('BBOG - POST VENTA MEDELLIN', 150, 1, 150, NULL, 32, 9, NOW()),
('BBOG - POST VENTA NEIVA', 188, 1, 188, NULL, 22, 11, NOW()),
('BBOG - POST VENTA PASTO', 171, 1, 171, NULL, 22, 11, NOW()),
('BBOG - POST VENTA TUNJA', 134, 1, 134, NULL, 22, 11, NOW()),
('BBOG - POST VENTA VILLAVICENCIO', 154, 1, 154, NULL, 25, 11, NOW()),
('BBOG - Sociedad Portuaria San Andres', 185, 1, 185, 26, 30, 2, NOW()),
('BBOG - Tayrona Palangana', 115, 1, 115, 20, 23, 4, NOW()),
('BBOG - Tayrona Zaino', 115, 1, 115, 20, 23, 4, NOW()),
('BBOG - Tibasosa', 1182, 1, 1182, 7, 8, 4, NOW()),
('BBOG - U. La Sabana', 25, 1, 25, 13, 15, 2, NOW()),
('BBOG - U. Libre Bosque Popular', 25, 1, 25, 25, 29, 2, NOW()),
('BBOG - U. Libre Candelaria', 25, 1, 25, 22, 25, 2, NOW()),
('BBOG - Universidad Santander', 101, 1, 101, 17, 19, 3, NOW()),
('BBOG - VALIDACION DOCUMENTAL', 25, 1, 25, NULL, 2, 14, NOW()),
('BBOG - Extension Caja Cerromatoso', 121, 1, 121, 8, 10, 1, NOW()),
('BBOG – Extension Caja Gobernacion Guajira', 144, 1, 144, NULL, 3, 4, NOW()),
('BBOG - Extension Caja Malambo', 145, 1, 145, 1, 14, 4, NOW()),
('Luka MP - Palmira Centro', 1, 1, 1, NULL, 36, 3, NOW()),
('Luka ADMIN LUKA', 25, 1, 25, NULL, 2, 14, NOW()),
('LUKA MP - Aguachica', 194, 1, 194, NULL, 9, 4, NOW()),
('Luka MP - Ansermanuevo Valle', 181, 1, 181, NULL, 16, 3, NOW()),
('LUKA MP - Armenia Centro', 160, 1, 160, NULL, 12, 3, NOW()),
('Luka MP - Ayapel', 1182, 1, 1182, NULL, 10, 1, NOW()),
('LUKA MP - Barbosa', 1182, 1, 1182, NULL, 7, 1, NOW()),
('Luka MP - Belen de Umbria', 1182, 1, 1182, NULL, 40, 4, NOW()),
('Luka MP - Buga La Grande', 114, 1, 114, NULL, 16, 3, NOW()),
('Luka MP - Cajicá', 1182, 1, 1182, NULL, 15, 2, NOW()),
('LUKA MP - Cali La 34', 12, 1, 12, NULL, 26, 3, NOW()),
('Luka MP - Carabobo', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - Cartago Centro', 115, 1, 115, NULL, 16, 3, NOW()),
('Luka MP - Caucasia', 172, 1, 172, NULL, 10, 1, NOW()),
('Luka MP - Cerrito Centro', 1182, 1, 1182, NULL, 36, 3, NOW()),
('Luka MP - Chia', 1182, 1, 1182, NULL, 15, 2, NOW()),
('Luka MP - Chinchina', 160, 1, 160, NULL, 12, 3, NOW()),
('Luka MP - Chiquinquirá', 134, 1, 134, NULL, 8, 4, NOW()),
('Luka MP - Choconta', 1182, 1, 1182, NULL, 15, 2, NOW()),
('Luka MP - Consumo La América', 150, 1, 150, NULL, 7, 1, NOW()),
('Luka MP - Copacabana', 154, 1, 154, NULL, 7, 1, NOW()),
('Luka MP - Cota San Miguel', 1182, 1, 1182, NULL, 8, 4, NOW()),
('Luka MP - Duitama', 1182, 1, 1182, NULL, 8, 4, NOW()),
('Luka MP - El Peñol', 1182, 1, 1182, NULL, 33, 1, NOW()),
('Luka MP - Envigado', 151, 1, 151, NULL, 4, 1, NOW()),
('LUKA MP - Estadio', 150, 1, 150, NULL, 4, 1, NOW()),
('Luka MP - Florencia Centro', 1182, 1, 1182, NULL, 5, 1, NOW()),
('Luka MP - Florida Blanca', 105, 1, 105, NULL, 28, 3, NOW()),
('Luka MP - Fonseca', 1182, 1, 1182, NULL, 3, 4, NOW()),
('Luka MP - Gigante', 1182, 1, 1182, NULL, 5, 1, NOW()),
('Luka MP - Ginebra', 1182, 1, 1182, NULL, 36, 3, NOW()),
('LUKA MP - Granada', 1182, 1, 1182, NULL, 13, 4, NOW()),
('Luka MP - Guacari', 1182, 1, 1182, NULL, 36, 3, NOW()),
('Luka MP - Honda', 1182, 1, 1182, NULL, 11, 1, NOW()),
('Luka MP - Ipiales', 173, 1, 173, NULL, 18, 3, NOW()),
('Luka MP - Ipiales 2', 173, 1, 173, NULL, 18, 3, NOW()),
('Luka MP - Jamundi 1 Local 9', 114, 1, 114, NULL, 20, 3, NOW()),
('Luka MP - Junin', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - La Cometa', 1, 1, 1, NULL, 36, 3, NOW()),
('Luka MP - La Dorada', 1182, 1, 1182, NULL, 7, 1, NOW()),
('Luka MP - La Plata', 1182, 1, 1182, NULL, 5, 1, NOW()),
('Luka MP - La Playa', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - La Union', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka MP - La Virginia', 1182, 1, 1182, NULL, 17, 4, NOW()),
('Luka MP - Leticia', 1182, 1, 1182, NULL, 15, 2, NOW()),
('Luka MP - Libano', 1182, 1, 1182, NULL, 11, 1, NOW()),
('Luka MP - Malambo', 145, 1, 145, NULL, 14, 4, NOW()),
('Luka MP - Manrique', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - Marinilla', 1182, 1, 1182, NULL, 33, 1, NOW()),
('Luka MP - Megacentro', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - Mocoa', 1182, 1, 1182, NULL, 21, 2, NOW()),
('LUKA MP - Montelibano', 121, 1, 121, NULL, 10, 1, NOW()),
('Luka MP - Montenegro', 1182, 1, 1182, NULL, 12, 3, NOW()),
('Luka MP - Monteria', 112, 1, 112, NULL, 10, 1, NOW()),
('Luka MP - Parque del Rio', 1182, 1, 1182, NULL, 28, 3, NOW()),
('Luka MP - Pasto Centro', 171, 1, 171, NULL, 18, 3, NOW()),
('EXT BAGR - SAN PABLO NARIÑO', 171, 1, 171, NULL, 18, 3, NOW()),
('Luka MP - Piedecuesta', 1182, 1, 1182, NULL, 28, 3, NOW()),
('Luka MP - Pitalito Centro', 191, 1, 191, NULL, 5, 1, NOW()),
('Luka MP - Popayan', 1, 1, 1, NULL, 18, 3, NOW()),
('Luka MP - Puerto Berrio', 1182, 1, 1182, NULL, 7, 1, NOW()),
('Luka MP - Puerto Boyaca', 1182, 1, 1182, NULL, 7, 1, NOW()),
('Luka MP - Puerto Inirida', 1182, 1, 1182, NULL, 30, 2, NOW()),
('Luka MP - Riohacha', 144, 1, 144, NULL, 3, 4, NOW()),
('Luka MP - Rionegro', 1182, 1, 1182, NULL, 33, 1, NOW()),
('Luka MP - Riosucio', 138, 1, 138, NULL, 12, 3, NOW()),
('Luka MP - Roldanillo', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka MP - San Alberto', 1182, 1, 1182, NULL, 9, 4, NOW()),
('Luka MP - San Gil', 108, 1, 108, NULL, 19, 3, NOW()),
('Luka MP - San Jose del Guaviare', 1182, 1, 1182, NULL, 13, 4, NOW()),
('Luka MP - San Pedro', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka MP - Santa Rosa de Cabal', 160, 1, 160, NULL, 17, 4, NOW()),
('Luka MP - Santuario', 1182, 1, 1182, NULL, 33, 1, NOW()),
('Luka MP - Sevilla', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka MP - Sevilla II', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka MP - Sibate', 1182, 1, 1182, NULL, 6, 2, NOW()),
('Luka MP - Soacha', 126, 1, 126, NULL, 6, 2, NOW()),
('Luka MP - Trujillo', 1182, 1, 1182, NULL, 16, 3, NOW()),
('LUKA MP - Tulua', 114, 1, 114, NULL, 16, 3, NOW()),
('Luka MP - Tunja', 134, 1, 134, NULL, 8, 4, NOW()),
('Luka MP - Villa Maria', 1182, 1, 1182, NULL, 12, 3, NOW()),
('Luka MP - Villa Nueva', 150, 1, 150, NULL, 33, 1, NOW()),
('Luka MP - Villacolombia', 12, 1, 12, NULL, 26, 3, NOW()),
('Luka MP - Villavicencio Centro II', 154, 1, 154, NULL, 13, 4, NOW()),
('LUKA MP - Yopal', 141, 1, 141, NULL, 8, 4, NOW()),
('Luka MP - Yumbo', 112, 1, 112, NULL, 26, 3, NOW()),
('Luka MP - Zarzal Valle', 1182, 1, 1182, NULL, 16, 3, NOW()),
('Luka RM - Altavista', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Arboletes', 1182, 1, 1182, NULL, 10, 1, NOW()),
('Luka RM - Bosa', 25, 1, 25, NULL, 6, 2, NOW()),
('Luka RM - Bosconia', 99, 1, 99, NULL, 3, 4, NOW()),
('Luka RM - Buenavista del Sinu', 1182, 1, 1182, NULL, 10, 1, NOW()),
('Luka RM - Cade Candelaria', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Cade Engativa', 25, 1, 25, NULL, 29, 2, NOW()),
('Luka RM - Cade La Gaitana', 25, 1, 25, NULL, 30, 2, NOW()),
('Luka RM - Cade Luceros', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Cade Manitas', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Cade Muzu', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Cade Santa Helenita', 25, 1, 25, NULL, 30, 2, NOW()),
('Luka RM - Cade Servita', 25, 1, 25, NULL, 15, 2, NOW()),
('Luka RM - Cade Yomasa', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Carrera 7', 25, 1, 25, NULL, 25, 2, NOW()),
('Luka RM - Castilla', 150, 1, 150, NULL, 7, 1, NOW()),
('Luka RM - CC Platino', 151, 1, 151, NULL, 4, 1, NOW()),
('Luka RM - Espinal', 184, 1, 184, NULL, 11, 1, NOW()),
('Luka RM - Facatativa', 1182, 1, 1182, NULL, 30, 2, NOW()),
('Luka RM - Girardot', 1182, 1, 1182, NULL, 11, 1, NOW()),
('Luka RM - Ipiales Gran Plaza', 173, 1, 173, NULL, 18, 3, NOW()),
('Luka RM - La Triada', 101, 1, 101, NULL, 19, 3, NOW()),
('Luka RM - Madrid', 1182, 1, 1182, NULL, 30, 2, NOW()),
('Luka RM - Magangue', 1182, 1, 1182, NULL, 10, 1, NOW()),
('Luka RM - Mompox', 1182, 1, 1182, NULL, 10, 1, NOW()),
('Luka RM - Moniquira', 1182, 1, 1182, NULL, 8, 4, NOW()),
('Luka RM - Paris', 150, 1, 150, NULL, 7, 1, NOW()),
('Luka RM - Puerto Asis', 1182, 1, 1182, NULL, 11, 1, NOW()),
('Luka RM - Ramiriqui', 1182, 1, 1182, NULL, 8, 4, NOW()),
('Luka RM - Rapicade 7 de Agosto', 25, 1, 25, NULL, 21, 2, NOW()),
('Luka RM - Rapicade Chapinero', 25, 1, 25, NULL, 21, 2, NOW()),
('Luka RM - Rapicade Fontibon', 25, 1, 25, NULL, 29, 2, NOW()),
('Luka RM - Rapicade Soacha', 25, 1, 25, NULL, 6, 2, NOW()),
('Luka RM - Rapicade Suba Norte', 25, 1, 25, NULL, 30, 2, NOW()),
('Luka RM - San Agustin', 1182, 1, 1182, NULL, 5, 1, NOW()),
('Luka RM - San Javier', 150, 1, 150, NULL, 7, 1, NOW()),
('Luka RM - San Nicolas', 1182, 1, 1182, NULL, 33, 1, NOW()),
('Luka RM - Santafe de Antioquia', 1182, 1, 1182, NULL, 7, 1, NOW()),
('Luka RM - Serafina', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Supercade 20 de Julio', 25, 1, 25, NULL, 24, 2, NOW()),
('Luka RM - Supercade Suba', 25, 1, 25, NULL, 30, 2, NOW()),
('Luka RM - Supermercado OR', 154, 1, 154, NULL, 7, 1, NOW()),
('Luka RM - SuperMercado OR 2', 154, 1, 154, NULL, 7, 1, NOW()),
('Luka RM - Ubate', 1182, 1, 1182, NULL, 15, 4, NOW()),
('Luka RM - Uribia II', 1182, 1, 1182, NULL, 3, 4, NOW()),
('Luka RM - Valle del Guamuez', 1182, 1, 1182, NULL, 21, 2, NOW()),
('Luka RM - Venecia', 25, 1, 25, NULL, 24, 2, NOW()),
('MERCADEO', 25, 1, 25, 52, 2, 14, NOW()),
('MESA DE SOPORTE', 25, 1, 25, NULL, 2, 14, NOW()),
('MI ATM ADMINISTRATIVO', 25, 1, 25, 54, 1, 10, NOW()),
('MOBILIARIO 360', 25, 1, 25, NULL, 54, 10, NOW()),
('MOVIL BANCOLOMBIA PILOTO', 25, 1, 25, NULL, 1, 10, NOW()),
('MP - Acacías', 1182, 1, 1182, 30, 13, 4, NOW()),
('MP - Aeropuerto El Dorado', 25, 1, 25, 45, 29, 2, NOW()),
('MP - Aeropuerto Rafael Nuñez', 103, 1, 103, NULL, 14, 4, NOW()),
('MP - Aguachica', 194, 1, 194, 5, 9, 4, NOW()),
('MP - Alamedas', 112, 1, 112, 46, 10, 1, NOW()),
('MP - Alcaldia Armenia', 160, 1, 160, 10, 12, 3, NOW()),
('MP - Alcaldia Palmira', 1, 1, 1, NULL, 36, 3, NOW()),
('MP - Alcaldia Pitalito', 191, 1, 191, NULL, 5, 1, NOW()),
('MP - Alcaraván', 141, 1, 141, 31, 8, 4, NOW()),
('MP - Ambalema', 1182, 1, 1182, 26, 11, 1, NOW()),
('MP - Ansermanuevo Valle', 181, 1, 181, 4, 16, 3, NOW()),
('MP - Arauca', 1182, 1, 1182, 14, 24, 2, NOW()),
('MP - Armenia Centro', 160, 1, 160, 10, 12, 3, NOW()),
('MP - Armenia Norte', 160, 1, 160, 10, 12, 3, NOW()),
('MP - Astrocentro', 12, 1, 12, 21, 26, 3, NOW()),
('MP - Av Roosevelt', 12, 1, 12, 15, 20, 3, NOW()),
('MP - Av Santander', 142, 1, 142, 10, 12, 3, NOW()),
('MP - Ayapel', 1182, 1, 1182, 46, 10, 1, NOW()),
('MP - Barbosa', 1182, 1, 1182, 1, 7, 1, NOW()),
('MP - Belen de Umbria', 1182, 1, 1182, 11, 17, 4, NOW()),
('MP - Bosque', 1, 1, 1, 44, 36, 3, NOW()),
('MP - Buena Vista', 112, 1, 112, 46, 10, 1, NOW()),
('MP - Buga 2 Piso', 114, 1, 114, 44, 36, 3, NOW()),
('MP - Buga Centro', 114, 1, 114, 44, 36, 3, NOW()),
('MP - Buga Divino Niño', 114, 1, 114, 44, 36, 3, NOW()),
('MP - Buga La Grande', 114, 1, 114, 4, 16, 3, NOW()),
('MP - Buga La Grande II', 114, 1, 114, 4, 16, 3, NOW()),
('MP - Cabecera II', 101, 1, 101, 41, 28, 3, NOW()),
('MP - Cabecera III', 101, 1, 101, 41, 28, 3, NOW()),
('MP - Cabecera Llano', 101, 1, 101, 41, 28, 3, NOW()),
('MP - Cacique', 101, 1, 101, 41, 28, 3, NOW()),
('MP - Cajicá', 1182, 1, 1182, 13, 15, 2, NOW()),
('MP - Calazans', 150, 1, 150, 1, 7, 1, NOW()),
('MP - Cali La 34', 12, 1, 12, 21, 26, 3, NOW()),
('MP - Calle 11', 25, 1, 25, 53, 25, 2, NOW()),
('MP - Calle 79 (Unilago)', 25, 1, 25, 36, 21, 2, NOW()),
('MP - Candelaria Valle', 1182, 1, 1182, 21, 26, 3, NOW()),
('MP - Cañaveral', 1, 1, 1, 44, 36, 3, NOW()),
('MP - Cañaveral Santander', 105, 1, 105, 41, 28, 3, NOW()),
('MP - Carabobo', 150, 1, 150, 2, 33, 1, NOW()),
('MP - Caracoli', 105, 1, 105, 41, 28, 3, NOW()),
('MP - Carrera 70', 150, 1, 150, 42, 4, 1, NOW()),
('MP - Carrera 70 III', 150, 1, 150, 42, 4, 1, NOW()),
('MP - Cartago Centro', 115, 1, 115, 4, 16, 3, NOW()),
('MP - Caucasia', 172, 1, 172, 46, 10, 1, NOW()),
('MP - CC Megamall Valledupar', 96, 1, 96, 47, 3, 4, NOW()),
('MP - CC San Silvestre', 110, 1, 110, 5, 9, 4, NOW()),
('MP - CC Santiago Plaza Cartago', 115, 1, 115, 4, 16, 3, NOW()),
('MP - CC Victoria Plaza', 138, 1, 138, 11, 17, 4, NOW()),
('MP - CC Victoria Plaza II', 138, 1, 138, 11, 17, 4, NOW()),
('MP - Centauros', 154, 1, 154, 30, 13, 4, NOW()),
('MP - Center Park Aguachica', 194, 1, 194, 5, 9, 4, NOW()),
('MP - Centro Chia', 1182, 1, 1182, 13, 15, 2, NOW()),
('MP - Cerrito Centro', 1182, 1, 1182, 44, 36, 3, NOW()),
('MP - Cerrito Parque', 1182, 1, 1182, 44, 36, 3, NOW()),
('MP - Chapinero', 25, 1, 25, 36, 21, 2, NOW()),
('MP - Charala', 1182, 1, 1182, 18, 19, 3, NOW()),
('MP - Chia', 1182, 1, 1182, 13, 15, 2, NOW()),
('MP - Chinchina', 160, 1, 160, 10, 12, 3, NOW()),
('MP - Chipichape', 12, 1, 12, 21, 26, 3, NOW()),
('MP - Chiquinquirá', 134, 1, 134, 31, 8, 4, NOW()),
('MP - Choconta', 1182, 1, 1182, 13, 15, 2, NOW()),
('MP - Cienaga', 1182, 1, 1182, 49, 14, 4, NOW()),
('MP - Circunvalar Pereira', 138, 1, 138, 11, 17, 4, NOW()),
('MP - Ciudad Tintal', 25, 1, 25, 55, 6, 2, NOW()),
('MP - Consumo Belén', 150, 1, 150, 3, 4, 1, NOW()),
('MP - Consumo La América', 150, 1, 150, 1, 7, 1, NOW()),
('MP - Copacabana', 154, 1, 154, 1, 7, 1, NOW()),
('MP - Cosmocentro 2', 12, 1, 12, 15, 20, 3, NOW()),
('MP - Cosmocentro 2 Isla', 12, 1, 12, 15, 20, 3, NOW()),
('MP - Cota San Miguel', 1182, 1, 1182, 13, 15, 2, NOW()),
('MP - Cra 8a.', 25, 1, 25, 53, 25, 2, NOW()),
('MP - Cuba', 138, 1, 138, 11, 17, 4, NOW()),
('MP - Cucuta', 124, 1, 124, 5, 9, 4, NOW()),
('MP - Duitama', 1182, 1, 1182, 31, 8, 4, NOW()),
('MP - El Eden', 25, 1, 25, 36, 21, 2, NOW()),
('MP - El Peñol', 1182, 1, 1182, 2, 33, 1, NOW()),
('MP - Envigado', 151, 1, 151, 3, 4, 1, NOW()),
('MP - Estadio', 150, 1, 150, 42, 4, 1, NOW()),
('MP - Florencia Centro', 1182, 1, 1182, 32, 5, 1, NOW()),
('MP - Florida Blanca', 105, 1, 105, 41, 28, 3, NOW()),
('MP - Fonseca', 1182, 1, 1182, 47, 3, 4, NOW()),
('MP - Granada', 1182, 1, 1182, 30, 13, 4, NOW()),
('MP - Ibague Centro', 120, 1, 120, 26, 11, 1, NOW()),
('MP - Ipiales', 173, 1, 173, 17, 18, 3, NOW()),
('MP - Jamundi', 114, 1, 114, 15, 20, 3, NOW()),
('MP - Monteria', 112, 1, 112, 46, 10, 1, NOW()),
('ORIP - Manizales', 142, 1, 142, 10, 12, 3, NOW()),
('ORIP - Neiva', 16, 1, 16, 32, 5, 1, NOW()),
('ORIP - Pasto', 173, 1, 173, 17, 18, 3, NOW()),
('ORIP - Pereira', 138, 1, 138, 11, 17, 4, NOW()),
('ORIP - Santa Marta', 1182, 1, 1182, 49, 14, 4, NOW()),
('ORIP - Tunja', 1182, 1, 1182, 31, 8, 4, NOW()),
('ORIP - Valledupar', 96, 1, 96, 47, 3, 4, NOW()),
('ORIP - Villavicencio', 154, 1, 154, 30, 13, 4, NOW()),
('PRESIDENCIA', 101, 1, 101, 39, 1, 10, NOW()),
('RECURSOS FISICOS', 25, 1, 25, 24, 1, 10, NOW()),
('Administración Agrario Digital', 25, 1, 25, 29, 1, 10, NOW()),
('RED ANTIOQUIA NORTE', 150, 1, 150, 1, 7, 1, NOW()),
('RED ANTIOQUIA SUR', 150, 1, 150, 3, 4, 1, NOW()),
('RED BOGOTA CENTRO', 25, 1, 25, 53, 25, 2, NOW()),
('RED BOGOTA NORTE', 25, 1, 25, 13, 15, 2, NOW()),
('RED BOGOTA SUR', 25, 1, 25, 58, 6, 2, NOW()),
('RED BUCARAMANGA', 101, 1, 101, 18, 2, 3, NOW()),
('RED BUCARAMANGA METROPOLITANA', 101, 1, 101, 41, 28, 3, NOW()),
('RED CALI', 12, 1, 12, 21, 26, 3, NOW()),
('RED CARIBE ATLANTICO', 104, 1, 104, 49, 14, 4, NOW()),
('RED CARIBE BOLIVAR', 104, 1, 104, 20, 31, 4, NOW()),
('RED CAUCA Y NARIÑO', 173, 1, 173, 50, 18, 3, NOW()),
('RED CENTRO ORIENTE', 150, 1, 150, 2, 33, 1, NOW()),
('RED CESAR Y GUAJIRA', 96, 1, 96, 47, 3, 4, NOW()),
('RED CHAPINERO', 25, 1, 25, 36, 21, 2, NOW()),
('RED CUNDIBOYACENSE', 1182, 1, 1182, 31, 8, 4, NOW()),
('RED EJE CAFETERO NORTE', 160, 1, 160, 50, 12, 3, NOW()),
('RED EJE CAFETERO SUR', 138, 1, 138, 11, 17, 4, NOW()),
('RED HUILA Y SUR', 16, 1, 16, 51, 5, 1, NOW()),
('RED LLANOS', 154, 1, 154, 30, 13, 4, NOW()),
('RED MEDELLIN SUR', 150, 1, 150, 42, 4, 1, NOW()),
('RED METROPOLITANA', 25, 1, 25, 14, 24, 2, NOW()),
('RED NOROCCIDENTE', 25, 1, 25, 58, 22, 2, NOW()),
('RED OCCIDENTE', 25, 1, 25, 45, 29, 2, NOW()),
('RED PALMIRA Y SUR', 1, 1, 1, 50, 36, 3, NOW()),
('RED REVAL SUPERNUMERARIOS', 25, 1, 25, 58, 24, 2, NOW()),
('RED SANTANDERES', 105, 1, 105, 5, 9, 4, NOW()),
('RED SINU Y SABANAS', 112, 1, 112, 46, 10, 1, NOW()),
('RED TOLIMA', 191, 1, 191, 26, 11, 1, NOW()),
('RED VALLE CENTRO NORTE', 114, 1, 114, 50, 16, 3, NOW()),
('RED VALLE SUR', 12, 1, 12, 15, 20, 3, NOW()),
('RIESGOS Y SEGURIDAD', 25, 1, 25, 25, 1, 10, NOW()),
('RM - Acueducto Villavicencio', 154, 1, 154, 30, 13, 4, NOW()),
('RM - Bosa', 25, 1, 25, 55, 6, 2, NOW()),
('RM - Castilla', 150, 1, 150, 1, 7, 1, NOW()),
('RM - Jardin Plaza', 12, 1, 12, 15, 20, 3, NOW()),
('RM - San Javier', 150, 1, 150, 1, 7, 1, NOW()),
('SNR - Palmira', 1, 1, 1, 44, 36, 3, NOW()),
('SUB IBAGUÉ', 120, 1, 120, NULL, 11, 1, NOW()),
('SUB ISNOS', 1421, 1, 1421, NULL, 5, 1, NOW()),
('SUB ITAGÜI', 151, 1, 151, NULL, 4, 1, NOW()),
('EXT BAGR MAICAO', 113, 1, 113, NULL, 3, 4, NOW()),
('SUB NAZARETH', 1150, 1, 1150, NULL, 31, 4, NOW()),
('SUB ORTEGA', 125, 1, 125, NULL, 11, 1, NOW()),
('SUB PALERMO', 1210, 1, 1210, NULL, 5, 1, NOW()),
('EXT BAGR PEREIRA', 138, 1, 138, NULL, 17, 4, NOW()),
('SUB PROVIDENCIA', 1301, 1, 1301, NULL, 18, 3, NOW()),
('Luka RM - Restrepo', 155, 1, 155, NULL, 13, 4, NOW()),
('SUB SAN JUAN DE URABA', 1400, 1, 1400, NULL, 10, 1, NOW()),
('BAGR - Santander de Quilichao', 174, 1, 174, NULL, 20, 3, NOW()),
('EXT BAGR - TUMACO', 175, 1, 175, NULL, 18, 3, NOW()),
('SUPER BANCO AGRARIO', NULL, 1, NULL, NULL, 99, 99, NOW()),
('SUPER BCO OCCIDENTE', NULL, 1, NULL, 42, 99, 99, NOW()),
('SUPER BCO POPULAR', NULL, 1, NULL, 50, 99, 99, NOW()),
('SUPER BOGOTA', NULL, 1, NULL, 12, 99, 99, NOW()),
('SUPER ITAU', NULL, 1, NULL, 54, 99, 99, NOW()),
('SUPERNUMERARIO RED BOGOTA NORTE', 25, 1, 25, 13, 15, 2, NOW()),
('SUPERNUMERARIO RED BOGOTA SUR', 25, 1, 25, 55, 6, 2, NOW()),
('SUPERNUMERARIO RED CALI', 12, 1, 12, 21, 26, 3, NOW()),
('VUS - Cc Altavista', 25, 1, 25, 14, 24, 2, NOW()),
('VUS - Cc Nuestro Bogota', 25, 1, 25, 12, 22, 2, NOW()),
('RM - Pitalito Dav', 191, 1, 191, 32, 5, 1, NOW());

INSERT INTO master_client (name, status_id) VALUES 
('REVAL', 1),
('FUERZA DE VENTA EN CAMPO', 1),
('LUKA', 1),
('RED', 1),
('MULTIPAGAS', 1),
('BANCO AGRARIO', 1),
('BANCO DE BOGOTA INHOUSE', 1),
('BANCO DE BOGOTA', 1),
('GESTORIA', 1),
('BBVA', 1),
('BANCO CAJA SOCIAL', 1),
('BANCO DEL OCCIDENTE', 1),
('BANCO POPULAR', 1),
('CITIBANK', 1),
('COOPCENTRAL', 1),
('DAVIVIENDA', 1),
('FINCOMERCIO', 1),
('GESTORIA DE RED', 1),
('BANCO ITAU', 1),
('JARDIN BOTANICO', 1),
('CB MOVIL', 1),
('BANCOLOMBIA', 1),
('MULTIPRODUCTO', 1),
('DAVIPLATA', 1),
('AV VILLAS', 1),
('SCARE', 1);

INSERT INTO master_client (name, status_id) VALUES 
('REVAL', 1),
('FUERZA DE VENTA EN CAMPO', 1),
('LUKA', 1),
('RED', 1),
('MULTIPAGAS', 1),
('BANCO AGRARIO', 1),
('BANCO DE BOGOTA INHOUSE', 1),
('BANCO DE BOGOTA', 1),
('GESTORIA', 1),
('BBVA', 1),
('BANCO CAJA SOCIAL', 1),
('BANCO DEL OCCIDENTE', 1),
('BANCO POPULAR', 1),
('CITIBANK', 1),
('COOPCENTRAL', 1),
('DAVIVIENDA', 1),
('FINCOMERCIO', 1),
('GESTORIA DE RED', 1),
('BANCO ITAU', 1),
('JARDIN BOTANICO', 1),
('CB MOVIL', 1),
('BANCOLOMBIA', 1),
('MULTIPRODUCTO', 1),
('DAVIPLATA', 1),
('AV VILLAS', 1),
('SCARE', 1);

INSERT INTO master_company (name, status_id) VALUES 
('MULTIPAGAS', 1),
('REVAL', 1);

-- Asegúrate de que el nombre de la tabla sea el correcto (MASTER_UNIT o similar)
SET SQL_SAFE_UPDATES = 0;

UPDATE MASTER_UNIT 
SET name = 'U. TRANSACCIONAL' 
WHERE name = 'TRANSACCIONAL';

UPDATE MASTER_UNIT 
SET name = 'ESPECIALIZADO' 
WHERE name = 'ESPECIALIZADA';

-- CONSULTAS DE CENTRO DE COSTOS
SELECT * FROM MASTER_REGIONAL;
SELECT * FROM master_cities;
SELECT * FROM master_area;
SELECT * FROM MASTER_LEADER;
SELECT * FROM MASTER_OFFICES;
SELECT * FROM MASTER_CLIENT;
SELECT * FROM MASTER_DEPARTAMENT;
SELECT * FROM COST_CENTER;
SELECT * FROM MASTER_UNIT;
SELECT * FROM USERS;
SELECT * FROM MASTER_COMPANY;

-- CONSULTAS DE ORDEN DE CONTRATACION
SELECT * FROM HIRING_ORDER;
SELECT * FROM OPERATION_PLANT;
SELECT * FROM MASTER_CONTRACTS; -- No tiene informacion
SELECT * FROM MASTER_JOB_TITLES; -- no tiene informacion
SELECT * FROM MASTER_CLIENT;
SELECT * FROM USERS;
SELECT * FROM COST_CENTER;
SELECT * FROM MASTER_OFFICES;
SELECT * FROM master_cities;
SELECT * FROM MASTER_LEADER;

-- CONSULTAS PEOPLE

SELECT * FROM PEOPLE;
SELECT * FROM MASTER_TYPE_GENDER;

-- SCRIPS UNIENDO LAS LLAVES PRIMARIAS DE LAS MAESTRAS CON ORDEN DE CONTRATACION

-- =============================================
-- FK CONSTRAINTS - Tabla: HIRING_ORDER
-- Base de datos: talentohumano360
-- Motor: SQL Server
-- =============================================

USE talentohumano360;

-- =============================================
-- FK CONSTRAINTS - MySQL
-- Base de datos: talentohumano360
-- =============================================

USE talentohumano360;

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_plant
    FOREIGN KEY (plant_id)
    REFERENCES OPERATION_PLANT (plant_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_office
    FOREIGN KEY (office_id)
    REFERENCES MASTER_OFFICES (office_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_contract
    FOREIGN KEY (contract_id)
    REFERENCES MASTER_CONTRACTS (contract_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_city
    FOREIGN KEY (city_id)
    REFERENCES master_cities (city_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_client
    FOREIGN KEY (client_id)
    REFERENCES MASTER_CLIENT (client_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_cost_center
    FOREIGN KEY (cost_center_id)
    REFERENCES COST_CENTER (cost_center_id);
    

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_leader
    FOREIGN KEY (leader_id)
    REFERENCES MASTER_LEADER (leader_id);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_job
    FOREIGN KEY (id_job)
    REFERENCES MASTER_JOB_TITLES (id_job);

ALTER TABLE HIRING_ORDER
ADD CONSTRAINT FK_HIRING_ORDER_user
    FOREIGN KEY (user_id)
    REFERENCES USERS (user_id);
    
    
-- Master de contratos

INSERT INTO master_contracts (type_contract, name_contract, status_id) VALUES 
('INDEFINIDO', 'INDEFINIDO', 1),
('INTEGRAL', 'INTEGRAL', 1),
('OBRA O LABOR', 'OBRA O LABOR', 1),
('INDEFINIDO - DIAS', 'INDEFINIDO - DIAS', 1),
('FIJO', 'FIJO', 1),
('APRENDIZAJE', 'APRENDIZAJE', 1),
('APRENDIZAJE FIJO - LECTIVO', 'APRENDIZAJE FIJO - LECTIVO', 1),
('INDEFINIDO 4 HORAS', 'INDEFINIDO 4 HORAS', 1),
('FIJO 4 HORAS', 'FIJO 4 HORAS', 1),
('FIJO 6 HORAS', 'FIJO 6 HORAS', 1),
('OBRA O LABOR 4 HORAS', 'OBRA O LABOR 4 HORAS', 1),
('INDEFINIDO 6 HORAS', 'INDEFINIDO 6 HORAS', 1),
('OBRA O LABOR 6 HORAS', 'OBRA O LABOR 6 HORAS', 1);


INSERT INTO master_level_education (type_education) VALUES 
('Educación inicial'),
('Educación preescolar'),
('Educación básica primaria'),
('Educación básica secundaria'),
('Educación técnica profesional'),
('Educación tecnológica'),
('Educación universitaria'),
('Especialización'),
('Maestría'),
('Doctorado');


INSERT INTO master_eps (name_eps, status_id) VALUES 
('Nueva EPS', 1),
('Coosalud EPS', 1),
('Mutual SER', 1),
('Salud Mía', 1),
('Aliansalud EPS', 1),
('Salud Total EPS', 1),
('Sanitas EPS', 1),
('SURA EPS', 1),
('Famisanar', 1),
('Servicio Occidental de Salud (SOS)', 1),
('Comfenalco Valle', 1),
('Compensar EPS', 1),
('EPM (Empresas Públicas de Medellín)', 1),
('Fondo de Pasivo Social de Ferrocarriles Nacionales', 1),
('Cajacopi Atlántico', 1),
('Capresoca', 1),
('Comfachocó', 1),
('Comfaoriente', 1),
('EPS Familiar de Colombia', 1),
('Asmet Salud', 1),
('Emssanar', 1),
('Capital Salud', 1),
('Savia Salud', 1),
('Dusakawi EPSI', 1),
('Asociación Indígena del Cauca (AIC EPSI)', 1),
('Anas Wayuu EPSI', 1),
('Mallamas EPSI', 1),
('Pijaos Salud EPSI', 1);


INSERT INTO master_pension (name_fund, status_id) VALUES 
('Colpensiones', 1),
('Porvenir', 1),
('Protección', 1),
('Colfondos', 1),
('Skandia', 1);


INSERT INTO master_compensation_box (name_compesation_box, status_id) VALUES 
('Colsubsidio', 1),
('Compensar', 1),
('Cafam', 1),
('Comfama', 1),
('Comfenalco Antioquia', 1),
('Confa', 1),
('Comfamiliar Risaralda', 1),
('Comfenalco Quindío', 1),
('Cajasan', 1),
('Comfenalco Santander', 1),
('Comfanorte', 1),
('Comfaoriente', 1),
('Combarranquilla', 1),
('Comfamiliar Atlántico', 1),
('Cajacopi', 1),
('Comfenalco Cartagena', 1),
('Comfamiliar Cartagena', 1),
('Comfacor', 1),
('Comfacesar', 1),
('Cajamag', 1),
('Comfaguajira', 1),
('Comfasucre', 1),
('Comfandi', 1),
('Comfenalco Valle', 1),
('Comfacauca', 1),
('Comfachocó', 1),
('Comfamiliar Nariño', 1),
('Comfenalco Tolima', 1),
('Comfatolima', 1),
('Comfamiliar Huila', 1),
('Cofrem', 1),
('Comfaboy', 1),
('Comfacundi', 1),
('Comfiar', 1),
('Comfacasanare', 1),
('Comfaca', 1),
('Comfamiliar Putumayo', 1),
('Comfaguaviare', 1),
('Comfamac', 1),
('Comfavic', 1),
('Cafaba', 1),
('Cajasai', 1);

INSERT INTO master_medical (type_medical_condition, status_id) VALUES 
('Hipertensión', 1),
('Diabetes', 1),
('Asma', 1),
('Enfermedad pulmonar obstructiva crónica', 1),
('Enfermedades cardíacas', 1),
('Arritmias', 1),
('Epilepsia', 1),
('Migraña crónica', 1),
('Trastornos de ansiedad', 1),
('Depresión', 1),
('Trastorno bipolar', 1),
('Esquizofrenia', 1),
('Trastornos del sueño', 1),
('Apnea del sueño', 1),
('Problemas de columna', 1),
('Hernias discales', 1),
('Lesiones osteomusculares', 1),
('Artritis', 1),
('Artrosis', 1),
('Problemas de rodilla', 1),
('Problemas de visión', 1),
('Problemas auditivos', 1),
('Alergias', 1),
('Enfermedades autoinmunes', 1),
('Lupus', 1),
('Cáncer', 1),
('Enfermedades renales', 1),
('Enfermedades hepáticas', 1),
('VIH', 1),
('Enfermedades de transmisión sexual', 1),
('Embarazo', 1),
('Discapacidad física', 1),
('Discapacidad cognitiva', 1),
('Discapacidad sensorial', 1),
('Cirugías recientes', 1),
('Uso de medicamentos permanentes', 1),
('Consumo de sustancias psicoactivas', 1),
('Tabaquismo', 1),
('Alcoholismo', 1);

INSERT INTO master_arl (name_arl, status_id) VALUES 
('ARL SURA', 1),
('POSITIVA Compañía de Seguros', 1),
('Colmena Seguros', 1),
('Seguros Bolívar', 1),
('La Equidad Seguros', 1),
('Mapfre Colombia', 1),
('AXA Colpatria', 1),
('Seguros Alfa', 1),
('Liberty Seguros', 1);


-- TABLA DE PEOPLE

-- =============================================
-- FK CONSTRAINTS - SISTEMA COMPLETO PEOPLE
-- Base de datos: talentohumano360
-- Motor: MySQL
-- =============================================

USE talentohumano360;

-- =============================================
-- TABLA: PEOPLE
-- =============================================

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_type_document
    FOREIGN KEY (type_id)
    REFERENCES MASTER_TYPE_DOCUMENT (type_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_gender
    FOREIGN KEY (gender_id)
    REFERENCES MASTER_TYPE_GENDER (gender_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_details
    FOREIGN KEY (details_id)
    REFERENCES PEOPLE_DETAILS (details_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_housing_city
    FOREIGN KEY (housing_city_id)
    REFERENCES master_cities (city_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_city_births
    FOREIGN KEY (city_births_id)
    REFERENCES master_cities (city_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_business
    FOREIGN KEY (people_business_id)
    REFERENCES BUSINESS_PEOPLE_DATA (people_business_id);

ALTER TABLE PEOPLE
ADD CONSTRAINT FK_PEOPLE_departament
    FOREIGN KEY (departament_id)
    REFERENCES MASTER_DEPARTAMENT (departament_id);

-- =============================================
-- TABLA: PEOPLE_DETAILS
-- =============================================

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_orientation
    FOREIGN KEY (orientation_id)
    REFERENCES MASTER_SEXUAL_ORIENTATION (orientation_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_special_population
    FOREIGN KEY (special_population_id)
    REFERENCES MASTER_SPECIAL_POPULATION (special_population_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_ethnic
    FOREIGN KEY (ethnic_id)
    REFERENCES MASTER_ETHNIC_GROUP (ethnic_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_blood
    FOREIGN KEY (blood_id)
    REFERENCES MASTER_TYPE_BLOOD (blood_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_housing
    FOREIGN KEY (housing_id)
    REFERENCES MASTER_TYPE_HOUSING (housing_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES MASTER_TYPE_VEHICLE (vehicle_id);

ALTER TABLE PEOPLE_DETAILS
ADD CONSTRAINT FK_PDETAILS_status_endowment
    FOREIGN KEY (status_endowment)
    REFERENCES MASTER_STATUS_ENDOWMENT (status_id);

-- =============================================
-- TABLA: PEOPLE_EXTENDED_INFO
-- =============================================

ALTER TABLE PEOPLE_EXTENDED_INFO
ADD CONSTRAINT FK_PEXT_people
    FOREIGN KEY (people_id)
    REFERENCES PEOPLE (people_id);

ALTER TABLE PEOPLE_EXTENDED_INFO
ADD CONSTRAINT FK_PEXT_level_education
    FOREIGN KEY (level_education_id)
    REFERENCES MASTER_LEVEL_EDUCATION (level_education_id);

ALTER TABLE PEOPLE_EXTENDED_INFO
ADD CONSTRAINT FK_PEXT_title_education
    FOREIGN KEY (title_education_id)
    REFERENCES MASTER_TITLE_EDUCATION (title_education_id);

-- =============================================
-- TABLA: HEALT_SECURITY (tabla de seguridad social)
-- =============================================

ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_people
    FOREIGN KEY (people_id)
    REFERENCES PEOPLE (people_id);

ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_eps
    FOREIGN KEY (eps_id)
    REFERENCES MASTER_EPS (eps_id);

ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_pension
    FOREIGN KEY (pension_id)
    REFERENCES MASTER_PENSION (pension_id);

ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_compensation_box
    FOREIGN KEY (compensation_box_id)
    REFERENCES MASTER_COMPENSATION_BOX (compesation_box_id);
    
    DESCRIBE MASTER_COMPENSATION_BOX;
    SELECT * FROM PEOPLE_HEALT_SECURITY;
	SHOW TABLES LIKE '%COMP%';
    
    
ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_medical_conditions
    FOREIGN KEY (medical_conditions_id)
    REFERENCES MASTER_MEDICAL (medical_condition_id);

ALTER TABLE PEOPLE_HEALT_SECURITY
ADD CONSTRAINT FK_HSECURITY_arl
    FOREIGN KEY (arl_id)
    REFERENCES MASTER_ARL (arl_id);

-- =============================================
-- TABLA: BUSINESS_PEOPLE_DATA
-- =============================================

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_client
    FOREIGN KEY (client_id)
    REFERENCES MASTER_CLIENT (client_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_city_work
    FOREIGN KEY (city_work_id)
    REFERENCES master_cities (city_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_contract
    FOREIGN KEY (contract_id)
    REFERENCES MASTER_CONTRACTS (contract_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_leader
    FOREIGN KEY (leader_id)
    REFERENCES MASTER_LEADER (leader_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_cost_center
    FOREIGN KEY (cost_center_id)
    REFERENCES COST_CENTER (cost_center_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_type_people
    FOREIGN KEY (type_people_id)
    REFERENCES MASTER_TYPE_PEOPLE (type_people_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_company
    FOREIGN KEY (company_id)
    REFERENCES MASTER_COMPANY (company_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_area
    FOREIGN KEY (area_id)
    REFERENCES MASTER_AREA (area_id);

ALTER TABLE BUSINESS_PEOPLE_DATA
ADD CONSTRAINT FK_BDATA_order
    FOREIGN KEY (order_id)
    REFERENCES HIRING_ORDER (order_id);

